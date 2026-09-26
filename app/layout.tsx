import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Ijen Tour | Wisata Kawah Ijen Banyuwangi",
    template: "%s | Ijen Tour Banyuwangi",
  },
  description: "Paket wisata Kawah Ijen Banyuwangi, blue fire, Djawatan, Green Island, Red Island, Taman Nasional Baluran, dan Kawah Wurung bersama pemandu lokal.",
  keywords: [
    "wisata Kawah Ijen",
    "tour Banyuwangi",
    "blue fire Ijen",
    "Djawatan",
    "Green Island Banyuwangi",
    "Red Island Banyuwangi",
    "Taman Nasional Baluran",
    "Kawah Wurung",
  ],
  authors: [{ name: "Ijen Tour" }],
  openGraph: {
    title: "Ijen Tour | Wisata Kawah Ijen Banyuwangi",
    description: "Jelajahi Kawah Ijen dan destinasi terbaik Banyuwangi bersama pemandu lokal.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${plusJakartaSans.className} text-secondary-950 bg-secondary-50 min-h-screen flex flex-col antialiased`}>
        {children}
      </body>
    </html>
  );
}
