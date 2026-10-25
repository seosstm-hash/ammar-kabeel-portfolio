import test from "node:test";
import assert from "node:assert/strict";
import { createHandler } from "../supabase/functions/_shared/handler.mjs";
import {
  validateContent,
  validateUploads,
} from "../supabase/functions/_shared/validation.mjs";
import defaults from "../data/site-content.json" with { type: "json" };
const SHA = "a".repeat(40),
  HEAD = "b".repeat(40),
  TREE = "c".repeat(40),
  COMMIT = "d".repeat(40),
  BLOB = "e".repeat(40);
const env = {
  SUPABASE_URL: "https://test.supabase.co",
  SUPABASE_ANON_KEY: "public-key",
  ADMIN_USER_ID: "owner-user",
  GITHUB_TOKEN: "server-only-secret",
};
function request(body, options = {}) {
  return new Request("https://test.supabase.co/functions/v1/portfolio-admin", {
    method: "POST",
    headers: {
      Origin: "https://seosstm-hash.github.io",
      Authorization: "Bearer user-session",
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: JSON.stringify(body),
  });
}
function setup(options = {}) {
  const calls = [];
  const transport = async (url, init = {}) => {
    const body = init.body ? JSON.parse(init.body) : undefined;
    calls.push({ url, init, body });
    const json = (data, status = 200) => Response.json(data, { status });
    if (url.endsWith("/auth/v1/user"))
      return json(
        options.user ?? { id: "owner-user", email_confirmed_at: "2026-01-01" },
        options.authStatus ?? 200,
      );
    if (url.includes("/git/ref/heads/main"))
      return json({ object: { sha: HEAD } });
    if (url.includes("/contents/data/site-content.json"))
      return json({
        sha: options.contentSha ?? SHA,
        content: Buffer.from(JSON.stringify(defaults)).toString("base64"),
      });
    if (url.includes(`/git/commits/${HEAD}`))
      return json({ tree: { sha: TREE } });
    if (url.includes("/git/trees/") && init.method === "GET")
      return json({
        tree: [
          { path: "public" + defaults.profile.photo, type: "blob" },
          { path: "public" + defaults.profile.cv, type: "blob" },
          ...defaults.clients.map((c) => ({
            path: "public" + c.logo,
            type: "blob",
          })),
        ],
        truncated: false,
      });
    if (url.endsWith("/git/blobs")) return json({ sha: BLOB });
    if (url.endsWith("/git/trees")) return json({ sha: TREE });
    if (url.endsWith("/git/commits")) return json({ sha: COMMIT });
    if (url.endsWith("/git/refs/heads/main"))
      return json({ ref: "refs/heads/main" }, options.race ? 422 : 200);
    if (url.includes("/actions/workflows/"))
      return json({
        workflow_runs: [
          {
            head_sha: COMMIT,
            status: "completed",
            conclusion: "success",
            html_url:
              "https://github.com/seosstm-hash/ammar-kabeel-portfolio/actions/runs/1",
          },
        ],
      });
    throw Error("Unexpected mocked URL " + url);
  };
  return { handler: createHandler(env, transport), calls };
}
const save = () => ({
  action: "save",
  content: structuredClone(defaults),
  contentSha: SHA,
  uploads: [],
});
test("missing credentials fail before any remote call", async () => {
  const { handler, calls } = setup();
  const r = await handler(
    request({ action: "load" }, { headers: { Authorization: "" } }),
  );
  assert.equal(r.status, 401);
  assert.equal(calls.length, 0);
});
test("untrusted origins cannot invoke auth or GitHub", async () => {
  const { handler, calls } = setup();
  const r = await handler(
    request(save(), { headers: { Origin: "https://attacker.example" } }),
  );
  assert.equal(r.status, 403);
  assert.equal(calls.length, 0);
});
test("expired/forged token rejected by real Auth verification", async () => {
  const { handler, calls } = setup({ authStatus: 401 });
  const r = await handler(request(save()));
  assert.equal(r.status, 401);
  assert.equal(calls.length, 1);
  assert.ok(!JSON.stringify(await r.json()).includes(env.GITHUB_TOKEN));
});
test("valid but non-admin user cannot read or publish", async () => {
  const { handler, calls } = setup({
    user: { id: "other-user", email_confirmed_at: "now" },
  });
  assert.equal((await handler(request(save()))).status, 403);
  assert.equal(calls.length, 1);
});
test("unconfirmed owner is denied", async () => {
  const { handler } = setup({ user: { id: "owner-user" } });
  assert.equal((await handler(request({ action: "load" }))).status, 403);
});
test("missing backend configuration fails closed", async () => {
  const handler = createHandler({ ...env, ADMIN_USER_ID: "" }, () => {
    throw Error("must not call");
  });
  assert.equal((await handler(request({ action: "load" }))).status, 503);
});
test("load reads pinned main commit and returns Unicode content", async () => {
  const { handler, calls } = setup();
  const response = await handler(request({ action: "load" }));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.deepEqual(result.content, defaults);
  assert.equal(result.contentSha, SHA);
  assert.ok(calls.some((c) => c.url.endsWith(`?ref=${HEAD}`)));
});
test("stale edit returns conflict and never writes", async () => {
  const { handler, calls } = setup({ contentSha: "f".repeat(40) });
  assert.equal((await handler(request(save()))).status, 409);
  assert.ok(!calls.some((c) => c.init.method === "POST"));
});
test("save creates an atomic commit and never force pushes", async () => {
  const { handler, calls } = setup();
  const response = await handler(request(save()));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { commit: COMMIT, contentSha: BLOB });
  const commit = calls.find((c) => c.url.endsWith("/git/commits"));
  assert.deepEqual(commit.body.parents, [HEAD]);
  const write = calls.at(-1);
  assert.equal(write.init.method, "PATCH");
  assert.deepEqual(write.body, { sha: COMMIT, force: false });
  const blob = calls.find((c) => c.url.endsWith("/git/blobs"));
  assert.deepEqual(JSON.parse(blob.body.content), defaults);
  assert.ok(!blob.body.content.includes(env.GITHUB_TOKEN));
});
test("main moving during save rejects fast-forward without retrying", async () => {
  const { handler, calls } = setup({ race: true });
  assert.equal((await handler(request(save()))).status, 409);
  assert.equal(calls.filter((c) => c.init.method === "PATCH").length, 1);
  assert.equal(calls.at(-1).body.force, false);
});
test("invalid content is rejected before any GitHub operation", async () => {
  const { handler, calls } = setup();
  const body = save();
  body.content.extra = "malicious";
  assert.equal((await handler(request(body))).status, 400);
  assert.equal(calls.length, 1);
});
test("unsafe image/URL/navigation content is rejected", () => {
  for (const mutate of [
    (c) => (c.profile.photo = "https://attacker.example/track.png"),
    (c) => (c.contact.linkedin = "javascript:alert(1)"),
    (c) => (c.content.ar.nav[0][1] = "//attacker.example"),
    (c) => (c.profile.cv = "/uploads/evil.html"),
  ]) {
    const content = structuredClone(defaults);
    mutate(content);
    assert.throws(() => validateContent(content));
  }
});
test("missing asset prevents commit", async () => {
  const { handler, calls } = setup();
  const body = save();
  body.content.profile.photo = "/uploads/missing.png";
  assert.equal((await handler(request(body))).status, 400);
  assert.ok(!calls.some((c) => c.url.endsWith("/git/blobs")));
});
test("upload signatures, names and digests are verified", async () => {
  const content = structuredClone(defaults);
  const data = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const hash = Buffer.from(
    await crypto.subtle.digest("SHA-256", data),
  ).toString("hex");
  const file = {
    path: `uploads/${hash}.png`,
    content: data.toString("base64"),
  };
  content.profile.photo = "/" + file.path;
  await validateUploads([file], content);
  await assert.rejects(() =>
    validateUploads(
      [{ ...file, content: Buffer.from("<svg/>").toString("base64") }],
      content,
    ),
  );
  await assert.rejects(() =>
    validateUploads([{ ...file, path: "../evil.png" }], content),
  );
  await assert.rejects(() => validateUploads([file, file], content));
});
test("oversized requests are rejected without processing content", async () => {
  const { handler, calls } = setup();
  assert.equal(
    (
      await handler(
        request(save(), {
          headers: { "Content-Length": String(12 * 1024 * 1024) },
        }),
      )
    ).status,
    413,
  );
  assert.equal(calls.length, 1);
});
test("deployment polling is restricted to the Pages workflow and commit", async () => {
  const { handler, calls } = setup();
  const r = await handler(request({ action: "status", commit: COMMIT }));
  assert.equal((await r.json()).conclusion, "success");
  assert.ok(
    calls
      .at(-1)
      .url.endsWith(
        `actions/workflows/deploy-pages.yml/runs?head_sha=${COMMIT}&per_page=1`,
      ),
  );
  assert.equal(
    (await handler(request({ action: "status", commit: "../../secrets" })))
      .status,
    400,
  );
});
