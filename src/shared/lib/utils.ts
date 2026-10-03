import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const currency = new Intl.NumberFormat("es-BO", {
  style: "currency",
  currency: "BOB",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatBs(value: number | string | { toString(): string } | null | undefined) {
  const n = typeof value === "number" ? value : Number(value?.toString() ?? 0);
  return currency.format(Number.isFinite(n) ? n : 0).replace("BOB", "Bs.");
}

export function formatDate(value: Date | string, opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" }) {
  return new Intl.DateTimeFormat("es-BO", { timeZone: "America/La_Paz", ...opts }).format(new Date(value));
}

export function formatDateTime(value: Date | string) {
  return formatDate(value, { dateStyle: "medium", timeStyle: "short" });
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("es-BO").format(value);
}

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
