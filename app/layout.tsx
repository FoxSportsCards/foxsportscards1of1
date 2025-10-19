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
  title: "foxsportscards — Premium Collectibles",
  description: "Coleccionables premium: cartas deportivas, TCG y memorabilia curada. Compra directa y asesoría personalizada.",
  openGraph: {
    title: "foxsportscards — Premium Collectibles",
    description: "Cartas deportivas, TCG y memorabilia curada para coleccionistas exigentes.",
    url: "https://www.foxsportscards.com",
    siteName: "foxsportscards",
    images: ["/og.jpg"],
    locale: "es_DO",
    type: "website",
  },
  metadataBase: new URL("https://foxsportscards.pages.dev"),
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
