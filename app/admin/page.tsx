"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import initialContent from "../../data/site-content.json";
import "./admin.css";

type Json = string | number | boolean | Json[] | { [key: string]: Json };
type Config = { supabaseUrl: string; publishableKey: string };
type Session = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
};
type Upload = { path: string; content: string };
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const tabs = [
  ["profile", "البيانات الأساسية"],
  ["ar", "المحتوى العربي"],
  ["en", "المحتوى الإنجليزي"],
  ["workItems", "الأعمال"],
  ["clients", "شعارات العملاء"],
  ["seo", "الظهور في البحث"],
];
const labels: Record<string, string> = {
  profile: "الملف الشخصي",
  photo: "الصورة الشخصية",
  cv: "مسار السيرة الذاتية PDF",
  contact: "التواصل",
  email: "البريد الإلكتروني",
  saudiPhone: "واتساب السعودية (كود الدولة ثم الرقم)",
  egyptPhone: "الرقم المصري (كود الدولة ثم الرقم)",
  linkedin: "رابط LinkedIn",
  title: "العنوان",
  description: "الوصف",
  name: "الاسم",
  logo: "الشعار",
  dark: "خلفية داكنة للشعار",
  client: "العميل",
  category: "التصنيف",
  image: "صورة العمل",
  ar: "العربية",
  en: "الإنجليزية",
  nav: "روابط القائمة",
  availability: "حالة التوفر",
  heroKicker: "العبارة أعلى الاسم",
  firstName: "الاسم الأول",
  lastName: "اسم العائلة",
  role: "المسمى الوظيفي",
  heroText: "التعريف الرئيسي",
  work: "زر الأعمال",
  location: "الموقع",
  stats: "الإحصاءات",
  aboutEyebrow: "عنوان قسم نبذة عني",
  aboutTitle: "عنوان النبذة الرئيسي",
  aboutText: "نص النبذة",
  sectors: "عنوان القطاعات",
  sectorItems: "القطاعات",
  expertiseEyebrow: "عنوان قسم التخصصات",
  expertiseTitle: "عنوان التخصصات الرئيسي",
  expertiseIntro: "مقدمة التخصصات",
  expertise: "التخصصات",
  n: "الرقم",
  text: "النص",
  workEyebrow: "عنوان قسم الأعمال",
  workTitle: "عنوان الأعمال الرئيسي",
  workIntro: "مقدمة الأعمال",
  filters: "أسماء فلاتر الأعمال",
  all: "الكل",
  seo: "تحسين محركات البحث",
  social: "السوشيال ميديا",
  copy: "كتابة المحتوى",
  viewProject: "زر عرض العمل",
  experienceEyebrow: "عنوان قسم الخبرة",
  experienceTitle: "عنوان الخبرة الرئيسي",
  experiences: "الخبرات",
  period: "الفترة",
  company: "جهة العمل",
  tools: "عنوان الأدوات",
  contactEyebrow: "عنوان قسم التواصل",
  contactTitle: "عنوان التواصل الرئيسي",
  contactText: "نص التواصل",
  whatsappSaudi: "تسمية واتساب",
  egyptNumber: "تسمية الرقم المصري",
  download: "زر تحميل السيرة",
  close: "زر إغلاق",
  rights: "نص حقوق النشر",
};
const workTemplate = {
  title: { ar: "عمل جديد", en: "New project" },
  client: "",
  category: "seo",
  image: "/portfolio/ammar-kabeel.webp",
  description: { ar: "", en: "" },
};
const clientTemplate = {
  name: "عميل جديد",
  logo: "/clients/cactus.png",
  dark: false,
};
function arrayTemplate(path: (string | number)[]): Json {
  let value = initialContent as unknown as Json;
  for (const part of path) value = (value as Record<string, Json>)[part];
  return Array.isArray(value) ? (value[0] ?? "") : "";
}
function emptyCopy(value: Json): Json {
  if (typeof value === "string") return "";
  if (Array.isArray(value)) return value.map(emptyCopy);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, emptyCopy(item)]),
    );
  return value;
}

