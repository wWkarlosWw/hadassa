import { connection } from "next/server";
import { Header } from "@/modules/site/header";
import { Footer } from "@/modules/site/footer";
import { AnnouncementBar } from "@/modules/site/announcement-bar";
import { getSection } from "@/modules/cms/service";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Contenido editable desde el CMS: se renderiza en cada request.
  await connection();
  const site = await getSection("site");
  return (
    <div className="flex min-h-dvh flex-col">
      {site.announcementEnabled && site.announcementText && (
        <AnnouncementBar text={site.announcementText} linkLabel={site.announcementLinkLabel} href={site.announcementLink} />
      )}
      <Header />
      <main id="contenido" className="relative flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
