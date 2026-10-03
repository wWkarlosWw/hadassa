"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Menu, UserRound, X } from "lucide-react";
import { buttonClasses } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import type { NavLink } from "./nav";

export interface HeaderBrand {
  siteName: string;
  eyebrow: string;
  script: string;
  logoUrl: string;
  mobileImageUrl: string;
}

export interface HeaderLabels {
  donate: string;
  donateMobile: string;
  login: string;
  loginMobile: string;
  panel: string;
}

function NavAnchor({ link, className, current }: { link: NavLink; className: string; current: boolean }) {
  if (link.newTab || /^https?:\/\//.test(link.href)) {
    return (
      <a href={link.href} target={link.newTab ? "_blank" : undefined} rel={link.newTab ? "noopener noreferrer" : undefined} className={className}>
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.href} aria-current={current ? "page" : undefined} className={className}>
      {link.label}
    </Link>
  );
}

export function HeaderClient({
  user,
  links,
  brand,
  labels,
  announcement = false,
}: {
  user: { name: string } | null;
  links: NavLink[];
  brand: HeaderBrand;
  labels: HeaderLabels;
  announcement?: boolean;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cierra el menú al navegar (ajuste de estado durante el render).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Bloquea el scroll mientras el menú está abierto.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const account = user
    ? { href: "/panel", label: labels.panel }
    : { href: "/ingresar", label: labels.login };

  return (
    <header
      className={cn(
        announcement && !scrolled && !open ? "absolute inset-x-0 z-50 transition-all duration-300" : "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || open ? "bg-papel/92 shadow-[0_1px_0_var(--color-borde)] backdrop-blur-md" : "bg-crema/60 backdrop-blur-sm",
      )}
    >
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded-full focus:bg-papel focus:px-4 focus:py-2 focus:text-sm">
        Saltar al contenido
      </a>
      <div className={cn("mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-all sm:px-6 lg:px-8", scrolled ? "h-16" : "h-20")}>
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label={`${brand.siteName} — inicio`}>
          <Image src={brand.logoUrl} alt="" width={48} height={48} priority className={cn("transition-all", scrolled ? "size-10" : "size-12")} />
          <span className="hidden leading-none sm:block">
            <span className="eyebrow block text-[0.62rem] text-malva">{brand.eyebrow}</span>
            <span className="font-script text-2xl text-vino">{brand.script}</span>
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {links.map((l) => (
              <li key={`${l.href}-${l.label}`}>
                <NavAnchor
                  link={l}
                  current={isActive(l.href)}
                  className={cn(
                    "relative rounded-full px-3.5 py-2 text-[0.8rem] font-medium tracking-wide text-tinta-suave transition hover:text-vino",
                    "after:absolute after:inset-x-3.5 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-rosa-500 after:transition-transform",
                    "hover:after:scale-x-100 aria-[current=page]:text-vino aria-[current=page]:after:scale-x-100",
                  )}
                />
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={account.href}
            className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-tinta-suave transition hover:text-vino sm:inline-flex"
          >
            <UserRound className="size-4" aria-hidden />
            {account.label}
          </Link>
          <Link href="/donar" className={buttonClasses("vino", "sm", "px-5")}>
            <Heart className="size-4 fill-current" aria-hidden />
            {labels.donate}
          </Link>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full text-tinta transition hover:bg-rosa-50 lg:hidden"
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <div
        id="menu-movil"
        hidden={!open}
        className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-borde bg-papel px-6 pb-10 pt-6 lg:hidden"
      >
        <nav aria-label="Menú móvil">
          <ul className="space-y-1">
            {links.map((l) => (
              <li key={`${l.href}-${l.label}`}>
                <NavAnchor
                  link={l}
                  current={isActive(l.href)}
                  className="block rounded-2xl px-4 py-3 font-serif text-2xl text-tinta transition hover:bg-rosa-50 aria-[current=page]:bg-rosa-50 aria-[current=page]:text-vino"
                />
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-8 grid gap-3">
          <Link href="/donar" className={buttonClasses("vino", "lg")}>
            <Heart className="size-4 fill-current" aria-hidden /> {labels.donateMobile}
          </Link>
          <Link href={account.href} className={buttonClasses("outline", "lg")}>
            <UserRound className="size-4" aria-hidden /> {user ? `${labels.panel} (${user.name})` : labels.loginMobile}
          </Link>
        </div>
        {brand.mobileImageUrl && <Image src={brand.mobileImageUrl} alt="" width={260} height={200} className="mx-auto mt-10 opacity-70" />}
      </div>
    </header>
  );
}
