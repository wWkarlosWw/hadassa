/**
 * Seed idempotente: usuarios demo (Supabase Auth + perfiles), proyectos,
 * valores, organigrama, aliados, recompensas y actividades.
 *
 *   npm run db:seed        (requiere `supabase start`)
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Role } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL }),
});

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PASSWORD = process.env.SEED_DEFAULT_PASSWORD ?? "Hadassa2026!";

async function ensureUser(email: string, fullName: string, role: Role, phone: string) {
  // Busca en Auth (paginado) para no duplicar.
  let authId: string | undefined;
  for (let page = 1; !authId; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    authId = data.users.find((u) => u.email === email)?.id;
    if (data.users.length < 200) break;
  }

  if (!authId) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: fullName, phone },
    });
    if (error || !data.user) throw error ?? new Error(`No se pudo crear ${email}`);
    authId = data.user.id;
  }

  return prisma.profile.upsert({
    where: { id: authId },
    update: { role, fullName },
    create: { id: authId, email, fullName, role, phone },
  });
}

const PROJECTS = [
  {
    slug: "fundacion-hadassa",
    name: "Fundación Hadassa",
    isMain: true,
    color: "#E3AAAA",
    logoUrl: "/brand/logo.webp",
    coverUrl: "/images/fotos/mujeres-hadassa.webp",
    category: "Donde más se necesite",
    location: "La Paz, Bolivia",
    tagline: "Tu aporte llega donde más se necesita.",
    description:
      "Al donar a la Fundación Hadassa, tu aporte se destina al proyecto o necesidad más urgente de cada mes: útiles y alimentos para los niños, atención médica, formación espiritual y acompañamiento a mujeres.",
    story:
      "Hadassa es un grupo de mujeres conformado para ayudar a otras mujeres, llevando el aroma de Cristo.\n\nCuando donas a la fundación sin elegir un proyecto, nuestro equipo destina tu aporte a donde más se necesita en ese momento: Casa de Fruto, Alimento Diario, Palabras de Vida u Olor Fragante.\n\nCada mes rendimos cuentas en la sección de novedades. ¡Gracias por ser parte de la transformación!",
    goal: 50000,
    beneficiaries: 300,
    featured: true,
  },
  {
    slug: "casa-de-fruto",
    coverUrl: "/images/fotos/aula-casa-de-fruto.webp",
    name: "Casa de Fruto",
    color: "#E3AAAA",
    logoUrl: "/brand/logo.webp",
    tagline:
      "Centro infantil para hijos de mujeres privadas de libertad: educación, salud, alimentación y el amor del Padre.",
    description:
      "El Centro infantil “Casa de Fruto” nace como una encomienda del Padre a Hadassa para apoyar a niños en situación vulnerable con educación, salud, alimentación y cuidados, mostrando el amor que tiene el Padre sobre ellos.",
    goal: 35000,
    beneficiaries: 40,
    featured: true,
  },
  {
    slug: "palabras-de-vida",
    coverUrl: "/images/fotos/palabras-de-vida.webp",
    name: "Palabras de Vida",
    color: "#8e9ace",
    logoUrl: "/brand/palabras-de-vida-white.webp",
    tagline: "Formación espiritual y acompañamiento para sanar, restaurar y transformar vidas.",
    description:
      "Espacios de enseñanza, consejería y oración donde mujeres y familias encuentran en la Palabra de Dios identidad, propósito y esperanza.",
    goal: 15000,
    beneficiaries: 120,
    featured: false,
  },
  {
    slug: "alimento-diario",
    coverUrl: "/images/fotos/alimento-diario.webp",
    name: "Alimento Diario",
    color: "#7f5153",
    logoUrl: "/brand/alimento-diario-white.webp",
    tagline: "Nutrición básica para niños y familias en situación de vulnerabilidad.",
    description:
      "Llevamos alimento a la mesa de quienes más lo necesitan, porque la restauración también empieza por cuidar el cuerpo.",
    goal: 20000,
    beneficiaries: 80,
    featured: false,
  },
  {
    slug: "olor-fragante",
    coverUrl: "/images/fotos/olor-fragante.webp",
    name: "Olor Fragante",
    color: "#b68286",
    logoUrl: "/brand/olor-fragante-white.webp",
    tagline: "Mujeres que acompañan a otras mujeres llevando el aroma de Cristo.",
    description:
      "Acompañamiento integral a mujeres: visitas, talleres y redes de apoyo para que florezcan en su identidad y propósito.",
    goal: 12000,
    beneficiaries: 60,
    featured: false,
  },
];

// Valores tal como aparecen en el árbol de mirto de la maqueta.
const VALUES = [
  ["Fe y Esperanza", "Fundamos nuestras acciones en la fe en Dios y en la convicción de que toda vida puede ser transformada, restaurada y fortalecida por Su gracia."],
  ["Justicia", "Promovemos y practicamos la justicia de Dios en cada una de nuestras acciones a fin de dar fruto y que este sea abundante."],
  ["Excelencia", "Desarrollamos programas y acciones con calidad, profesionalismo y dedicación, honrando a Dios en cada labor que realizamos."],
  ["Innovación", "Buscamos ideas creativas que tienen el potencial para cambiar el mundo, sin comprometer nuestros valores."],
  ["Integridad y Verdad", "Gestionamos recursos, proyectos y relaciones con honestidad y responsabilidad."],
  ["Amor y Compasión", "Servimos a cada persona con el amor de Cristo, mostrando empatía, respeto y sensibilidad ante las realidades humanas."],
  ["Servicio", "Actuamos con espíritu de entrega, cooperación y generosidad."],
  ["Unidad", "Somos parte de un mismo cuerpo cuya cabeza es Cristo."],
  ["Hospitalidad y Confianza", "Acogemos a cada persona con calidez y el amor de Cristo."],
] as const;

// Organigrama general (solo áreas).
const ORG_AREAS = [
  ["Dirección General", "Guía la visión y las decisiones estratégicas de la fundación.", "compass", "#5a9e9a"],
  ["Salud", "Atención médica y dental para los niños y sus familias.", "stethoscope", "#8e9ace"],
  ["Fundraising", "Recaudación de fondos y relación con donantes y aliados.", "hand-coins", "#b68286"],
  ["Comunicación y Diseño", "Comunica lo que Dios hace a través de Hadassa.", "megaphone", "#d4a94e"],
  ["Coordinación Administrativa", "Administra recursos, procesos y transparencia.", "clipboard-list", "#c9693f"],
  ["Educación", "Apoyo escolar y estimulación temprana en Casa de Fruto.", "graduation-cap", "#7f9a3c"],
] as const;

async function main() {
  console.log("🌸 Sembrando datos de Fundación Hadassa…");

  const admin = await ensureUser("admin@hadassa.org", "Administración Hadassa", "ADMIN", "70000001");
  const supervisor = await ensureUser("supervisor@hadassa.org", "Supervisora Hadassa", "SUPERVISOR", "70000002");
  const user = await ensureUser("usuario@hadassa.org", "Donante Demo", "USER", "70000003");
  console.log(`  ✓ usuarios (contraseña: ${PASSWORD})`);

  const projects: Record<string, string> = {};
  for (const [i, p] of PROJECTS.entries()) {
    const isMain = "isMain" in p && p.isMain;
    // Solo puede haber una fundación principal: si ya existe otra, esta no se marca.
    const hasMain = isMain && (await prisma.project.count({ where: { isMain: true, NOT: { slug: p.slug } } })) > 0;
    const row = await prisma.project.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, isMain: isMain && !hasMain, sortOrder: i - 1 },
    });
    projects[p.slug] = row.id;
  }
  console.log(`  ✓ ${PROJECTS.length} proyectos`);

  if ((await prisma.coreValue.count()) === 0) {
    await prisma.coreValue.createMany({
      data: VALUES.map(([title, description], i) => ({ title, description, sortOrder: i })),
    });
  }
  if ((await prisma.orgArea.count()) === 0) {
    await prisma.orgArea.createMany({
      data: ORG_AREAS.map(([name, description, icon, color], i) => ({ name, description, icon, color, sortOrder: i })),
    });
  }
  console.log("  ✓ valores y organigrama");

  if ((await prisma.ally.count()) === 0) {
    const cafe = await prisma.ally.create({
      data: { name: "Café Mirto", description: "Cafetería aliada en La Paz.", website: "https://example.com" },
    });
    const libreria = await prisma.ally.create({
      data: { name: "Librería Palabra Viva", description: "Libros y material escolar." },
    });
    await prisma.reward.createMany({
      data: [
        { title: "10% en Café Mirto", description: "Descuento en tu consumo.", code: "HADASSA10", discountPercent: 10, pointsCost: 300, allyId: cafe.id },
        { title: "Bebida gratis", description: "Una bebida caliente de cortesía.", code: "MIRTO-BEBIDA", pointsCost: 800, stock: 50, allyId: cafe.id },
        { title: "15% en útiles escolares", description: "Válido en toda la tienda.", code: "PALABRA15", discountPercent: 15, pointsCost: 500, allyId: libreria.id },
        { title: "Libro devocional", description: "Un libro devocional a elección.", code: "DEVOCIONAL", pointsCost: 2000, stock: 10, allyId: libreria.id },
      ],
    });
    console.log("  ✓ aliados y recompensas");
  }

  if ((await prisma.event.count()) === 0) {
    const day = 24 * 3600 * 1000;
    const event = await prisma.event.create({
      data: {
        title: "Jornada de apoyo escolar",
        description: "Acompañamos a los niños de Casa de Fruto con tareas, lectura y juegos.",
        location: "Casa de Fruto, Obrajes — La Paz",
        startsAt: new Date(Date.now() + 7 * day),
        capacity: 20,
        pointsReward: 80,
        projectId: projects["casa-de-fruto"],
      },
    });
    await prisma.event.createMany({
      data: [
        {
          title: "Entrega de canastas — Alimento Diario",
          description: "Armado y entrega de canastas familiares.",
          location: "La Paz",
          startsAt: new Date(Date.now() + 14 * day),
          capacity: 30,
          pointsReward: 60,
          projectId: projects["alimento-diario"],
        },
        {
          title: "Noche de adoración y oración",
          description: "Un tiempo para orar por las mujeres y los niños que acompañamos.",
          location: "Sede de la fundación",
          startsAt: new Date(Date.now() + 21 * day),
          pointsReward: 40,
          projectId: projects["palabras-de-vida"],
        },
      ],
    });
    await prisma.eventSupervisor.create({ data: { profileId: supervisor.id, eventId: event.id } });
    await prisma.eventParticipation.create({ data: { profileId: user.id, eventId: event.id } });
    console.log("  ✓ actividades");
  }

  if ((await prisma.donation.count()) === 0) {
    await prisma.donation.createMany({
      data: [
        { amount: 150, method: "QR", profileId: user.id, projectId: projects["casa-de-fruto"], note: "Para los útiles de los niños" },
        { amount: 300, method: "TRANSFER", profileId: user.id, projectId: projects["alimento-diario"], reference: "TRX-0001" },
      ],
    });
    // Una donación ya aprobada con su movimiento de puntos.
    const approved = await prisma.donation.create({
      data: {
        amount: 100,
        method: "QR",
        status: "APPROVED",
        profileId: user.id,
        projectId: projects["casa-de-fruto"],
        validatedById: admin.id,
        validatedAt: new Date(),
        pointsAwarded: 1000,
      },
    });
    await prisma.$transaction([
      prisma.profile.update({ where: { id: user.id }, data: { points: { increment: 1000 } } }),
      prisma.pointsTransaction.create({
        data: { profileId: user.id, amount: 1000, reason: "DONATION", description: "Donación de Bs. 100", referenceId: approved.id, createdById: admin.id },
      }),
    ]);
    console.log("  ✓ donaciones de ejemplo");
  }

  if ((await prisma.menuItem.count()) === 0) {
    const header = ["Inicio:/", "Nosotros:/nosotros", "Proyectos y donaciones:/donar", "Casa de Fruto:/casa-de-fruto", "Actividades:/actividades", "Contacto:/contacto"];
    const footer = [...header, "Mi cuenta:/ingresar"];
    const rows = (list: string[], location: "HEADER" | "FOOTER") =>
      list.map((entry, sortOrder) => {
        const [label, href] = entry.split(":");
        return { label, href, location, sortOrder };
      });
    await prisma.menuItem.createMany({ data: [...rows(header, "HEADER"), ...rows(footer, "FOOTER")] });
    console.log("  ✓ menú del sitio");
  }

  // Proyectos y donaciones son una sola sección (/donar): migra menús antiguos
  // sin duplicar enlaces.
  await prisma.menuItem.updateMany({ where: { href: "/proyectos" }, data: { href: "/donar", label: "Proyectos y donaciones" } });
  for (const location of ["HEADER", "FOOTER"] as const) {
    const donar = await prisma.menuItem.findMany({ where: { location, href: "/donar" }, orderBy: { sortOrder: "asc" } });
    if (donar.length > 1) {
      await prisma.menuItem.deleteMany({ where: { id: { in: donar.slice(1).map((d) => d.id) } } });
    }
    if (donar[0] && donar[0].label !== "Proyectos y donaciones") {
      await prisma.menuItem.update({ where: { id: donar[0].id }, data: { label: "Proyectos y donaciones" } });
    }
  }

  if ((await prisma.page.count()) === 0) {
    await prisma.page.create({
      data: {
        slug: "transparencia",
        title: "Transparencia",
        excerpt: "Cómo usamos cada aporte que recibimos.",
        published: false,
        blocks: [
          { id: "t1", type: "heading", text: "Rendición de cuentas", level: "2" },
          {
            id: "t2",
            type: "paragraph",
            text: "Página de ejemplo creada con el editor por bloques. Edítala o elimínala desde Panel → Páginas.",
          },
        ],
      },
    });
    console.log("  ✓ página de ejemplo (borrador)");
  }


  // ── Campañas: categoría, ubicación, novedades y palabras de apoyo ──────────
  const CAMPAIGN_META: Record<string, { category: string; location: string; endsInDays?: number }> = {
    "casa-de-fruto": { category: "Infancia y educación", location: "Obrajes, La Paz", endsInDays: 75 },
    "palabras-de-vida": { category: "Formación espiritual", location: "La Paz, Bolivia" },
    "alimento-diario": { category: "Alimentación", location: "La Paz, Bolivia", endsInDays: 45 },
    "olor-fragante": { category: "Mujeres", location: "La Paz, Bolivia" },
  };
  for (const [slug, meta] of Object.entries(CAMPAIGN_META)) {
    await prisma.project.updateMany({
      where: { slug, category: "" },
      data: {
        category: meta.category,
        location: meta.location,
        endsAt: meta.endsInDays ? new Date(Date.now() + meta.endsInDays * 86_400_000) : null,
      },
    });
  }

  if ((await prisma.projectUpdate.count()) === 0) {
    const day = 86_400_000;
    await prisma.projectUpdate.createMany({
      data: [
        {
          projectId: projects["casa-de-fruto"],
          authorId: admin.id,
          title: "¡Útiles escolares para todos!",
          body: "Gracias a sus donaciones cada niño de Casa de Fruto empezó el trimestre con mochila, cuadernos y colores nuevos.",
          imageUrl: "/images/fotos/nina-al-aula.webp",
          createdAt: new Date(Date.now() - 6 * day),
        },
        {
          projectId: projects["casa-de-fruto"],
          authorId: admin.id,
          title: "Nuevo rincón de lectura",
          body: "Armamos un rincón de lectura con libros donados y cojines cosidos por las mamás.",
          createdAt: new Date(Date.now() - 20 * day),
        },
        {
          projectId: projects["alimento-diario"],
          authorId: admin.id,
          title: "120 platos servidos este mes",
          body: "La cocina comunitaria funcionó todas las semanas. ¡Seguimos sumando!",
          imageUrl: "/images/fotos/alimento-diario.webp",
          createdAt: new Date(Date.now() - 3 * day),
        },
      ],
    });
    console.log("  ✓ novedades de campañas");
  }

  if ((await prisma.donation.count({ where: { message: { not: null } } })) === 0) {
    const hour = 3_600_000;
    // Donaciones registradas por la fundación (sin cuenta → sin puntos).
    const supporters = [
      { slug: "casa-de-fruto", amount: 250, donorName: "María Fernanda Quispe", message: "¡Con mucho cariño para los niños de Casa de Fruto!", ago: 2 },
      { slug: "casa-de-fruto", amount: 100, donorName: "Anónimo", isAnonymous: true, message: "Que Dios bendiga su trabajo.", ago: 9 },
      { slug: "alimento-diario", amount: 500, donorName: "Iglesia Vida Nueva", message: "Unidos para que ninguna mesa quede vacía.", ago: 30 },
      { slug: "palabras-de-vida", amount: 150, donorName: "Lucía Mamani", message: "Gracias por acompañar a tantas mujeres.", ago: 52 },
      { slug: "olor-fragante", amount: 80, donorName: "Carla R.", ago: 70 },
    ];
    for (const s of supporters) {
      await prisma.donation.create({
        data: {
          amount: s.amount,
          method: "TRANSFER",
          status: "APPROVED",
          donorName: s.donorName,
          isAnonymous: s.isAnonymous ?? false,
          message: s.message ?? null,
          projectId: projects[s.slug],
          validatedById: admin.id,
          validatedAt: new Date(Date.now() - s.ago * hour),
          createdAt: new Date(Date.now() - s.ago * hour),
        },
      });
    }
    console.log("  ✓ palabras de apoyo");
  }

  console.log("🌳 Listo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
