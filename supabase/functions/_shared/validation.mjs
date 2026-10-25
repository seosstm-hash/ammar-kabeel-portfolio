import defaults from "./schema.json" with { type: "json" };

const workExample = {
  title: { ar: "", en: "" },
  client: "",
  category: "seo",
  image: "",
  description: { ar: "", en: "" },
};
const clientExample = { name: "", logo: "", dark: false };
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const invalid = (path) => {
  throw new HttpError(400, `بيانات غير صالحة في ${path}.`);
};
export function validateContent(content) {
  function shape(value, sample, path) {
    if (Array.isArray(sample)) {
      if (!Array.isArray(value) || value.length > 100) invalid(path);
      const template =
        path === "workItems"
          ? workExample
          : path === "clients"
            ? clientExample
            : sample[0];
      for (const [index, item] of value.entries())
        shape(item, template, `${path}.${index}`);
      return;
    }
    if (sample && typeof sample === "object") {
      if (!value || typeof value !== "object" || Array.isArray(value))
        invalid(path);
      if (
        Object.keys(sample).sort().join("|") !==
        Object.keys(value).sort().join("|")
      )
        invalid(path);
      for (const key of Object.keys(sample))
        shape(value[key], sample[key], path ? `${path}.${key}` : key);
      return;
    }
    if (
      typeof value !== typeof sample ||
      (typeof value === "string" &&
        (value.length > 20000 || value.includes("\0")))
    )
      invalid(path);
  }
  shape(content, defaults, "");
  if (content.schemaVersion !== 1) invalid("schemaVersion");
  if (
    !content.seo.title.trim() ||
    content.seo.title.length > 160 ||
    content.seo.description.length > 500
  )
    invalid("seo");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content.contact.email))
    invalid("contact.email");
  for (const key of ["saudiPhone", "egyptPhone"])
    if (!/^\d{7,15}$/.test(content.contact[key])) invalid(`contact.${key}`);
  if (
    !/^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_%.-]+\/?$/.test(
      content.contact.linkedin,
    )
  )
    invalid("contact.linkedin");
  const image =
    /^\/(?:portfolio|clients|uploads)\/[a-zA-Z0-9_-]+\.(?:png|jpe?g|webp)$/;
  if (!image.test(content.profile.photo)) invalid("profile.photo");
  if (!/^\/portfolio\/[a-zA-Z0-9_-]+\.pdf$/.test(content.profile.cv))
    invalid("profile.cv");
  for (const item of content.clients)
    if (!image.test(item.logo) || !item.name.trim()) invalid("clients");
  for (const item of content.workItems) {
    if (
      !image.test(item.image) ||
      !["seo", "social", "copy"].includes(item.category) ||
      !item.title.ar.trim() ||
      !item.title.en.trim()
    )
      invalid("workItems");
  }
  for (const lang of ["ar", "en"]) {
    const text = content.content[lang];
    if (!text.firstName.trim() || !text.lastName.trim())
      invalid(`content.${lang}`);
    if (
      text.nav.length !== defaults.content[lang].nav.length ||
      text.nav.some(
        (pair, i) =>
          pair.length !== 2 || pair[1] !== defaults.content[lang].nav[i][1],
      )
    )
      invalid(`content.${lang}.nav`);
    if (text.stats.some((pair) => pair.length !== 2))
      invalid(`content.${lang}.stats`);
  }
  return content;
}
export async function validateUploads(uploads, content) {
  if (!Array.isArray(uploads) || uploads.length > 12) invalid("uploads");
  const references = new Set([
    content.profile.photo,
    ...content.clients.map((x) => x.logo),
    ...content.workItems.map((x) => x.image),
  ]);
  let total = 0;
  const paths = new Set();
  for (const file of uploads) {
    if (
      !file ||
      typeof file.path !== "string" ||
      typeof file.content !== "string"
    )
      invalid("uploads");
    const match = /^uploads\/([a-f0-9]{64})\.(png|jpg|webp)$/.exec(file.path);
    if (
      !match ||
      paths.has(file.path) ||
      !references.has(`/${file.path}`) ||
      file.content.length > 2800000 ||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(file.content)
    )
      invalid("uploads");
    paths.add(file.path);
    let bytes;
    try {
      bytes = Uint8Array.from(atob(file.content), (c) => c.charCodeAt(0));
    } catch {
      invalid("uploads");
    }
    total += bytes.length;
    if (
      !bytes.length ||
      bytes.length > 2 * 1024 * 1024 ||
      total > 6 * 1024 * 1024
    )
      invalid("uploads.size");
    const hex = Array.from(
      new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
      (n) => n.toString(16).padStart(2, "0"),
    ).join("");
    if (hex !== match[1]) invalid("uploads.hash");
    const starts = (...signature) =>
      signature.every((byte, i) => bytes[i] === byte);
    const valid =
      match[2] === "png"
        ? starts(137, 80, 78, 71, 13, 10, 26, 10)
        : match[2] === "jpg"
          ? starts(255, 216, 255)
          : starts(82, 73, 70, 70) &&
            String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
    if (!valid) invalid("uploads.type");
  }
  return uploads;
}
