import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/session";
import { getPageBySlug } from "@/modules/pages/service";
import { BlockRenderer } from "@/modules/pages/components/block-renderer";
import { PageHero } from "@/modules/site/page-hero";

/** Las vistas previas de borradores solo las ve un admin (?vista-previa=1). */
async function loadPage(slug: string, preview: boolean) {
  if (preview) {
    const user = await getCurrentUser();
    if (user?.role === "ADMIN") return getPageBySlug(slug, true);
  }
  return getPageBySlug(slug);
}

export async function generateMetadata(props: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const page = await getPageBySlug(slug);
  if (!page) return { robots: { index: false } };
  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || page.excerpt || undefined,
    openGraph: page.coverUrl ? { images: [page.coverUrl] } : undefined,
  };
}

export default async function CustomPage(props: PageProps<"/[slug]">) {
  const [{ slug }, sp] = await Promise.all([props.params, props.searchParams]);
  const page = await loadPage(slug, sp["vista-previa"] === "1");
  if (!page) notFound();

  return (
    <>
      {!page.published && (
        <p className="fixed inset-x-0 bottom-0 z-[70] bg-alerta px-4 py-2 text-center text-sm font-semibold text-white">
          Vista previa: esta página aún no está publicada.
        </p>
      )}
      {page.coverUrl ? (
        <section className="relative isolate flex min-h-[55svh] items-end overflow-hidden pb-16 pt-40">
          <Image src={page.coverUrl} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-noche-900/80 via-noche-900/40 to-transparent" aria-hidden />
          <div className="mx-auto w-full max-w-3xl px-4 text-white sm:px-6">
            <h1 className="font-serif text-5xl sm:text-6xl">{page.title}</h1>
            {page.excerpt && <p className="mt-4 text-lg text-white/85">{page.excerpt}</p>}
          </div>
        </section>
      ) : (
        <PageHero eyebrow="" title={page.title} subtitle={page.excerpt || undefined} />
      )}
      <article className="bg-crema px-4 pb-28 pt-12 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <BlockRenderer blocks={page.blocks} />
        </div>
      </article>
    </>
  );
}
