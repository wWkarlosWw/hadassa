import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/modules/site/auth/login-form";
import { getSection } from "@/modules/cms/service";

export async function generateMetadata(): Promise<Metadata> {
  const a = await getSection("authPages");
  return { title: a.loginTitle, robots: { index: false } };
}

export default async function IngresarPage(props: PageProps<"/ingresar">) {
  const sp = await props.searchParams;
  const next = typeof sp.next === "string" ? sp.next : undefined;
  const inactive = sp.motivo === "inactivo";
  const [a, site] = await Promise.all([getSection("authPages"), getSection("site")]);

  return (
    <>
      <Image src={site.logoUrl || "/brand/logo.webp"} alt="" width={80} height={80} className="mb-6 size-16 lg:hidden" />
      <p className="eyebrow text-malva">{a.loginEyebrow}</p>
      <h1 className="mt-2 font-serif text-4xl text-tinta">{a.loginTitle}</h1>
      <p className="mb-8 mt-2 text-sm text-tinta-suave">{a.loginSubtitle}</p>
      {inactive && (
        <p role="alert" className="mb-5 rounded-xl bg-error-50 px-4 py-3 text-sm font-medium text-error">
          {a.loginInactive}
        </p>
      )}
      <LoginForm next={next} />
      <p className="mt-8 text-center text-sm text-tinta-suave">
        {a.loginNoAccount}{" "}
        <Link href={next ? `/registro?next=${encodeURIComponent(next)}` : "/registro"} className="font-semibold text-lavanda-700 underline-offset-4 hover:underline">
          {a.loginSignupLink}
        </Link>
      </p>
    </>
  );
}
