"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type Language = "ar" | "en";
type WorkCategory = "all" | "seo" | "social" | "copy";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type WorkItem = {
  title: Record<Language, string>;
  client: string;
  category: Exclude<WorkCategory, "all">;
  image: string;
  description: Record<Language, string>;
};

const content = {
  ar: {
    nav: [
      ["عني", "about"],
      ["خبراتي", "expertise"],
      ["أعمالي", "work"],
      ["خبرتي", "experience"],
      ["تواصل", "contact"],
    ],
    availability: "متاح لفرص العمل والمشروعات في الرياض",
    heroKicker: "استراتيجية • محتوى • نمو",
    firstName: "عمار",
    lastName: "قابيل",
    role: "أخصائي تسويق إلكتروني",
    heroText:
      "أحوّل البحث والمحتوى والبيانات إلى حضور رقمي أقوى، وزيارات عضوية مستدامة، وتجارب تسويقية تقرّب العلامات التجارية من عملائها.",
    contact: "تواصل معي",
    work: "شاهد أعمالي",
    location: "الرياض، المملكة العربية السعودية",
    stats: [
      ["+3", "سنوات خبرة متخصصة في SEO"],
      ["+1.1K", "متابع على LinkedIn"],
      ["السوق السعودي", "خبرة في متاجر ومشروعات متعددة"],
    ],
    aboutEyebrow: "نبذة عني",
    aboutTitle: "تسويق يبدأ بالفهم وينتهي بنتيجة يمكن قياسها.",
    aboutText:
      "أخصائي تسويق إلكتروني بخبرة مركزة في تحسين محركات البحث والتجارة الإلكترونية، وخلفية ممتدة منذ 2018 في الصحافة والعلاقات العامة والسوشيال ميديا وكتابة المحتوى. أعمل على بناء رحلة متكاملة تبدأ من فهم نية المستخدم، وتمر بالمحتوى والتحليل، وتنتهي بتحسين الظهور والتحويل.",
    sectors: "خبرة عبر قطاعات",
    sectorItems: ["التجارة الإلكترونية", "العطور", "المطاعم", "العقار", "القطاع الطبي", "القهوة"],
    expertiseEyebrow: "مجالات التخصص",
    expertiseTitle: "مهارات متكاملة تخدم النمو الرقمي.",
    expertiseIntro:
      "لا أتعامل مع كل قناة بمعزل عن الأخرى؛ أربط الظهور بالمحتوى، والمحتوى بتجربة المستخدم، والبيانات بالقرار.",
    expertise: [
      {
        n: "01",
        title: "تحسين محركات البحث",
        text: "استراتيجية SEO، بحث الكلمات، نية المستخدم، On-Page، Technical SEO، الربط الداخلي، الفهرسة والتقارير.",
      },
      {
        n: "02",
        title: "SEO للمتاجر الإلكترونية",
        text: "تحسين التصنيفات والمنتجات والميتا والروابط، مع خبرة عملية في منصات سلة والمتاجر السعودية.",
      },
      {
        n: "03",
        title: "المحتوى والكوبي رايتنج",
        text: "مقالات وصفحات هبوط ومحتوى تجاري ونسخ إعلانية تجمع بين نية البحث والإقناع والتحويل.",
      },
      {
        n: "04",
        title: "السوشيال ميديا",
        text: "أفكار حملات، خطط محتوى، كتابة منشورات، توجيه إبداعي وتحويل أهداف العلامة إلى رسائل قابلة للمشاركة.",
      },
      {
        n: "05",
        title: "التحليل وقياس الأداء",
        text: "Google Search Console وGA4 وSemrush وAhrefs وScreaming Frog لفهم الحركة وتحديد فرص النمو.",
      },
      {
        n: "06",
        title: "CRO وتجربة المستخدم",
        text: "تحسين بنية الصفحات والرسائل والدعوات لاتخاذ الإجراء لرفع التفاعل وتحويل الزيارات إلى نتائج.",
      },
    ],
    workEyebrow: "أعمال مختارة",
    workTitle: "أعمال حقيقية، من الاستراتيجية إلى التنفيذ.",
    workIntro:
      "نماذج من نتائج SEO والمحتوى والحملات التي عملت عليها. اضغط على أي عمل لمشاهدته بحجم أكبر.",
    filters: {
      all: "الكل",
      seo: "SEO والمحتوى",
      social: "السوشيال ميديا",
      copy: "كوبي رايتنج",
    },
    viewProject: "عرض العمل",
    experienceEyebrow: "المسار المهني",
    experienceTitle: "خبرة تجمع البحث والمحتوى والتواصل.",
    experiences: [
      {
        period: "2024 — 2026",
        role: "Senior SEO Specialist",
        company: "SEO Acuity",
        text: "قيادة وتنفيذ استراتيجيات SEO لمواقع عربية ومتاجر سعودية، من التحليل الفني وتخطيط المحتوى حتى تحسين الصفحات التجارية.",
      },
      {
        period: "2023 — الآن",
        role: "E-commerce SEO Consultant",
        company: "مشروعات ومتاجر سعودية",
        text: "تحسين التصنيفات والمنتجات وبنية الروابط والمحتوى والفهرسة، وتحديد فرص الكلمات التجارية ذات الأولوية.",
      },
      {
        period: "2022 — 2024",
        role: "SEO Content Writer",
        company: "Goal Maker",
        text: "كتابة محتوى عربي متوافق مع البحث للمقالات والخدمات وصفحات الهبوط والباك لينك.",
      },
      {
        period: "2020 — 2022",
        role: "Social Media Specialist",
        company: "Life Makers & UP",
        text: "إدارة المحتوى والأفكار والحملات والمنشورات والتفاعل لمبادرات ومشروعات مصرية.",
      },
      {
        period: "2018 — 2020",
        role: "Journalism & Public Relations",
        company: "مؤسسات إعلامية ومجتمعية",
        text: "البحث والمقابلات والكتابة التحريرية والتواصل، وهي الأسس التي تطورت لاحقًا إلى استراتيجية محتوى وتسويق.",
      },
    ],
    tools: "أدوات أعمل بها",
    contactEyebrow: "لنعمل معًا",
    contactTitle: "هل تبحث عن شخص يفهم التسويق كمنظومة متكاملة؟",
    contactText:
      "متاح لفرص العمل والمشروعات في تحسين محركات البحث، التجارة الإلكترونية، المحتوى والتسويق الرقمي داخل الرياض وعن بُعد.",
    whatsappSaudi: "واتساب السعودية",
    egyptNumber: "الرقم المصري",
    email: "البريد الإلكتروني",
    linkedin: "LinkedIn",
    download: "تحميل السيرة الذاتية",
    close: "إغلاق",
    rights: "جميع الحقوق محفوظة",
  },
  en: {
    nav: [
      ["About", "about"],
      ["Expertise", "expertise"],
      ["Work", "work"],
      ["Experience", "experience"],
      ["Contact", "contact"],
    ],
    availability: "Open to roles and projects in Riyadh",
    heroKicker: "Strategy • Content • Growth",
    firstName: "Ammar",
    lastName: "Kabeel",
    role: "Digital Marketing Specialist",
    heroText:
      "I turn search, content, and data into stronger digital visibility, sustainable organic traffic, and marketing experiences that bring brands closer to their customers.",
    contact: "Contact Me",
    work: "View My Work",
    location: "Riyadh, Saudi Arabia",
    stats: [
      ["3+", "Years of focused SEO experience"],
      ["1.1K+", "LinkedIn followers"],
      ["Saudi Market", "Experience across stores and projects"],
    ],
    aboutEyebrow: "About me",
    aboutTitle: "Marketing that starts with understanding and ends with a measurable result.",
    aboutText:
      "A digital marketing specialist with focused experience in SEO and e-commerce, backed by a wider background in journalism, public relations, social media, and digital content since 2018. I build connected journeys that start with search intent, move through content and analysis, and finish with stronger visibility and conversion.",
    sectors: "Experience across",
    sectorItems: ["E-commerce", "Perfumes", "Restaurants", "Real Estate", "Healthcare", "Coffee"],
    expertiseEyebrow: "Core expertise",
    expertiseTitle: "Connected skills built for digital growth.",
    expertiseIntro:
      "I do not treat each channel in isolation. I connect visibility to content, content to user experience, and data to better decisions.",
    expertise: [
      {
        n: "01",
        title: "Search Engine Optimization",
        text: "SEO strategy, keyword research, search intent, on-page and technical SEO, internal linking, indexing, and reporting.",
      },
      {
        n: "02",
        title: "E-commerce SEO",
        text: "Category, product, metadata, and URL optimization, with hands-on experience across Salla and Saudi e-commerce stores.",
      },
      {
        n: "03",
        title: "Content & Copywriting",
        text: "Articles, landing pages, commercial content, and ad copy that combine search intent, persuasion, and conversion.",
      },
      {
        n: "04",
        title: "Social Media",
        text: "Campaign ideas, content plans, posts, creative direction, and messages designed around brand and audience goals.",
      },
      {
        n: "05",
        title: "Analytics & Measurement",
        text: "Google Search Console, GA4, Semrush, Ahrefs, and Screaming Frog to understand movement and prioritize growth.",
      },
      {
        n: "06",
        title: "CRO & User Experience",
        text: "Improving page structure, messaging, and calls to action so traffic becomes engagement and measurable outcomes.",
      },
    ],
    workEyebrow: "Selected work",
    workTitle: "Real work, from strategy to execution.",
    workIntro:
      "A selection of SEO results, content, and campaigns I worked on. Open any item to see it in more detail.",
    filters: {
      all: "All",
      seo: "SEO & Content",
      social: "Social Media",
      copy: "Copywriting",
    },
    viewProject: "View project",
    experienceEyebrow: "Career journey",
    experienceTitle: "Experience across search, content, and communication.",
    experiences: [
      {
        period: "2024 — 2026",
        role: "Senior SEO Specialist",
        company: "SEO Acuity",
        text: "Led SEO strategy and execution for Arabic websites and Saudi stores, from technical analysis and content planning to commercial-page optimization.",
      },
      {
        period: "2023 — Present",
        role: "E-commerce SEO Consultant",
        company: "Saudi e-commerce projects",
        text: "Optimized categories, products, URL structures, content, and indexing while identifying priority commercial-search opportunities.",
      },
      {
        period: "2022 — 2024",
        role: "SEO Content Writer",
        company: "Goal Maker",
        text: "Created search-friendly Arabic content for articles, services, landing pages, and backlink assets.",
      },
      {
        period: "2020 — 2022",
        role: "Social Media Specialist",
        company: "Life Makers & UP",
        text: "Managed content, campaign ideas, posts, and engagement for Egyptian initiatives and business projects.",
      },
      {
        period: "2018 — 2020",
        role: "Journalism & Public Relations",
        company: "Media & community organizations",
        text: "Built foundations in research, interviews, editorial writing, and communication that now shape my content strategy work.",
      },
    ],
    tools: "Tools I work with",
    contactEyebrow: "Let’s work together",
    contactTitle: "Looking for someone who sees marketing as one connected system?",
    contactText:
      "Available for roles and projects in SEO, e-commerce, content, and digital marketing in Riyadh and remotely.",
    whatsappSaudi: "Saudi WhatsApp",
    egyptNumber: "Egypt number",
    email: "Email",
    linkedin: "LinkedIn",
    download: "Download CV",
    close: "Close",
    rights: "All rights reserved",
  },
} as const;

