"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import siteData from "../data/site-content.json";

type Language = "ar" | "en";
type WorkCategory = "all" | "seo" | "social" | "copy";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type WorkItem = {
  title: Record<Language, string>;
  description: Record<Language, string>;
  client: string;
  category: "seo" | "social" | "copy";
  image: string;
};
const { content, clients, contact, profile, seo } = siteData;
const workItems: WorkItem[] = siteData.workItems;
const whatsappLink = `https://wa.me/${contact.saudiPhone}?text=${encodeURIComponent(`مرحبا ${content.ar.firstName}، أرغب في التواصل معك`)}`;
function displayPhone(phone: string) {
  if (/^966\d{9}$/.test(phone))
    return `+966 ${phone.slice(3, 5)} ${phone.slice(5, 8)} ${phone.slice(8)}`;
  if (/^20\d{10}$/.test(phone))
    return `+20 ${phone.slice(2, 5)} ${phone.slice(5, 8)} ${phone.slice(8)}`;
  return `+${phone}`;
}

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
  const t = content[lang];
  const [filter, setFilter] = useState<WorkCategory>("all");
  const visibleWork = workItems.filter(
    (item) => filter === "all" || item.category === filter,
  );
  const isArabic = lang === "ar";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    document.title = seo.title;
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

    document
      .querySelectorAll<HTMLElement>("[data-reveal]")
      .forEach((element) => {
        observer.observe(element);
      });

    return () => observer.disconnect();
  }, [lang]);

  return (
    <main className="site-shell" dir={isArabic ? "rtl" : "ltr"}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: `${content.en.firstName} ${content.en.lastName}`,
            alternateName: `${content.ar.firstName} ${content.ar.lastName}`,
            jobTitle: content.en.role,
            url: "https://seosstm-hash.github.io/ammar-kabeel-portfolio/",
            sameAs: [contact.linkedin],
            email: `mailto:${contact.email}`,
            telephone: `+${contact.saudiPhone}`,
            address: {
              "@type": "PostalAddress",
              addressLocality: "Riyadh",
              addressCountry: "SA",
            },
          }),
        }}
      />

      <header className="site-header">
        <a
          className="brand-mark"
          href="#top"
          aria-label={`${content.en.firstName} ${content.en.lastName}`}
        >
          AK
        </a>
        <nav
          className="desktop-nav"
          aria-label={isArabic ? "التنقل الرئيسي" : "Main navigation"}
        >
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
              src={`${BASE_PATH}${profile.photo}`}
              alt={`${t.firstName} ${t.lastName}، ${t.role}`}
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
          <h1 aria-label={`${t.firstName} ${t.lastName}`}>
            <span>{t.firstName}</span>
            <strong>{t.lastName}</strong>
          </h1>
          <div className="hero-role">{t.role}</div>
          <div className="hero-role-en">
            {isArabic ? content.en.role : content.ar.role}
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
              href={whatsappLink}
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

      <section
        className="stats-strip"
        aria-label={isArabic ? "حقائق سريعة" : "Quick facts"}
      >
        {t.stats.map(([value, label], index) => (
          <article
            key={label}
            className="stat-card"
            style={{ "--delay": `${index * 90}ms` } as React.CSSProperties}
          >
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
          <p className="about-copy" data-reveal>
            {t.aboutText}
          </p>
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
              <span className="card-arrow" aria-hidden="true">
                ↗
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="section work-section" id="work">
        <div className="section-heading" data-reveal>
          <p className="eyebrow">{t.workEyebrow}</p>
          <h2>{t.workTitle}</h2>
        </div>
        {workItems.length > 0 && (
          <>
            <p>{t.workIntro}</p>
            <div
              className="work-filters"
              aria-label={isArabic ? "تصفية الأعمال" : "Filter work"}
            >
              {(Object.keys(t.filters) as WorkCategory[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={filter === key ? "active" : ""}
                  onClick={() => setFilter(key)}
                  aria-pressed={filter === key}
                >
                  {t.filters[key]}
                </button>
              ))}
            </div>
            <div className="work-grid">
              {visibleWork.map((item, index) => (
                <a
                  className="work-card"
                  key={`${item.image}-${index}`}
                  href={`${BASE_PATH}${item.image}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="work-image">
                    <Image
                      src={`${BASE_PATH}${item.image}`}
                      alt={item.title[lang]}
                      width={800}
                      height={600}
                      unoptimized
                    />
                  </div>
                  <div className="work-card-copy">
                    <span>{item.client}</span>
                    <h3>{item.title[lang]}</h3>
                    <p>{item.description[lang]}</p>
                    <strong>{t.viewProject} ↗</strong>
                  </div>
                </a>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="clients-section" aria-labelledby="clients-title">
        <div className="clients-heading" data-reveal>
          <p className="eyebrow">
            {isArabic ? "شركاء النجاح" : "Selected clients"}
          </p>
          <h2 id="clients-title">
            {isArabic ? "عملاء تعاونّا سويًا" : "Clients we’ve worked with"}
          </h2>
        </div>

        <div className="clients-viewport" dir="ltr">
          <div className="clients-track">
            {[0, 1].map((group) => (
              <div
                className="clients-row"
                key={group}
                aria-hidden={group === 1 ? "true" : undefined}
              >
                {clients.map((client) => (
                  <div
                    className={`client-logo-card${client.dark ? " is-dark" : ""}`}
                    key={`${group}-${client.name}`}
                  >
                    <Image
                      src={`${BASE_PATH}${client.logo}`}
                      alt={group === 0 ? client.name : ""}
                      width={220}
                      height={100}
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
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
        <div className="contact-accent" aria-hidden="true">
          AK
        </div>
        <div className="contact-copy" data-reveal>
          <p className="eyebrow">{t.contactEyebrow}</p>
          <h2>{t.contactTitle}</h2>
          <p>{t.contactText}</p>
          <a
            className="button button-primary"
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
          >
            {t.contact} <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="contact-links" data-reveal>
          <a
            href={`https://wa.me/${contact.saudiPhone}`}
            target="_blank"
            rel="noreferrer"
          >
            <span>{t.whatsappSaudi}</span>
            <strong dir="ltr">{displayPhone(contact.saudiPhone)}</strong>
            <i aria-hidden="true">↗</i>
          </a>
          <a href={`tel:+${contact.egyptPhone}`}>
            <span>{t.egyptNumber}</span>
            <strong dir="ltr">{displayPhone(contact.egyptPhone)}</strong>
            <i aria-hidden="true">↗</i>
          </a>
          <a href={`mailto:${contact.email}`}>
            <span>{t.email}</span>
            <strong>{contact.email}</strong>
            <i aria-hidden="true">↗</i>
          </a>
          <a href={contact.linkedin} target="_blank" rel="noreferrer">
            <span>{t.linkedin}</span>
            <strong>
              {content.en.firstName} {content.en.lastName}
            </strong>
            <i aria-hidden="true">↗</i>
          </a>
          <a href={`${BASE_PATH}${profile.cv}`} download>
            <span>{t.download}</span>
            <strong>PDF — CV</strong>
            <i aria-hidden="true">↓</i>
          </a>
        </div>
      </section>

      <footer>
        <a className="brand-mark" href="#top" aria-label="Back to top">
          AK
        </a>
        <p>
          © {new Date().getFullYear()} {content.en.firstName}{" "}
          {content.en.lastName} — {t.rights}
        </p>
        <a
          href="#top"
          className="back-to-top"
          aria-label={isArabic ? "العودة للأعلى" : "Back to top"}
        >
          ↑
        </a>
      </footer>
    </main>
  );
}
