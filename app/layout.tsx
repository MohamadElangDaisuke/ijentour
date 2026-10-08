import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://ijentour.vercel.app"),
  title: {
    default: "Ijen Tour | Wisata Kawah Ijen & Blue Fire Banyuwangi",
    template: "%s | Ijen Tour Banyuwangi",
  },
  description: "Paket wisata Kawah Ijen Banyuwangi, fenomena langka blue fire, golden sunrise, Taman Nasional Baluran, dan Hutan De Djawatan bersama pemandu lokal berlisensi.",
  keywords: [
    "wisata Kawah Ijen",
    "tour Banyuwangi",
    "blue fire Ijen",
    "midnight trip Ijen",
    "kawah wurung",
    "taman nasional baluran",
    "de djawatan banyuwangi",
    "paket wisata banyuwangi",
    "open trip kawah ijen",
    "private tour ijen",
  ],
  authors: [{ name: "Ijen Tour Expedition" }],
  creator: "Ijen Tour",
  publisher: "Ijen Tour",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Ijen Tour | Wisata Kawah Ijen & Blue Fire Banyuwangi",
    description: "Jelajahi keajaiban api biru Kawah Ijen dan panorama terbaik Banyuwangi bersama pemandu lokal berlisensi.",
    url: "https://ijentour.vercel.app",
    siteName: "Ijen Tour Banyuwangi",
    images: [
      {
        url: "/images/HeroSection.webp",
        width: 1200,
        height: 630,
        alt: "Eksplorasi Kawah Ijen Banyuwangi",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ijen Tour | Wisata Kawah Ijen & Blue Fire Banyuwangi",
    description: "Paket tur resmi Kawah Ijen dengan masker respirator, guide lokal, dan antar-jemput.",
    images: ["/images/HeroSection.webp"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={plusJakartaSans.variable} suppressHydrationWarning>
      <body className={`${plusJakartaSans.className} font-sans text-secondary-950 bg-secondary-50 min-h-screen flex flex-col antialiased`}>
        {children}
      </body>
    </html>
  );
}
