import type { Metadata, Viewport } from "next";
import { Great_Vibes, Montserrat, Rufina } from "next/font/google";
import { getSectionSafe } from "@/modules/cms/service";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", display: "swap" });
const rufina = Rufina({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-rufina", display: "swap" });
const script = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-script", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  // Sin base de datos (p. ej. durante el build) se usan los textos por defecto.
  const [seo, site] = await Promise.all([getSectionSafe("seo"), getSectionSafe("site")]);
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: seo.defaultTitle, template: `%s · ${seo.titleSuffix}` },
    description: seo.defaultDescription,
    openGraph: {
      type: "website",
      locale: "es_BO",
      siteName: site.siteName,
      images: seo.ogImageUrl ? [seo.ogImageUrl] : undefined,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#E3AAAA",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${montserrat.variable} ${rufina.variable} ${script.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