export default function Admin() {
  const [config, setConfig] = useState<Config | null>(null);
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const session = useRef<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [draft, setDraft] = useState<Json>(initialContent as unknown as Json);
  const [baseSha, setBaseSha] = useState("");
  const [uploads, setUploads] = useState<Record<string, Upload>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [active, setActive] = useState("profile");
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [commit, setCommit] = useState("");
  const [deployment, setDeployment] = useState("");
  const [runUrl, setRunUrl] = useState("");
  useEffect(() => {
    fetch(`${BASE}/admin/config.json`, { cache: "no-store" })
      .then((r) => r.json())
      .then((c: Config) => {
        if (
          c.supabaseUrl &&
          c.publishableKey &&
          /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(c.supabaseUrl)
        )
          setConfig(c);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  async function api(action: string, body: Record<string, unknown> = {}) {
    if (!config || !session.current) throw new Error("سجّل الدخول أولًا.");
    let activeSession = session.current;
    if (activeSession.expires_at < Date.now() / 1000 + 60) {
      const refresh = await fetch(
        `${config.supabaseUrl}/auth/v1/token?grant_type=refresh_token`,
        {
          method: "POST",
          headers: {
            apikey: config.publishableKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refresh_token: session.current.refresh_token,
          }),
        },
      );
      if (!refresh.ok) {
        session.current = null;
        setAuthenticated(false);
        throw new Error("انتهت الجلسة. سجّل الدخول مجددًا.");
      }
      const data = await refresh.json();
      activeSession = {
        ...data,
        expires_at: Date.now() / 1000 + data.expires_in,
      };
      session.current = activeSession;
    }
    const response = await fetch(
      `${config.supabaseUrl}/functions/v1/portfolio-admin`,
      {
        method: "POST",
        headers: {
          apikey: config.publishableKey,
          Authorization: `Bearer ${activeSession.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, ...body }),
      },
    );
    const result = await response
      .json()
      .catch(() => ({ error: "تعذر الاتصال بخدمة النشر." }));
    if (response.status === 401) {
      session.current = null;
      setAuthenticated(false);
    }
    if (!response.ok) throw new Error(result.error ?? "تعذر تنفيذ العملية.");
    return result;
  }
  async function login(e: React.FormEvent) {
    e.preventDefault();
    if (!config) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        `${config.supabaseUrl}/auth/v1/token?grant_type=password`,
        {
          method: "POST",
          headers: {
            apikey: config.publishableKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        },
      );
      if (!response.ok)
        throw new Error(
          response.status === 429
            ? "محاولات كثيرة. انتظر قليلًا ثم أعد المحاولة."
            : "تعذر الدخول. راجع الإيميل والباسورد.",
        );
      const data = await response.json();
      session.current = {
        ...data,
        expires_at: Date.now() / 1000 + data.expires_in,
      };
      const loaded = await api("load");
      if (dirty && baseSha) {
        setMessage(
          "تم تجديد الدخول. مسودتك غير المنشورة ما زالت محفوظة في هذا التبويب.",
        );
      } else {
        setDraft(loaded.content);
        setBaseSha(loaded.contentSha);
        setDirty(false);
        setMessage("");
      }
      setAuthenticated(true);
      setPassword("");
    } catch (err) {
      session.current = null;
      setError(err instanceof Error ? err.message : "تعذر تسجيل الدخول.");
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    if (
      dirty &&
      !window.confirm(
        "عند الخروج ستفقد التعديلات غير المنشورة. هل تريد الخروج؟",
      )
    )
      return;
    if (config && session.current)
      await fetch(`${config.supabaseUrl}/auth/v1/logout`, {
        method: "POST",
        headers: {
          apikey: config.publishableKey,
          Authorization: `Bearer ${session.current.access_token}`,
        },
      }).catch(() => {});
    session.current = null;
    setAuthenticated(false);
    setPassword("");
    setDraft(initialContent as unknown as Json);
    setUploads({});
    setPreviews({});
    setDirty(false);
    setCommit("");
    setMessage("");
    setError("");
  }
  function change(path: (string | number)[], value: Json) {
    setDraft((old) => {
      const next = structuredClone(old);
      let node = next as Record<string, Json>;
      for (const part of path.slice(0, -1))
        node = node[part] as Record<string, Json>;
      node[path[path.length - 1]] = value;
      return next;
    });
    setDirty(true);
    setMessage("");
    setError("");
  }
  async function upload(path: (string | number)[], file?: File) {
    if (!file) return;
    setError("");
    try {
      if (
        !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
        file.size > 2 * 1024 * 1024
      )
        throw new Error("اختر صورة PNG أو JPG أو WebP بحجم أقصى 2 ميجابايت.");
      const bytes = new Uint8Array(await file.arrayBuffer());
      const hash = Array.from(
        new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
        (n) => n.toString(16).padStart(2, "0"),
      ).join("");
      const extension =
        file.type === "image/png"
          ? "png"
          : file.type === "image/jpeg"
            ? "jpg"
            : "webp";
      const assetPath = `/uploads/${hash}.${extension}`;
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setUploads((old) => ({
        ...old,
        [assetPath]: {
          path: assetPath.slice(1),
          content: dataUrl.split(",")[1],
        },
      }));
      setPreviews((old) => ({ ...old, [assetPath]: dataUrl }));
      change(path, assetPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر قراءة الصورة.");
    }
  }
  async function reloadContent() {
    if (
      dirty &&
      !window.confirm(
        "ستفقد المسودة غير المنشورة. هل تريد تحميل أحدث محتوى من GitHub؟",
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      const loaded = await api("load");
      setDraft(loaded.content);
      setBaseSha(loaded.contentSha);
      setUploads({});
      setPreviews({});
      setDirty(false);
      setMessage("تم تحميل أحدث محتوى من main.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل المحتوى.");
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      // Send only files still referenced by this draft.
      const serialized = JSON.stringify(draft);
      const files = Object.values(uploads).filter((item) =>
        serialized.includes(`/${item.path}`),
      );
      const result = await api("save", {
        content: draft,
        contentSha: baseSha,
        uploads: files,
      });
      setBaseSha(result.contentSha);
      setCommit(result.commit);
      setDirty(false);
      setUploads({});
      setMessage("اتحفظت التعديلات على main. جارٍ انتظار نتيجة النشر.");
      setDeployment("queued");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "تعذر الحفظ. تعديلاتك ما زالت هنا.",
      );
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (
      !commit ||
      !authenticated ||
      [
        "success",
        "failure",
        "cancelled",
        "timed_out",
        "action_required",
        "stale",
        "neutral",
        "skipped",
      ].includes(deployment)
    )
      return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const result = await api("status", { commit });
        if (!stopped) {
          setDeployment(result.conclusion ?? result.status);
          setRunUrl(result.url ?? "");
        }
      } catch {
        if (!stopped) setDeployment("unknown");
      }
      if (!stopped) timer = setTimeout(poll, 15000);
    };
    timer = setTimeout(poll, 5000);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
    // Session refresh and API configuration are read when each poll runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commit, authenticated, deployment]);
  function field(
    value: Json,
    path: (string | number)[],
    label: string,
  ): React.ReactNode {
    const key = String(path.at(-1));
    if (typeof value === "boolean")
      return (
        <label className="admin-check" key={path.join(".")}>
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => change(path, e.target.checked)}
            disabled={busy}
          />
          {label}
        </label>
      );
    if (typeof value === "number") return null;
    if (typeof value === "string") {
      const isImage = ["image", "logo", "photo"].includes(key);
      const navId = path.includes("nav") && path.at(-1) === 1;
      return (
        <div className="admin-field" key={path.join(".")}>
          <label htmlFor={path.join("-")}>{label}</label>
          {isImage && value && (
            <Image
              className="admin-image"
              src={previews[value] ?? `${BASE}${value}`}
              alt={label}
              width={260}
              height={180}
              unoptimized
            />
          )}
          {key === "category" ? (
            <select
              id={path.join("-")}
              value={value}
              onChange={(e) => change(path, e.target.value)}
              disabled={busy}
            >
              <option value="seo">SEO والمحتوى</option>
              <option value="social">السوشيال ميديا</option>
              <option value="copy">كوبي رايتنج</option>
            </select>
          ) : (
            <textarea
              id={path.join("-")}
              rows={value.length > 100 ? 4 : 1}
              value={value}
              onChange={(e) => change(path, e.target.value)}
              disabled={busy || navId}
              dir={
                path.includes("en") ||
                [
                  "email",
                  "linkedin",
                  "image",
                  "logo",
                  "photo",
                  "cv",
                  "saudiPhone",
                  "egyptPhone",
                ].includes(key)
                  ? "ltr"
                  : "auto"
              }
            />
          )}
          {isImage && (
            <label className="admin-upload">
              رفع صورة
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  void upload(path, e.target.files?.[0]);
                  e.target.value = "";
                }}
                disabled={busy}
              />
              <small>PNG / JPG / WebP · حتى 2 MB</small>
            </label>
          )}
        </div>
      );
    }
    if (Array.isArray(value)) {
      const fixed =
        path.includes("nav") ||
        (path.includes("stats") && typeof value[0] === "string");
      return (
        <fieldset className="admin-group" key={path.join(".")}>
          <legend>
            {label} <small>({value.length})</small>
          </legend>
          {value.map((item, index) => (
            <div className="admin-list-item" key={index}>
              {field(
                item,
                [...path, index],
                typeof item === "string"
                  ? `${label} ${index + 1}`
                  : `${label} · ${index + 1}`,
              )}
              {!fixed && (
                <div className="admin-item-actions">
                  <button
                    type="button"
                    disabled={busy || index === 0}
                    onClick={() => {
                      const next = [...value];
                      [next[index - 1], next[index]] = [
                        next[index],
                        next[index - 1],
                      ];
                      change(path, next);
                    }}
                  >
                    ↑ لأعلى
                  </button>
                  <button
                    type="button"
                    disabled={busy || index === value.length - 1}
                    onClick={() => {
                      const next = [...value];
                      [next[index + 1], next[index]] = [
                        next[index],
                        next[index + 1],
                      ];
                      change(path, next);
                    }}
                  >
                    ↓ لأسفل
                  </button>
                  <button
                    className="admin-danger"
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      if (window.confirm("حذف هذا العنصر من المسودة؟"))
                        change(
                          path,
                          value.filter((_, i) => i !== index),
                        );
                    }}
                  >
                    حذف
                  </button>
                </div>
              )}
            </div>
          ))}
          {!fixed && (
            <button
              className="admin-add"
              type="button"
              disabled={busy || value.length >= 100}
              onClick={() =>
                change(path, [
                  ...value,
                  key === "workItems"
                    ? workTemplate
                    : key === "clients"
                      ? clientTemplate
                      : emptyCopy(value[0] ?? arrayTemplate(path)),
                ])
              }
            >
              + إضافة عنصر
            </button>
          )}
        </fieldset>
      );
    }
    return (
      <fieldset className="admin-group" key={path.join(".")}>
        <legend>{label}</legend>
        {Object.entries(value).map(([name, item]) =>
          field(item, [...path, name], labels[name] ?? name),
        )}
      </fieldset>
    );
  }
  const data = draft as Record<string, Json>;
  return (
    <main className="admin-shell" dir="rtl">
      <header className="admin-header">
        <a href={`${BASE}/`} className="admin-brand">
          AK{" "}
          <span>
            عمار قابيل<small>لوحة إدارة الموقع</small>
          </span>
        </a>
        <a href={`${BASE}/`} target="_blank" rel="noreferrer">
          عرض الموقع ↗
        </a>
        {authenticated && (
          <button onClick={logout} disabled={busy}>
            تسجيل الخروج
          </button>
        )}
      </header>
      {!authenticated ? (
        <section className="admin-login">
          <p className="admin-eyebrow">مساحتك الخاصة</p>
          <h1>
            أهلًا عمار.
            <br />
            موقعك، بطريقتك.
          </h1>
          <p>عدّل المحتوى والصور، ثم انشر التعديلات من مكان واحد.</p>
          {!ready ? (
            <p role="status">جارٍ التحميل…</p>
          ) : !config ? (
            <div className="admin-setup" role="status">
              <strong>لوحة التحكم تحتاج تفعيل تسجيل الدخول</strong>
              <p>
                يلزم ربط خدمة الحساب الآمنة قبل استخدام الإيميل والباسورد.
                الموقع العام يعمل كالمعتاد.
              </p>
              <a
                href="https://github.com/seosstm-hash/ammar-kabeel-portfolio/blob/main/docs/admin-setup.md"
                target="_blank"
                rel="noreferrer"
              >
                خطوات التفعيل للمسؤول ↗
              </a>
            </div>
          ) : (
            <form onSubmit={login}>
              <label>
                البريد الإلكتروني
                <input
                  required
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir="ltr"
                  disabled={busy}
                />
              </label>
              <label>
                كلمة المرور
                <input
                  required
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={busy}
                />
              </label>
              <button className="admin-primary" disabled={busy}>
                {busy ? "جارٍ التحقق…" : "دخول لوحة التحكم ←"}
              </button>
              <p className="admin-hint">
                الدخول مخصص لحساب المسؤول. لا يوجد تسجيل عام.
              </p>
            </form>
          )}
          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}
        </section>
      ) : (
        <div className="admin-dashboard">
          <aside>
            <h1>إدارة المحتوى</h1>
            <p>تعديل بسيط، حضور أقوى.</p>
            <nav aria-label="أقسام لوحة التحكم">
              {tabs.map(([id, label]) => (
                <button
                  type="button"
                  key={id}
                  className={active === id ? "active" : ""}
                  aria-current={active === id ? "page" : undefined}
                  onClick={() => setActive(id)}
                >
                  {label}
                </button>
              ))}
            </nav>
            <p className="admin-hint">
              التعديلات تبقى مسودة داخل الجلسة حتى تضغط حفظ ونشر.
            </p>
          </aside>
          <section className="admin-editor">
            <div className="admin-toolbar">
              <div>
                <h2>{tabs.find(([id]) => id === active)?.[1]}</h2>
                <span>
                  {dirty ? "● تعديلات غير منشورة" : "✓ المحتوى محفوظ"}
                </span>
              </div>
              <button type="button" onClick={reloadContent} disabled={busy}>
                تحديث من GitHub
              </button>
              <button
                className="admin-primary"
                type="button"
                onClick={save}
                disabled={!dirty || busy}
              >
                {busy ? "جارٍ الحفظ…" : "حفظ ونشر ↗"}
              </button>
            </div>
            {error && (
              <p className="admin-error" role="alert">
                {error}
              </p>
            )}
            {message && (
              <p className="admin-success" role="status">
                {message}
              </p>
            )}
            {commit && (
              <div className="admin-deployment" role="status">
                {deployment === "success"
                  ? "✓ تم النشر بنجاح. افتح الموقع لرؤية التعديل."
                  : [
                        "failure",
                        "cancelled",
                        "timed_out",
                        "action_required",
                      ].includes(deployment)
                    ? "التعديلات محفوظة لكن النشر لم ينجح. راجع تفاصيل النشر."
                    : "التعديلات محفوظة على GitHub. جارٍ التحقق من النشر…"}{" "}
                <a
                  href={
                    runUrl ||
                    `https://github.com/seosstm-hash/ammar-kabeel-portfolio/commit/${commit}`
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  تفاصيل ↗
                </a>
              </div>
            )}
            <div className="admin-fields">
              {active === "profile" ? (
                <>
                  {field(data.profile, ["profile"], "الملف الشخصي")}
                  {field(data.contact, ["contact"], "بيانات التواصل")}
                </>
              ) : active === "ar" || active === "en" ? (
                field(
                  (data.content as Record<string, Json>)[active],
                  ["content", active],
                  active === "ar" ? "النصوص العربية" : "English content",
                )
              ) : (
                field(
                  data[active],
                  [active],
                  tabs.find(([id]) => id === active)?.[1] ?? active,
                )
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
