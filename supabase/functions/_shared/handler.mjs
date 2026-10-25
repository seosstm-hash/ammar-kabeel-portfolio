import { HttpError, validateContent, validateUploads } from "./validation.mjs";
const REPO = "seosstm-hash/ammar-kabeel-portfolio";
const CONTENT_PATH = "data/site-content.json";
const MAX_BODY = 10 * 1024 * 1024;
export function createHandler(env, transport = fetch) {
  return async function handler(request) {
    const origin = env.ALLOWED_ORIGIN || "https://seosstm-hash.github.io";
    const headers = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "authorization, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      Vary: "Origin",
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    };
    const respond = (data, status = 200) =>
      new Response(JSON.stringify(data), { status, headers });
    try {
      if (request.headers.get("Origin") !== origin)
        throw new HttpError(403, "مصدر الطلب غير مسموح.");
      if (request.method === "OPTIONS")
        return new Response(null, { status: 204, headers });
      if (request.method !== "POST")
        throw new HttpError(405, "طريقة الطلب غير مدعومة.");
      let publicKey = env.SUPABASE_ANON_KEY || env.AUTH_PUBLISHABLE_KEY;
      if (!publicKey && env.SUPABASE_PUBLISHABLE_KEYS)
        publicKey = JSON.parse(env.SUPABASE_PUBLISHABLE_KEYS).default;
      if (
        !env.SUPABASE_URL ||
        !publicKey ||
        !env.ADMIN_USER_ID ||
        !env.GITHUB_TOKEN
      )
        throw new HttpError(503, "لم يكتمل إعداد خدمة لوحة التحكم.");
      const auth = request.headers.get("Authorization");
      if (!auth || !/^Bearer [^\s]+$/.test(auth) || auth.length > 10000)
        throw new HttpError(401, "يلزم تسجيل الدخول.");
      // Verify with Auth on EVERY request. Never trust decoded JWT data or a browser-supplied user ID.
      const verification = await transport(`${env.SUPABASE_URL}/auth/v1/user`, {
        headers: { apikey: publicKey, Authorization: auth },
        signal: AbortSignal.timeout(15000),
      });
      if (!verification.ok)
        throw new HttpError(401, "الجلسة غير صالحة. سجّل الدخول مجددًا.");
      const user = await verification.json();
      if (
        user.id !== env.ADMIN_USER_ID ||
        !user.email_confirmed_at ||
        user.is_anonymous
      )
        throw new HttpError(403, "هذا الحساب غير مخوّل لإدارة الموقع.");
      if (!request.headers.get("Content-Type")?.startsWith("application/json"))
        throw new HttpError(415, "نوع الطلب غير مدعوم.");
      if (Number(request.headers.get("Content-Length")) > MAX_BODY)
        throw new HttpError(
          413,
          "حجم الطلب كبير. ارفع عددًا أقل من الصور في المرة الواحدة.",
        );
      const reader = request.body?.getReader();
      let length = 0;
      const parts = [];
      if (!reader) throw new HttpError(400, "طلب فارغ.");
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        length += value.length;
        if (length > MAX_BODY) {
          await reader.cancel();
          throw new HttpError(413, "حجم الطلب كبير.");
        }
        parts.push(value);
      }
      const bytes = new Uint8Array(length);
      let offset = 0;
      for (const part of parts) {
        bytes.set(part, offset);
        offset += part.length;
      }
      let body;
      try {
        body = JSON.parse(new TextDecoder().decode(bytes));
      } catch {
        throw new HttpError(400, "بيانات JSON غير صالحة.");
      }
      if (!body || typeof body !== "object" || Array.isArray(body))
        throw new HttpError(400, "طلب غير صالح.");
      async function github(path, method = "GET", payload) {
        const response = await transport(
          `https://api.github.com/repos/${REPO}/${path}`,
          {
            method,
            headers: {
              Authorization: `Bearer ${env.GITHUB_TOKEN}`,
              Accept: "application/vnd.github+json",
              "X-GitHub-Api-Version": "2022-11-28",
              "User-Agent": "Ammar-Kabeel-Admin",
              ...(payload ? { "Content-Type": "application/json" } : {}),
            },
            ...(payload ? { body: JSON.stringify(payload) } : {}),
            signal: AbortSignal.timeout(20000),
          },
        );
        if (!response.ok) {
          if (response.status === 409 || response.status === 422)
            throw new HttpError(
              409,
              "المستودع اتغير أثناء التعديل. احتفظ بتعديلاتك ثم أعد تحميل أحدث نسخة قبل النشر.",
            );
          throw new HttpError(
            502,
            "تعذر التواصل مع GitHub. راجع صلاحية مفتاح النشر وحالة الخدمة.",
          );
        }
        return response.json();
      }
      async function current() {
        const ref = await github("git/ref/heads/main");
        const head = ref.object.sha;
        const [file, commit] = await Promise.all([
          github(`contents/${CONTENT_PATH}?ref=${head}`),
          github(`git/commits/${head}`),
        ]);
        return { head, file, tree: commit.tree.sha };
      }
      if (body.action === "load") {
        const { file } = await current();
        const raw = Uint8Array.from(
          atob(file.content.replace(/\s/g, "")),
          (c) => c.charCodeAt(0),
        );
        const content = validateContent(
          JSON.parse(new TextDecoder().decode(raw)),
        );
        return respond({ content, contentSha: file.sha });
      }
      if (body.action === "status") {
        if (!/^[a-f0-9]{40}$/.test(body.commit))
          throw new HttpError(400, "معرّف النشر غير صالح.");
        const runs = await github(
          `actions/workflows/deploy-pages.yml/runs?head_sha=${body.commit}&per_page=1`,
        );
        const run = runs.workflow_runs?.[0];
        return respond(
          run
            ? {
                status: run.status,
                conclusion: run.conclusion,
                url: run.html_url,
              }
            : { status: "queued", conclusion: null },
        );
      }
      if (body.action !== "save") throw new HttpError(400, "عملية غير معروفة.");
      const content = validateContent(body.content);
      const uploads = await validateUploads(body.uploads ?? [], content);
      if (!/^[a-f0-9]{40}$/.test(body.contentSha))
        throw new HttpError(400, "نسخة المحتوى غير صالحة.");
      const { head, file, tree } = await current();
      if (file.sha !== body.contentSha)
        throw new HttpError(
          409,
          "المحتوى اتعدل من جلسة أخرى. احتفظ بتعديلاتك ثم أعد تحميل أحدث نسخة قبل النشر.",
        );
      // Ensure referenced images/PDF exist in this commit or are included in this atomic save.
      const assets = await github(`git/trees/${tree}?recursive=1`);
      if (assets.truncated)
        throw new HttpError(502, "تعذر التحقق من ملفات الموقع.");
      const available = new Set(
        assets.tree
          .filter(
            (entry) =>
              entry.type === "blob" && entry.path.startsWith("public/"),
          )
          .map((entry) => `/${entry.path.replace(/^public\//, "")}`),
      );
      for (const upload of uploads) available.add(`/${upload.path}`);
      const refs = [
        content.profile.photo,
        content.profile.cv,
        ...content.clients.map((c) => c.logo),
        ...content.workItems.map((w) => w.image),
      ];
      if (refs.some((path) => !available.has(path)))
        throw new HttpError(
          400,
          "صورة أو ملف غير موجود. ارفع الصورة أو استخدم مسار ملف موجود.",
        );
      const contentBlob = await github("git/blobs", "POST", {
        content: `${JSON.stringify(content, null, 2)}\n`,
        encoding: "utf-8",
      });
      const entries = [
        {
          path: CONTENT_PATH,
          mode: "100644",
          type: "blob",
          sha: contentBlob.sha,
        },
      ];
      for (const upload of uploads) {
        const blob = await github("git/blobs", "POST", {
          content: upload.content,
          encoding: "base64",
        });
        entries.push({
          path: `public/${upload.path}`,
          mode: "100644",
          type: "blob",
          sha: blob.sha,
        });
      }
      const newTree = await github("git/trees", "POST", {
        base_tree: tree,
        tree: entries,
      });
      const commit = await github("git/commits", "POST", {
        message: "Update website content from admin dashboard",
        tree: newTree.sha,
        parents: [head],
      });
      // Fast-forward only: a concurrent push rejects this operation, never overwrite main.
      await github("git/refs/heads/main", "PATCH", {
        sha: commit.sha,
        force: false,
      });
      return respond({ commit: commit.sha, contentSha: contentBlob.sha });
    } catch (error) {
      if (error instanceof HttpError)
        return respond({ error: error.message }, error.status);
      return respond(
        {
          error:
            "تعذر إكمال العملية. لم يتم تأكيد الحفظ؛ راجع آخر تعديل على GitHub قبل إعادة المحاولة.",
        },
        500,
      );
    }
  };
}
