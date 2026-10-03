"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CAMPAIGN_SORTS, SORT_LABELS, type CampaignSort } from "@/modules/projects/campaign";

/** Selector de orden: actualiza la URL (los filtros se aplican en el servidor). */
export function SortSelect({ value, label }: { value: CampaignSort; label: string }) {
  const router = useRouter();
  const params = useSearchParams();
  return (
    <label className="flex items-center gap-2 text-sm text-tinta-suave">
      <span className="whitespace-nowrap">{label}</span>
      <select
        name="orden"
        value={value}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString());
          if (e.target.value === "destacadas") next.delete("orden");
          else next.set("orden", e.target.value);
          router.push(`/proyectos${next.size ? `?${next}` : ""}#campanas`, { scroll: false });
        }}
        className="h-10 rounded-full border border-borde bg-papel px-3.5 pr-8 text-sm text-tinta focus:border-lavanda focus:ring-4 focus:ring-lavanda-100 focus:outline-none"
      >
        {CAMPAIGN_SORTS.map((s) => (
          <option key={s} value={s}>
            {SORT_LABELS[s]}
          </option>
        ))}
      </select>
    </label>
  );
}
