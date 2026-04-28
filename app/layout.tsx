import "./globals.css";
import type { Metadata } from "next";
import clsx from "clsx";
import { Chakra_Petch, Space_Grotesk, Permanent_Marker } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getServerLocale } from "@/lib/getServerLocale";

const sans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const graffiti = Permanent_Marker({
  subsets: ["latin"],
  variable: "--font-graffiti",
  display: "swap",
  weight: "400",
});

const heading = Chakra_Petch({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Fox Sports Cards 1of1 | Boutique de Coleccionables",
  description:
    "Cartas, memorabilia y coleccionables premium en una tienda online creada para compradores reales.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    title: "Fox Sports Cards 1of1 | Boutique de Coleccionables",
    description: "Compra coleccionables deportivos autenticados y piezas de alta demanda.",
    url: "https://foxsportscards1of1.com",
    siteName: "Fox Sports Cards 1of1",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Fox Sports Cards 1of1",
      },
    ],
    locale: "es_DO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fox Sports Cards 1of1",
    description: "Boutique digital de coleccionables deportivos premium.",
    images: ["/og.jpg"],
  },
  metadataBase: new URL("https://foxsportscards1of1.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = getServerLocale();

  return (
    <html lang={locale} className="scroll-smooth">
      <body className={clsx(sans.variable, heading.variable, graffiti.variable, "min-h-screen")}>
        <Header locale={locale} />
        <main className="relative min-h-[70vh]">{children}</main>
        <Footer locale={locale} />
      </body>
    </html>
  );
}
