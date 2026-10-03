import { describe, expect, it } from "vitest";
import {
  daysLeft,
  donorDisplayName,
  filterCampaigns,
  parseSort,
  progressPercent,
  relativeTime,
  sortCampaigns,
  type CampaignLike,
} from "@/modules/projects/campaign";
import { createDonationSchema, messageVisibilitySchema } from "@/modules/donations/schemas";
import { projectSchema, projectUpdateSchema } from "@/modules/projects/schemas";

const NOW = new Date("2026-10-02T12:00:00Z");

describe("progressPercent", () => {
  it("calcula el porcentaje entero y lo limita a 100", () => {
    expect(progressPercent(250, 1000)).toBe(25);
    expect(progressPercent(999, 1000)).toBe(99);
    expect(progressPercent(5000, 1000)).toBe(100);
  });
  it("sin meta o sin recaudación es 0", () => {
    expect(progressPercent(100, null)).toBe(0);
    expect(progressPercent(100, 0)).toBe(0);
    expect(progressPercent(0, 1000)).toBe(0);
  });
});

describe("daysLeft", () => {
  it("redondea hacia arriba los días restantes", () => {
    expect(daysLeft(new Date("2026-10-03T00:00:00Z"), NOW)).toBe(1);
    expect(daysLeft(new Date("2026-10-12T12:00:00Z"), NOW)).toBe(10);
  });
  it("0 si ya cerró y null si no tiene fecha", () => {
    expect(daysLeft(new Date("2026-10-01T00:00:00Z"), NOW)).toBe(0);
    expect(daysLeft(null, NOW)).toBeNull();
  });
});

describe("relativeTime", () => {
  const ago = (ms: number) => new Date(NOW.getTime() - ms);
  it("expresa el tiempo transcurrido en español", () => {
    expect(relativeTime(ago(20_000), NOW)).toBe("ahora mismo");
    expect(relativeTime(ago(5 * 60_000), NOW)).toBe("hace 5 min");
    expect(relativeTime(ago(2 * 3_600_000), NOW)).toBe("hace 2 h");
    expect(relativeTime(ago(26 * 3_600_000), NOW)).toBe("hace 1 día");
    expect(relativeTime(ago(3 * 86_400_000), NOW)).toBe("hace 3 días");
    expect(relativeTime(ago(65 * 86_400_000), NOW)).toBe("hace 2 meses");
  });
});

describe("donorDisplayName", () => {
  it("muestra nombre e inicial del apellido", () => {
    expect(donorDisplayName({ isAnonymous: false, fullName: "María Fernanda quispe" })).toBe("María F.");
    expect(donorDisplayName({ isAnonymous: false, donorName: "Lucía" })).toBe("Lucía");
  });
  it("oculta el nombre en donaciones anónimas o sin nombre", () => {
    expect(donorDisplayName({ isAnonymous: true, fullName: "Ana Pérez" })).toBe("Anónimo");
    expect(donorDisplayName({ isAnonymous: false })).toBe("Anónimo");
  });
});

describe("filtro y orden de campañas", () => {
  const base = { tagline: "", location: "La Paz", sortOrder: 0, createdAt: "2026-01-01" };
  const list: CampaignLike[] = [
    { ...base, name: "Casa de Fruto", category: "Infancia", featured: true, raised: 500, goal: 1000, sortOrder: 2 },
    { ...base, name: "Alimento Diario", category: "Alimentación", featured: false, raised: 900, goal: 1000, createdAt: "2026-05-01" },
    { ...base, name: "Palabras de Vida", category: "Formación", featured: false, raised: 1200, goal: null, sortOrder: 1 },
  ];

  it("busca sin distinguir tildes ni mayúsculas, y filtra por categoría", () => {
    expect(filterCampaigns(list, { q: "alimentacion" }).map((c) => c.name)).toEqual(["Alimento Diario"]);
    expect(filterCampaigns(list, { category: "Infancia" }).map((c) => c.name)).toEqual(["Casa de Fruto"]);
    expect(filterCampaigns(list, {})).toHaveLength(3);
  });

  it("ordena según el criterio elegido", () => {
    expect(sortCampaigns(list, "destacadas")[0].name).toBe("Casa de Fruto");
    expect(sortCampaigns(list, "recientes")[0].name).toBe("Alimento Diario");
    expect(sortCampaigns(list, "mas-recaudado")[0].name).toBe("Palabras de Vida");
    // Sin meta va al final al ordenar por cercanía a la meta.
    expect(sortCampaigns(list, "cerca-de-la-meta").map((c) => c.name)).toEqual(["Alimento Diario", "Casa de Fruto", "Palabras de Vida"]);
  });

  it("parseSort usa «destacadas» ante valores desconocidos", () => {
    expect(parseSort("mas-recaudado")).toBe("mas-recaudado");
    expect(parseSort("hackeo")).toBe("destacadas");
    expect(parseSort(undefined)).toBe("destacadas");
  });
});

describe("esquemas de campaña y donación", () => {
  it("la donación acepta anónima, mensual y mensaje", () => {
    const d = createDonationSchema.parse({ amount: "50", isAnonymous: "true", isRecurring: "on", message: "  ¡Ánimo!  " });
    expect(d).toMatchObject({ isAnonymous: true, isRecurring: true, message: "¡Ánimo!" });
    expect(createDonationSchema.parse({ amount: "50", isAnonymous: "false" }).isAnonymous).toBe(false);
  });

  it("limita el mensaje a 500 caracteres", () => {
    expect(createDonationSchema.safeParse({ amount: "50", message: "x".repeat(501) }).success).toBe(false);
  });

  it("valida la visibilidad de mensajes", () => {
    expect(messageVisibilitySchema.parse({ id: "8b1c1f1e-7d6a-4a6b-9a55-2f1d2c3b4a5e", hidden: "true" }).hidden).toBe(true);
  });

  it("el proyecto acepta campos de campaña y fecha de cierre opcional", () => {
    const p = projectSchema.parse({ name: "Casa de Fruto", category: "Infancia", endsAt: "", acceptsDonations: "on" });
    expect(p.endsAt).toBeNull();
    expect(p.acceptsDonations).toBe(true);
    expect(projectSchema.parse({ name: "X proyecto", endsAt: "2026-12-31T23:59:59-04:00" }).endsAt).toBeInstanceOf(Date);
  });

  it("la novedad exige título y proyecto", () => {
    expect(projectUpdateSchema.safeParse({ projectId: "nope", title: "Hola" }).success).toBe(false);
    expect(projectUpdateSchema.safeParse({ projectId: "8b1c1f1e-7d6a-4a6b-9a55-2f1d2c3b4a5e", title: "Ok" }).success).toBe(false);
  });
});

describe("countLabel", () => {
  it("usa singular cuando n = 1", async () => {
    const { countLabel } = await import("@/modules/projects/campaign");
    expect(countLabel(1, "{n} donaciones", "{n} donación")).toBe("1 donación");
    expect(countLabel(3, "{n} donaciones", "{n} donación")).toBe("3 donaciones");
    expect(countLabel(1, "{n} donaciones")).toBe("1 donaciones");
  });
});
