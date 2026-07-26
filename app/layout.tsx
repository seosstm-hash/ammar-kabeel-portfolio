import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";

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
  title: {
    default: "عمار قابيل | أخصائي تسويق إلكتروني",
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
  openGraph: {
    type: "website",
    locale: "ar_SA",
    alternateLocale: "en_US",
    title: "عمار قابيل | أخصائي تسويق إلكتروني",
    description:
      "خبرة في SEO للمتاجر الإلكترونية، المحتوى، السوشيال ميديا وتحليل الأداء في السوق السعودي.",
    images: [
      {
        url: "/portfolio/ammar-kabeel.jpg",
        width: 1080,
        height: 1620,
        alt: "Ammar Kabeel",
      },
    ],
  },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
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
