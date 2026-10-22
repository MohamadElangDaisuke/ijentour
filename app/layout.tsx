import type { Metadata } from "next";
import Script from "next/script";
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
    default: "Ijen Tour | Mount Ijen Crater & Blue Fire Banyuwangi",
    template: "%s | Ijen Tour Banyuwangi",
  },
  description: "Mount Ijen Crater tour packages in Banyuwangi, rare electric blue fire phenomenon, golden sunrise, Baluran National Park, and De Djawatan Forest with licensed local guides.",
  keywords: [
    "Mount Ijen tour",
    "Banyuwangi tour",
    "Ijen blue fire",
    "Ijen midnight trip",
    "Kawah Wurung",
    "Baluran National Park",
    "De Djawatan forest",
    "Banyuwangi travel package",
    "Ijen crater open trip",
    "Ijen private tour",
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
    title: "Ijen Tour | Mount Ijen Crater & Blue Fire Banyuwangi",
    description: "Explore the wonder of Mount Ijen's electric blue fire and the best landscapes of Banyuwangi with licensed local guides.",
    url: "https://ijentour.vercel.app",
    siteName: "Ijen Tour Banyuwangi",
    images: [
      {
        url: "https://ijentour.vercel.app/images/HeroSection.webp",
        width: 1200,
        height: 630,
        alt: "Mount Ijen Crater Exploration Banyuwangi",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ijen Tour | Mount Ijen Crater & Blue Fire Banyuwangi",
    description: "Official Mount Ijen tour packages with gas respirators, certified local guides, and hotel pickup.",
    images: ["https://ijentour.vercel.app/images/HeroSection.webp"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={plusJakartaSans.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${plusJakartaSans.className} font-sans text-secondary-950 bg-secondary-50 min-h-screen flex flex-col antialiased`}>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(() => {
            const savedTheme = localStorage.getItem("ijentour-theme");
            const theme = savedTheme === "dark" ? "dark" : "light";
            document.documentElement.classList.toggle("dark", theme === "dark");
            document.documentElement.style.colorScheme = theme;
          })();`}
        </Script>
        {children}
      </body>
    </html>
  );
}
