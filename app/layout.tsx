import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import clsx from "clsx";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const heading = Inter({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "foxsportscards1of1 - Premium Collectibles",
  description:
    "Coleccionables premium: cartas deportivas, TCG y memorabilia curada. Compra directa y asesoría personalizada.",
  openGraph: {
    title: "foxsportscards1of1 - Premium Collectibles",
    description: "Cartas deportivas, TCG y memorabilia curada para coleccionistas exigentes.",
    url: "https://foxsportscards1of1.com",
    siteName: "foxsportscards1of1",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "foxsportscards1of1 - Premium Collectibles",
      },
    ],
    locale: "es_DO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@foxsportscards1of1",
    creator: "@foxsportscards1of1",
    title: "foxsportscards1of1 - Premium Collectibles",
    description: "Cartas deportivas, TCG y memorabilia curada para coleccionistas exigentes.",
    images: ["/og.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon-32.png"],
  },
  metadataBase: new URL("https://foxsportscards1of1.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={clsx(sans.variable, heading.variable, "min-h-screen")}>
        <div className="pointer-events-none fixed inset-0 -z-10 bg-hero-gradient" />
        <Header />
        <main className="relative min-h-[70vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
