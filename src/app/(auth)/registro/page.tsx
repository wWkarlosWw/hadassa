import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { RegisterForm } from "@/modules/site/auth/register-form";
import { getSection } from "@/modules/cms/service";

export async function generateMetadata(): Promise<Metadata> {
  const a = await getSection("authPages");
  return { title: a.registerTitle, robots: { index: false } };
}

export default async function RegistroPage(props: PageProps<"/registro">) {
  const sp = await props.searchParams;
  const next = typeof sp.next === "string" ? sp.next : undefined;
  const [a, site] = await Promise.all([getSection("authPages"), getSection("site")]);
  return (
    <>
      <Image src={site.logoUrl || "/brand/logo.webp"} alt="" width={80} height={80} className="mb-6 size-16 lg:hidden" />
      <p className="eyebrow text-malva">{a.registerEyebrow}</p>
      <h1 className="mt-2 font-serif text-4xl text-tinta">{a.registerTitle}</h1>
      <p className="mb-8 mt-2 text-sm text-tinta-suave">{a.registerSubtitle}</p>
      <RegisterForm next={next} />
      <p className="mt-8 text-center text-sm text-tinta-suave">
        {a.registerHaveAccount}{" "}
        <Link href={next ? `/ingresar?next=${encodeURIComponent(next)}` : "/ingresar"} className="font-semibold text-lavanda-700 underline-offset-4 hover:underline">
          {a.registerLoginLink}
        </Link>
      </p>
    </>
  );
}
