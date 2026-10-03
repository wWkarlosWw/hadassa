"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ExternalLink, LogOut, Menu, X } from "lucide-react";
import { logoutAction } from "@/modules/auth/actions";
import { cn, formatNumber } from "@/shared/lib/utils";
import type { Role } from "@/generated/prisma/enums";
import { NAV_BY_ROLE } from "./nav";

const ROLE_LABEL: Record<Role, string> = { USER: "Donante", SUPERVISOR: "Supervisor", ADMIN: "Administrador" };

interface ShellUser {
  fullName: string;
  email: string;
  role: Role;
  points: number;
}

function isActive(pathname: string, href: string) {
  if (href === "/panel") return pathname === "/panel";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarContent({ user, onNavigate }: { user: ShellUser; onNavigate?: () => void }) {
  const pathname = usePathname();
  const groups = NAV_BY_ROLE[user.role];
  const initials = user.fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex h-full flex-col">
      <Link href="/panel" onClick={onNavigate} className="flex items-center gap-3 px-5 py-5">
        <Image src="/brand/logo.webp" alt="" width={44} height={44} className="size-11" priority />
        <span className="leading-tight">
          <span className="block font-serif text-lg text-tinta">Hadassa</span>
          <span className="block text-xs text-tinta-suave">Panel {ROLE_LABEL[user.role].toLowerCase()}</span>
        </span>
      </Link>

      <nav aria-label="Panel" className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {groups.map((group, i) => (
          <div key={group.title ?? i}>
            {group.title && (
              <p className="px-3 pb-1.5 text-[0.68rem] font-semibold tracking-[0.16em] text-tinta-suave/80 uppercase">
                {group.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        active ? "bg-rosa-100 text-vino" : "text-tinta-suave hover:bg-crema hover:text-tinta",
                      )}
                    >
                      <Icon className={cn("size-[18px] shrink-0", active ? "text-vino" : "text-tinta-suave/80 group-hover:text-tinta")} aria-hidden />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-2 border-t border-borde p-3">
        <div className="flex items-center gap-3 rounded-xl bg-crema px-3 py-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-rosa font-semibold text-vino-700">
            {initials || "H"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-tinta">{user.fullName}</p>
            <p className="truncate text-xs text-tinta-suave">
              {ROLE_LABEL[user.role]} · <span className="font-semibold text-lavanda-700">{formatNumber(user.points)} pts</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-tinta-suave hover:bg-crema hover:text-tinta"
          >
            <ExternalLink className="size-3.5" aria-hidden /> Ver sitio
          </Link>
          <form action={logoutAction} className="flex-1">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-tinta-suave hover:bg-error-50 hover:text-error"
            >
              <LogOut className="size-3.5" aria-hidden /> Salir
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function PanelShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Cierra el drawer con Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="min-h-dvh bg-crema lg:flex">
      {/* Escritorio */}
      <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 border-r border-borde bg-papel lg:block">
        <SidebarContent user={user} />
      </aside>

      {/* Móvil: barra superior + drawer */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-borde bg-papel/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/panel" className="flex items-center gap-2">
          <Image src="/brand/logo.webp" alt="" width={36} height={36} className="size-9" />
          <span className="font-serif text-lg">Hadassa</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid size-10 place-items-center rounded-full text-tinta hover:bg-crema"
          aria-label="Abrir menú"
          aria-expanded={open}
          aria-controls="panel-drawer"
        >
          <Menu className="size-5" />
        </button>
      </header>

      <div
        className={cn("fixed inset-0 z-40 bg-noche-900/40 backdrop-blur-sm transition-opacity lg:hidden", open ? "opacity-100" : "pointer-events-none opacity-0")}
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <aside
        id="panel-drawer"
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[min(18rem,85vw)] bg-papel shadow-2xl transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!open}
        inert={!open}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute top-4 right-3 grid size-9 place-items-center rounded-full text-tinta-suave hover:bg-crema"
          aria-label="Cerrar menú"
        >
          <X className="size-5" />
        </button>
        <SidebarContent key={pathname} user={user} onNavigate={() => setOpen(false)} />
      </aside>

      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
