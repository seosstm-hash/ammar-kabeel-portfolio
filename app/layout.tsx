import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://ammar-kabeel-portfolio.cactuss-1551.chatgpt.site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoKufiArabic = Noto_Kufi_Arabic({
  variable: "--font-noto-kufi-arabic",
  subsets: ["arabic"],
  weight: ["800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Ammar Kabeel | Digital Marketing",
    template: "%s | Ammar Kabeel",
  },
  description:
    "البورتفوليو الرسمي لعمار قابيل، أخصائي تسويق إلكتروني في الرياض ومتخصص في SEO للمتاجر الإلكترونية، المحتوى، السوشيال ميديا وتحليل الأداء.",
  keywords: [
    "عمار قابيل",
    "Ammar Kabeel",
    "أخصائي تسويق إلكتروني",
    "SEO Specialist Riyadh",
    "E-commerce SEO Saudi Arabia",
    "مسوق إلكتروني الرياض",
  ],
  authors: [{ name: "Ammar Kabeel" }],
  creator: "Ammar Kabeel",
  verification: {
    google: "JlugPlzSuI0qrckL10sHaBY47-m-7LuyouBMzj8J0qQ",
  },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    alternateLocale: "en_US",
    title: "Ammar Kabeel | Digital Marketing",
    description:
      "خبرة في SEO للمتاجر الإلكترونية، المحتوى، السوشيال ميديا وتحليل الأداء في السوق السعودي.",
    images: [
      {
        url: `${BASE_PATH}/portfolio/ammar-kabeel.webp`,
        width: 1023,
        height: 1537,
        alt: "Ammar Kabeel",
      },
    ],
  },
  other: process.env.NEXT_PUBLIC_SITE_URL
    ? undefined
    : { "codex-preview": "development" },
  icons: {
    icon: `${BASE_PATH}/favicon.svg`,
    shortcut: `${BASE_PATH}/favicon.svg`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoKufiArabic.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