const workItems: WorkItem[] = [
  {
    title: { ar: "لوحات نتائج SEO", en: "SEO performance dashboards" },
    client: "Google Search Console",
    category: "seo",
    image: `${BASE_PATH}/portfolio/seo-results-search-49.jpg`,
    description: {
      ar: "نماذج موثقة من متابعة النقرات والظهور والحركة العضوية عبر Google Search Console.",
      en: "Documented examples of clicks, impressions, and organic visibility tracked in Google Search Console.",
    },
  },
  {
    title: { ar: "تحسين متجر سعودي", en: "Saudi e-commerce SEO" },
    client: "Sallat",
    category: "seo",
    image: `${BASE_PATH}/portfolio/seo-results-salla-52.jpg`,
    description: {
      ar: "مقارنة الأداء قبل وبعد العمل على الظهور العضوي وبنية المتجر.",
      en: "A before-and-after view of organic visibility and store optimization work.",
    },
  },
  {
    title: { ar: "نماذج نمو عضوي", en: "Organic growth examples" },
    client: "Multiple Projects",
    category: "seo",
    image: `${BASE_PATH}/portfolio/seo-results-more-53.jpg`,
    description: {
      ar: "أمثلة إضافية لقياس تطور النقرات ومرات الظهور والترتيب.",
      en: "Additional examples tracking click, impression, and ranking progress.",
    },
  },
  {
    title: { ar: "محتوى عطور متوافق مع البحث", en: "Search-led perfume content" },
    client: "Crearoma",
    category: "seo",
    image: `${BASE_PATH}/portfolio/seo-perfume-31.jpg`,
    description: {
      ar: "كتابة محتوى عميق، واستهداف كلمات عالية الطلب، وصياغة عناوين تساعد على النقر.",
      en: "Deep content, high-demand keyword targeting, and click-focused title writing.",
    },
  },
  {
    title: { ar: "محتوى القهوة المختصة", en: "Specialty coffee content" },
    client: "Ajaweed",
    category: "seo",
    image: `${BASE_PATH}/portfolio/seo-coffee-35.jpg`,
    description: {
      ar: "بناء مقالات متوافقة مع نية المستخدم وربطها بفرص الظهور في نتائج البحث.",
      en: "Articles structured around user intent and organic search opportunities.",
    },
  },
  {
    title: { ar: "محتوى متجر أسماك الزينة", en: "Ornamental fish store content" },
    client: "E-commerce",
    category: "seo",
    image: `${BASE_PATH}/portfolio/seo-fish-39.jpg`,
    description: {
      ar: "دمج المقالات المتخصصة مع العناصر البصرية لدعم الفهم والظهور.",
      en: "Combining specialist articles with visual elements to support understanding and visibility.",
    },
  },
  {
    title: { ar: "مقالات القطاع الطبي", en: "Healthcare articles" },
    client: "Vera Clinics",
    category: "seo",
    image: `${BASE_PATH}/portfolio/seo-medical-42.jpg`,
    description: {
      ar: "محتوى طبي منظم بلغة واضحة ومهيأ لمحركات البحث.",
      en: "Structured healthcare content written clearly and optimized for search.",
    },
  },
  {
    title: { ar: "حملة برياني الذواقة", en: "Biryani Atwaqa campaign" },
    client: "Food & Beverage",
    category: "social",
    image: `${BASE_PATH}/portfolio/social-biryani-05.jpg`,
    description: {
      ar: "محتوى تسويقي وأفكار حملات لمطعم هندي في الدمام بهدف رفع التفاعل والمبيعات.",
      en: "Marketing content and campaign ideas for an Indian restaurant in Dammam.",
    },
  },
  {
    title: { ar: "إطلاق ناي كافيه", en: "Nay Cafe launch" },
    client: "Nay Cafe",
    category: "social",
    image: `${BASE_PATH}/portfolio/social-nay-09.jpg`,
    description: {
      ar: "حملة إطلاق ركزت على الوعي بالتفاصيل البصرية والهوية وتجربة المكان.",
      en: "A launch campaign built around awareness, visual detail, identity, and experience.",
    },
  },
  {
    title: { ar: "حملة مطعم كيين", en: "KIIN restaurant campaign" },
    client: "KIIN",
    category: "social",
    image: `${BASE_PATH}/portfolio/social-kiin-13.jpg`,
    description: {
      ar: "أفكار إعلانية ومحتوى وتصوير وتعاون مع المؤثرين لدعم الوصول والمبيعات.",
      en: "Creative ideas, content, production, and influencer collaboration supporting reach and sales.",
    },
  },
  {
    title: { ar: "حملة تالا هاوس", en: "Tala House campaign" },
    client: "Real Estate",
    category: "social",
    image: `${BASE_PATH}/portfolio/social-tala-15.jpg`,
    description: {
      ar: "حملة عقارية موجهة لبناء الوعي وتحويل الاهتمام إلى استفسارات وفرص حقيقية.",
      en: "A real-estate campaign designed to turn awareness into inquiries and opportunities.",
    },
  },
  {
    title: { ar: "محتوى ناوي ميديا", en: "Nawy Media content" },
    client: "Nawy Media",
    category: "social",
    image: `${BASE_PATH}/portfolio/social-nawy-21.jpg`,
    description: {
      ar: "محتوى حملة توعوية بالتعاون مع التوجيه الفني لإبراز خدمات الوكالة.",
      en: "Awareness content created with art direction to spotlight the agency’s services.",
    },
  },
  {
    title: { ar: "حملة توعوية صحية", en: "Healthcare awareness campaign" },
    client: "Jamjoom Pharma",
    category: "copy",
    image: `${BASE_PATH}/portfolio/copy-pharma-25.jpg`,
    description: {
      ar: "كتابة منشورات مخصصة لكل منصة لتبسيط المعلومات الطبية وبناء تواصل إنساني.",
      en: "Platform-specific copy that simplified health information and built an empathetic connection.",
    },
  },
];

const toolNames = [
  "Google Search Console",
  "Google Analytics 4",
  "Semrush",
  "Ahrefs",
  "Screaming Frog",
  "Salla",
  "WordPress",
  "Google Sheets",
  "Canva",
  "Meta Business Suite",
];

export default function Home() {
  const [lang, setLang] = useState<Language>("ar");
  const [filter, setFilter] = useState<WorkCategory>("all");
  const [activeWork, setActiveWork] = useState<WorkItem | null>(null);
  const t = content[lang];
  const isArabic = lang === "ar";

  const filteredWork = useMemo(
    () =>
      filter === "all"
        ? workItems
        : workItems.filter((item) => item.category === filter),
    [filter],
  );

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    document.title = isArabic
      ? "عمار قابيل | أخصائي تسويق إلكتروني"
      : "Ammar Kabeel | Digital Marketing Specialist";
  }, [lang, isArabic]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px" },
    );

    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [lang, filter]);

  useEffect(() => {
    document.body.style.overflow = activeWork ? "hidden" : "";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveWork(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeWork]);

  return (
    <main className="site-shell" dir={isArabic ? "rtl" : "ltr"}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: "Ammar Kabeel",
            alternateName: "عمار قابيل",
            jobTitle: "Digital Marketing Specialist",
            url: "https://www.linkedin.com/in/ammar-kabeel-417644273/",
            sameAs: ["https://www.linkedin.com/in/ammar-kabeel-417644273/"],
            email: "mailto:ammarashraf332@gmail.com",
            telephone: "+966550813026",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Riyadh",
              addressCountry: "SA",
            },
          }),
        }}
      />

      <header className="site-header">
        <a className="brand-mark" href="#top" aria-label="Ammar Kabeel">
          AK
        </a>
        <nav className="desktop-nav" aria-label={isArabic ? "التنقل الرئيسي" : "Main navigation"}>
          {t.nav.map(([label, id]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <span className="availability-dot" aria-hidden="true" />
          <span className="availability-text">{t.availability}</span>
          <div className="language-switch" aria-label="Language">
            <button
              type="button"
              className={lang === "ar" ? "active" : ""}
              onClick={() => setLang("ar")}
              aria-pressed={lang === "ar"}
            >
              AR
            </button>
            <span>/</span>
            <button
              type="button"
              className={lang === "en" ? "active" : ""}
              onClick={() => setLang("en")}
              aria-pressed={lang === "en"}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-photo-wrap">
          <div className="hero-shape hero-shape-yellow" />
          <div className="hero-shape hero-shape-blue" />
          <div className="hero-photo-frame">
            <Image
              src={`${BASE_PATH}/portfolio/ammar-kabeel.webp`}
              alt={isArabic ? "عمار قابيل، أخصائي تسويق إلكتروني" : "Ammar Kabeel, Digital Marketing Specialist"}
              fill
              sizes="(max-width: 900px) 90vw, 42vw"
              priority
              unoptimized
              style={{ objectFit: "contain", objectPosition: "50% 100%" }}
            />
          </div>
          <span className="hero-quote">”</span>
        </div>

        <div className="hero-content">
          <p className="hero-kicker">{t.heroKicker}</p>
          <h1 aria-label={isArabic ? "عمار قابيل" : "Ammar Kabeel"}>
            <span>{t.firstName}</span>
            <strong>{t.lastName}</strong>
          </h1>
          <div className="hero-role">{t.role}</div>
          <div className="hero-role-en">
            {isArabic ? "Digital Marketing Specialist" : "أخصائي تسويق إلكتروني"}
          </div>
          <p className="hero-description">{t.heroText}</p>
          <div className="skill-line" aria-label="Skills">
            <span>SEO</span>
            <i />
            <span>E-commerce SEO</span>
            <i />
            <span>Social Media</span>
            <i />
            <span>Copywriting</span>
          </div>
          <p className="hero-location">
            <span aria-hidden="true">●</span>
            {t.location}
          </p>
          <div className="hero-ctas">
            <a
              className="button button-primary"
              href="https://wa.me/966550813026?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%20%D8%B9%D9%85%D8%A7%D8%B1%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%AA%D9%88%D8%A7%D8%B5%D9%84%20%D9%85%D8%B9%D9%83"
              target="_blank"
              rel="noreferrer"
            >
              {t.contact}
              <span aria-hidden="true">↗</span>
            </a>
            <a className="button button-secondary" href="#work">
              {t.work}
              <span aria-hidden="true">←</span>
            </a>
          </div>
        </div>
      </section>

      <section className="stats-strip" aria-label={isArabic ? "حقائق سريعة" : "Quick facts"}>
        {t.stats.map(([value, label], index) => (
          <article key={label} className="stat-card" style={{ "--delay": `${index * 90}ms` } as React.CSSProperties}>
            <span>{value}</span>
            <p>{label}</p>
          </article>
        ))}
      </section>

      <section className="section about-section" id="about">
        <div className="section-heading" data-reveal>
          <p className="eyebrow">{t.aboutEyebrow}</p>
          <h2>{t.aboutTitle}</h2>
        </div>
        <div className="about-grid">
          <p className="about-copy" data-reveal>{t.aboutText}</p>
          <div className="sector-panel" data-reveal>
            <span>{t.sectors}</span>
            <div>
              {t.sectorItems.map((sector) => (
                <span key={sector}>{sector}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section expertise-section" id="expertise">
        <div className="section-heading section-heading-split" data-reveal>
          <div>
            <p className="eyebrow">{t.expertiseEyebrow}</p>
            <h2>{t.expertiseTitle}</h2>
          </div>
          <p>{t.expertiseIntro}</p>
        </div>
        <div className="expertise-grid">
          {t.expertise.map((item, index) => (
            <article
              className="expertise-card"
              key={item.n}
              data-reveal
              style={{ "--delay": `${index * 60}ms` } as React.CSSProperties}
            >
              <span className="expertise-number">{item.n}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <span className="card-arrow" aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section className="section work-section" id="work">
        <div className="section-heading section-heading-split" data-reveal>
          <div>
            <p className="eyebrow">{t.workEyebrow}</p>
            <h2>{t.workTitle}</h2>
          </div>
          <p>{t.workIntro}</p>
        </div>

        <div className="work-filters" role="tablist" aria-label={t.workEyebrow}>
          {(Object.keys(t.filters) as WorkCategory[]).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              className={filter === key ? "active" : ""}
              onClick={() => setFilter(key)}
            >
              {t.filters[key]}
            </button>
          ))}
        </div>

        <div className="work-grid">
          {filteredWork.map((item, index) => (
            <button
              type="button"
              className="work-card"
              key={`${item.client}-${item.image}`}
              onClick={() => setActiveWork(item)}
              data-reveal
              style={{ "--delay": `${(index % 4) * 70}ms` } as React.CSSProperties}
            >
              <div className="work-image">
                <Image
                  src={item.image}
                  alt={`${item.title[lang]} — ${item.client}`}
                  fill
                  sizes="(max-width: 900px) 100vw, 38vw"
                  unoptimized
                />
                <span className="work-open" aria-hidden="true">↗</span>
              </div>
              <div className="work-card-copy">
                <span>{item.client}</span>
                <h3>{item.title[lang]}</h3>
                <p>{item.description[lang]}</p>
                <strong>{t.viewProject} <span aria-hidden="true">←</span></strong>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="section experience-section" id="experience">
        <div className="section-heading" data-reveal>
          <p className="eyebrow">{t.experienceEyebrow}</p>
          <h2>{t.experienceTitle}</h2>
        </div>
        <div className="timeline">
          {t.experiences.map((item, index) => (
            <article
              className="timeline-item"
              key={`${item.period}-${item.role}`}
              data-reveal
              style={{ "--delay": `${index * 60}ms` } as React.CSSProperties}
            >
              <span className="timeline-period">{item.period}</span>
              <div>
                <h3>{item.role}</h3>
                <strong>{item.company}</strong>
              </div>
              <p>{item.text}</p>
            </article>
          ))}
        </div>

        <div className="tools-marquee" aria-label={t.tools}>
          <p>{t.tools}</p>
          <div className="tools-track">
            {[...toolNames, ...toolNames].map((tool, index) => (
              <span key={`${tool}-${index}`}>{tool}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-accent" aria-hidden="true">AK</div>
        <div className="contact-copy" data-reveal>
          <p className="eyebrow">{t.contactEyebrow}</p>
          <h2>{t.contactTitle}</h2>
          <p>{t.contactText}</p>
          <a
            className="button button-primary"
            href="https://wa.me/966550813026?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%20%D8%B9%D9%85%D8%A7%D8%B1%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%AA%D9%88%D8%A7%D8%B5%D9%84%20%D9%85%D8%B9%D9%83"
            target="_blank"
            rel="noreferrer"
          >
            {t.contact} <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="contact-links" data-reveal>
          <a href="https://wa.me/966550813026" target="_blank" rel="noreferrer">
            <span>{t.whatsappSaudi}</span>
            <strong dir="ltr">+966 55 081 3026</strong>
            <i aria-hidden="true">↗</i>
          </a>
          <a href="tel:+201147246390">
            <span>{t.egyptNumber}</span>
            <strong dir="ltr">+20 114 724 6390</strong>
            <i aria-hidden="true">↗</i>
          </a>
          <a href="mailto:ammarashraf332@gmail.com">
            <span>{t.email}</span>
            <strong>ammarashraf332@gmail.com</strong>
            <i aria-hidden="true">↗</i>
          </a>
          <a href="https://www.linkedin.com/in/ammar-kabeel-417644273/" target="_blank" rel="noreferrer">
            <span>{t.linkedin}</span>
            <strong>Ammar Kabeel</strong>
            <i aria-hidden="true">↗</i>
          </a>
          <a href={`${BASE_PATH}/portfolio/ammar-kabeel-cv.pdf`} download>
            <span>{t.download}</span>
            <strong>PDF — CV</strong>
            <i aria-hidden="true">↓</i>
          </a>
        </div>
      </section>

      <footer>
        <a className="brand-mark" href="#top" aria-label="Back to top">AK</a>
        <p>© {new Date().getFullYear()} Ammar Kabeel — {t.rights}</p>
        <a href="#top" className="back-to-top" aria-label={isArabic ? "العودة للأعلى" : "Back to top"}>↑</a>
      </footer>

      {activeWork && (
        <div
          className="work-modal"
          role="dialog"
          aria-modal="true"
          aria-label={activeWork.title[lang]}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setActiveWork(null);
          }}
        >
          <div className="work-modal-panel">
            <button
              type="button"
              className="modal-close"
              onClick={() => setActiveWork(null)}
              aria-label={t.close}
            >
              ×
            </button>
            <Image
              src={activeWork.image}
              alt={`${activeWork.title[lang]} — ${activeWork.client}`}
              width={1440}
              height={810}
              sizes="(max-width: 900px) 100vw, 70vw"
              unoptimized
            />
            <div>
              <span>{activeWork.client}</span>
              <h2>{activeWork.title[lang]}</h2>
              <p>{activeWork.description[lang]}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
