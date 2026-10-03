/**
 * Registro de contenido editable del sitio.
 *
 * Cada sección define sus campos (agrupados para el editor) y sus valores por
 * defecto. El panel de admin genera los formularios a partir de aquí y el sitio
 * público siempre tiene contenido aunque la base de datos esté vacía.
 *
 * Tipos de valor: texto, número, booleano (toggle) y listas repetibles de
 * objetos con campos de texto (p. ej. estadísticas o testimonios).
 */

export type ScalarFieldType = "text" | "textarea" | "url" | "image" | "number" | "phone" | "email" | "toggle";
export type FieldType = ScalarFieldType | "list";

export interface ListItemFieldDef {
  name: string;
  label: string;
  type: "text" | "textarea" | "url" | "image";
}

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  help?: string;
  /** Título del grupo en el editor (los campos consecutivos con el mismo grupo se agrupan). */
  group?: string;
  /** Solo para `list`: campos de cada elemento. */
  itemFields?: ListItemFieldDef[];
  /** Solo para `list`: etiqueta de un elemento (p. ej. "Testimonio"). */
  itemLabel?: string;
}

export type ListItem = Record<string, string>;
export type FieldValue = string | number | boolean | ListItem[];

interface SectionDef<D extends Record<string, FieldValue>> {
  title: string;
  description: string;
  /** Ruta pública donde se ve la sección (para "Ver en el sitio"). */
  preview?: string;
  fields: FieldDef[];
  defaults: D;
}

function section<D extends Record<string, FieldValue>>(def: SectionDef<D>) {
  return def;
}

const list = (items: ListItem[]): ListItem[] => items;

/** Campos SEO reutilizables por página. */
function seoFields(group = "SEO"): FieldDef[] {
  return [
    { name: "seoTitle", label: "Título para buscadores", type: "text", group, help: "Se muestra en la pestaña del navegador y en Google." },
    { name: "seoDescription", label: "Descripción para buscadores", type: "textarea", group },
  ];
}

export const SITE_SECTIONS = {
  site: section({
    title: "General del sitio",
    description: "Nombre, logos, barra de anuncio, encabezado y pie de página.",
    preview: "/",
    fields: [
      { name: "siteName", label: "Nombre del sitio", type: "text", group: "Identidad" },
      { name: "brandEyebrow", label: "Antetítulo del logo (encabezado)", type: "text", group: "Identidad" },
      { name: "brandScript", label: "Nombre en letra manuscrita", type: "text", group: "Identidad" },
      { name: "tagline", label: "Lema", type: "text", group: "Identidad" },
      { name: "logoUrl", label: "Logo (color)", type: "image", group: "Identidad" },
      { name: "logoWhiteUrl", label: "Logo (blanco, pie de página)", type: "image", group: "Identidad" },

      { name: "announcementEnabled", label: "Mostrar barra de anuncio", type: "toggle", group: "Barra de anuncio" },
      { name: "announcementText", label: "Texto del anuncio", type: "text", group: "Barra de anuncio" },
      { name: "announcementLinkLabel", label: "Texto del enlace", type: "text", group: "Barra de anuncio" },
      { name: "announcementLink", label: "Enlace", type: "url", group: "Barra de anuncio", help: "Ruta interna (/donar) o URL completa." },

      { name: "donateLabel", label: "Botón Donar", type: "text", group: "Encabezado" },
      { name: "donateMobileLabel", label: "Botón Donar (menú móvil)", type: "text", group: "Encabezado" },
      { name: "loginLabel", label: "Enlace Ingresar", type: "text", group: "Encabezado" },
      { name: "loginMobileLabel", label: "Enlace Ingresar (menú móvil)", type: "text", group: "Encabezado" },
      { name: "panelLabel", label: "Enlace Mi panel", type: "text", group: "Encabezado" },
      { name: "mobileMenuImageUrl", label: "Imagen decorativa del menú móvil", type: "image", group: "Encabezado" },

      { name: "footerText", label: "Texto del pie de página", type: "textarea", group: "Pie de página" },
      { name: "footerExploreTitle", label: "Título de enlaces", type: "text", group: "Pie de página" },
      { name: "footerContactTitle", label: "Título de contacto", type: "text", group: "Pie de página" },
      { name: "whatsappLabel", label: "Texto del enlace de WhatsApp", type: "text", group: "Pie de página" },
      { name: "copyright", label: "Texto de copyright (el año se agrega solo)", type: "text", group: "Pie de página" },
      { name: "footerVerse", label: "Versículo", type: "text", group: "Pie de página" },
      {
        name: "subBrands",
        label: "Logos de programas",
        type: "list",
        itemLabel: "Logo",
        group: "Pie de página",
        itemFields: [
          { name: "name", label: "Nombre", type: "text" },
          { name: "image", label: "Imagen (versión blanca)", type: "image" },
        ],
      },
    ],
    defaults: {
      siteName: "Fundación Hadassa",
      brandEyebrow: "Fundación",
      brandScript: "Hadassa",
      tagline: "Llevando el aroma de Cristo.",
      logoUrl: "/brand/logo.webp",
      logoWhiteUrl: "/brand/logo-white.webp",
      announcementEnabled: false,
      announcementText: "",
      announcementLinkLabel: "",
      announcementLink: "",
      donateLabel: "Donar",
      donateMobileLabel: "Donar ahora",
      loginLabel: "Ingresar",
      loginMobileLabel: "Ingresar / Registrarme",
      panelLabel: "Mi panel",
      mobileMenuImageUrl: "/images/branch.webp",
      footerText: "Un grupo de mujeres conformado para ayudar a otras mujeres, llevando el aroma de Cristo.",
      footerExploreTitle: "Explora",
      footerContactTitle: "Contacto",
      whatsappLabel: "Escríbenos por WhatsApp",
      copyright: "Fundación Hadassa · La Paz, Bolivia",
      footerVerse: "“Somos grato olor de Cristo” — 2 Corintios 2:15",
      subBrands: list([
        { name: "Olor Fragante", image: "/brand/olor-fragante-white.webp" },
        { name: "Palabras de Vida", image: "/brand/palabras-de-vida-white.webp" },
        { name: "Alimento Diario", image: "/brand/alimento-diario-white.webp" },
      ]),
    },
  }),

  seo: section({
    title: "SEO y redes",
    description: "Título y descripción por defecto, e imagen al compartir en redes sociales.",
    preview: "/",
    fields: [
      { name: "defaultTitle", label: "Título por defecto", type: "text" },
      { name: "titleSuffix", label: "Sufijo de títulos", type: "text", help: "Se agrega a cada página: «Nosotros · Fundación Hadassa»." },
      { name: "defaultDescription", label: "Descripción por defecto", type: "textarea" },
      { name: "ogImageUrl", label: "Imagen al compartir (Open Graph)", type: "image" },
    ],
    defaults: {
      defaultTitle: "Fundación Hadassa — Llevando el aroma de Cristo",
      titleSuffix: "Fundación Hadassa",
      defaultDescription:
        "Fundación Hadassa: mujeres que ayudan a otras mujeres y a sus hijos. Casa de Fruto, Palabras de Vida, Alimento Diario y Olor Fragante. Dona y sé parte de la transformación.",
      ogImageUrl: "/brand/logo.webp",
    },
  }),

  home: section({
    title: "Inicio",
    description: "Portada, proyectos, misión, actividades, cifras y testimonios.",
    preview: "/",
    fields: [
      { name: "heroEyebrow", label: "Antetítulo", type: "text", group: "Portada" },
      { name: "heroTitle", label: "Título principal", type: "text", group: "Portada" },
      { name: "heroSubtitle", label: "Subtítulo", type: "textarea", group: "Portada" },
      { name: "heroCta", label: "Texto del botón principal", type: "text", group: "Portada" },
      { name: "heroCtaHref", label: "Enlace del botón principal", type: "url", group: "Portada" },
      { name: "heroSecondaryCta", label: "Texto del botón secundario", type: "text", group: "Portada" },
      { name: "heroSecondaryHref", label: "Enlace del botón secundario", type: "url", group: "Portada" },
      { name: "heroImageUrl", label: "Sello / logo flotante", type: "image", group: "Portada" },
      { name: "heroPhotoMain", label: "Foto principal (arco)", type: "image", group: "Portada" },
      { name: "heroPhotoMainAlt", label: "Descripción de la foto principal", type: "text", group: "Portada" },
      { name: "heroPhotoA", label: "Foto circular 1", type: "image", group: "Portada" },
      { name: "heroPhotoB", label: "Foto circular 2", type: "image", group: "Portada" },
      { name: "heroBackgroundUrl", label: "Fondo (camino de mirtos)", type: "image", group: "Portada" },
      { name: "heroScrollLabel", label: "Texto «Descubre»", type: "text", group: "Portada" },

      { name: "projectsEyebrow", label: "Antetítulo", type: "text", group: "Proyectos" },
      { name: "projectsTitle", label: "Título", type: "text", group: "Proyectos" },
      { name: "projectsSubtitle", label: "Subtítulo", type: "textarea", group: "Proyectos" },
      { name: "projectsHintDesktop", label: "Ayuda (computadora)", type: "text", group: "Proyectos" },
      { name: "projectsHintMobile", label: "Ayuda (celular)", type: "text", group: "Proyectos" },
      { name: "projectsCta", label: "Botón hacia proyectos y donaciones", type: "text", group: "Proyectos" },

      { name: "missionLabel", label: "Etiqueta Misión", type: "text", group: "Misión y visión" },
      { name: "visionLabel", label: "Etiqueta Visión", type: "text", group: "Misión y visión" },
      { name: "valuesButton", label: "Botón hacia Nosotros", type: "text", group: "Misión y visión" },
      { name: "missionImageUrl", label: "Foto de Misión y visión", type: "image", group: "Misión y visión" },
      { name: "missionImageAlt", label: "Descripción de la foto", type: "text", group: "Misión y visión" },

      { name: "galleryEyebrow", label: "Antetítulo", type: "text", group: "Galería", help: "La galería se oculta si no tiene fotos." },
      { name: "galleryTitle", label: "Título", type: "text", group: "Galería" },
      { name: "gallerySubtitle", label: "Subtítulo", type: "textarea", group: "Galería" },
      {
        name: "gallery",
        label: "Fotos",
        type: "list",
        itemLabel: "Foto",
        group: "Galería",
        itemFields: [
          { name: "image", label: "Imagen", type: "image" },
          { name: "alt", label: "Descripción (accesibilidad)", type: "text" },
          { name: "caption", label: "Leyenda", type: "text" },
        ],
      },

      { name: "statsTitle", label: "Título de cifras", type: "text", group: "Cifras de impacto", help: "La sección se oculta si no hay cifras." },
      {
        name: "stats",
        label: "Cifras",
        type: "list",
        itemLabel: "Cifra",
        group: "Cifras de impacto",
        itemFields: [
          { name: "value", label: "Valor (p. ej. 120+)", type: "text" },
          { name: "label", label: "Descripción", type: "text" },
        ],
      },

      { name: "activitiesEyebrow", label: "Antetítulo", type: "text", group: "Actividades" },
      { name: "activitiesTitle", label: "Título", type: "text", group: "Actividades" },
      { name: "activitiesSubtitle", label: "Subtítulo", type: "textarea", group: "Actividades" },
      { name: "activitiesButton", label: "Botón «ver todas»", type: "text", group: "Actividades" },

      { name: "testimonialsEyebrow", label: "Antetítulo", type: "text", group: "Testimonios", help: "La sección se oculta si no hay testimonios." },
      { name: "testimonialsTitle", label: "Título", type: "text", group: "Testimonios" },
      {
        name: "testimonials",
        label: "Testimonios",
        type: "list",
        itemLabel: "Testimonio",
        group: "Testimonios",
        itemFields: [
          { name: "quote", label: "Testimonio", type: "textarea" },
          { name: "author", label: "Nombre", type: "text" },
          { name: "role", label: "Rol (voluntaria, donante…)", type: "text" },
        ],
      },
      ...seoFields(),
    ],
    defaults: {
      heroEyebrow: "Fundación Hadassa",
      heroTitle: "Llevando el aroma de Cristo",
      heroSubtitle:
        "Hadassa es un grupo de mujeres conformado para ayudar a otras mujeres, llevando el aroma de Cristo a familias y niños en situación de vulnerabilidad.",
      heroCta: "Sé parte de la transformación",
      heroCtaHref: "/donar",
      heroSecondaryCta: "Conoce Hadassa",
      heroSecondaryHref: "/nosotros",
      heroImageUrl: "/brand/logo.webp",
      heroPhotoMain: "/images/fotos/mujeres-hadassa.webp",
      heroPhotoMainAlt: "Mujeres de Hadassa abrazadas bajo árboles de mirto en flor",
      heroPhotoA: "/images/fotos/nina-al-aula.webp",
      heroPhotoB: "/images/fotos/manos-pintando.webp",
      heroBackgroundUrl: "/images/fotos/camino-mirto.webp",
      heroScrollLabel: "Descubre",
      projectsEyebrow: "Proyectos",
      projectsTitle: "Nuestros proyectos",
      projectsSubtitle:
        "Cada proyecto es una puerta abierta a la restauración: educación, alimento, palabra y cuidado para quienes más lo necesitan.",
      projectsHintDesktop: "Pasa el cursor sobre cada puerta para abrirla.",
      projectsHintMobile: "Toca cada puerta para abrirla.",
      projectsCta: "Ver todos los proyectos y donar",
      missionLabel: "Misión",
      visionLabel: "Visión",
      valuesButton: "Nuestros valores",
      missionImageUrl: "/images/fotos/voluntarias-donaciones.webp",
      missionImageAlt: "Voluntarias preparando cajas con útiles y alimentos",
      galleryEyebrow: "Así florecemos",
      galleryTitle: "Momentos que transforman",
      gallerySubtitle: "Educación, alimento, Palabra y cuidado: lo que tu apoyo hace posible cada semana.",
      gallery: list([
        { image: "/images/fotos/aula-casa-de-fruto.webp", alt: "Niños dibujando en el aula de Casa de Fruto", caption: "Casa de Fruto" },
        { image: "/images/fotos/alimento-diario.webp", alt: "Voluntarias sirviendo platos de comida caliente", caption: "Alimento Diario" },
        { image: "/images/fotos/palabras-de-vida.webp", alt: "Mujeres reunidas leyendo la Biblia", caption: "Palabras de Vida" },
        { image: "/images/fotos/olor-fragante.webp", alt: "Manos que entregan flores de mirto", caption: "Olor Fragante" },
        { image: "/images/fotos/dibujo-arbol.webp", alt: "Mano de un niño dibujando un árbol en flor", caption: "Creatividad" },
        { image: "/images/fotos/madre-hija-la-paz.webp", alt: "Madre e hija caminando frente al Illimani", caption: "Familias restauradas" },
      ]),
      statsTitle: "Nuestro impacto",
      stats: list([]),
      activitiesEyebrow: "Actividades",
      activitiesTitle: "Camina con nosotras",
      activitiesSubtitle:
        "Súmate como voluntario: cada actividad a la que asistes suma puntos que puedes canjear con nuestros aliados.",
      activitiesButton: "Ver todas las actividades",
      testimonialsEyebrow: "Testimonios",
      testimonialsTitle: "Vidas que florecen",
      testimonials: list([]),
      seoTitle: "",
      seoDescription: "",
    },
  }),

  about: section({
    title: "Nosotros",
    description: "Presentación, misión, visión, valores, organigrama y mensaje de la directora.",
    preview: "/nosotros",
    fields: [
      { name: "heroEyebrow", label: "Antetítulo", type: "text", group: "Quiénes somos" },
      { name: "aboutTitle", label: "Título", type: "text", group: "Quiénes somos" },
      { name: "aboutText", label: "¿Quiénes somos?", type: "textarea", group: "Quiénes somos" },
      {
        name: "photos",
        label: "Fotos de la fundación",
        type: "list",
        itemLabel: "Foto",
        group: "Quiénes somos",
        itemFields: [
          { name: "image", label: "Imagen", type: "image" },
          { name: "alt", label: "Descripción (accesibilidad)", type: "text" },
          { name: "caption", label: "Leyenda", type: "text" },
        ],
      },

      { name: "presentationEyebrow", label: "Antetítulo", type: "text", group: "Presentación (también en Inicio)" },
      { name: "directorName", label: "Nombre de la directora", type: "text", group: "Presentación (también en Inicio)" },
      { name: "directorRole", label: "Cargo", type: "text", group: "Presentación (también en Inicio)" },
      { name: "directorMessage", label: "Mensaje de la directora", type: "textarea", group: "Presentación (también en Inicio)" },
      { name: "directorVideoUrl", label: "Video de presentación (YouTube/Vimeo)", type: "url", group: "Presentación (también en Inicio)" },
      { name: "directorImageUrl", label: "Imagen de fondo", type: "image", group: "Presentación (también en Inicio)" },

      { name: "visionLabel", label: "Etiqueta Visión", type: "text", group: "Misión y visión (también en Inicio)" },
      { name: "vision", label: "Visión", type: "textarea", group: "Misión y visión (también en Inicio)" },
      { name: "missionLabel", label: "Etiqueta Misión", type: "text", group: "Misión y visión (también en Inicio)" },
      { name: "mission", label: "Misión", type: "textarea", group: "Misión y visión (también en Inicio)" },

      { name: "valuesEyebrow", label: "Antetítulo", type: "text", group: "Valores", help: "Los valores se editan en Panel → Valores." },
      { name: "valuesTitle", label: "Título", type: "text", group: "Valores" },
      { name: "valuesSubtitle", label: "Subtítulo", type: "textarea", group: "Valores" },
      { name: "valuesHint", label: "Ayuda bajo el árbol", type: "text", group: "Valores" },

      { name: "orgChartEyebrow", label: "Antetítulo", type: "text", group: "Organigrama", help: "Las áreas se editan en Panel → Organigrama." },
      { name: "orgChartTitle", label: "Título", type: "text", group: "Organigrama" },
      ...seoFields(),
    ],
    defaults: {
      heroEyebrow: "Quiénes somos",
      aboutTitle: "Fundación Hadassa",
      aboutText:
        "Desde 2017 trabajamos en favor de mujeres y niños en situación de vulnerabilidad, brindando apoyo educativo, espiritual, médico y alimentario. Somos un grupo de mujeres que, movidas por el amor de Dios, acompañamos a otras mujeres y a sus hijos para que florezcan en identidad y propósito.",
      photos: list([
        { image: "/images/fotos/mujeres-hadassa.webp", alt: "Mujeres de Hadassa abrazadas", caption: "Somos familia" },
        { image: "/images/fotos/olor-fragante.webp", alt: "Manos entregando flores de mirto", caption: "Olor fragante" },
        { image: "/images/fotos/palabras-de-vida.webp", alt: "Mujeres leyendo la Biblia juntas", caption: "Palabra" },
        { image: "/images/fotos/madre-hija-la-paz.webp", alt: "Madre e hija caminando en La Paz", caption: "Esperanza" },
      ]),
      presentationEyebrow: "Presentación",
      directorName: "Paola Otondo",
      directorRole: "Directora Ejecutiva",
      directorMessage:
        "Cada niño y cada mujer que llega a Hadassa es una historia que Dios quiere restaurar. Te invitamos a caminar con nosotras.",
      directorVideoUrl: "",
      directorImageUrl: "/images/mirto.webp",
      visionLabel: "Visión",
      vision:
        "Ser una fundación reconocida en toda la sociedad por su compromiso con la restauración espiritual, la solidaridad y el servicio. Aspiramos a transformar vidas y comunidades mediante proyectos y programas de alta calidad, especialmente orientados a personas y familias con necesidades diversas, floreciendo su identidad, propósito y relación con Dios.",
      missionLabel: "Misión",
      mission:
        "Promovemos acciones de alcance social y formación espiritual orientadas a sanar, restaurar y transformar vidas, contribuyendo a la construcción de un presente y un futuro que generen un impacto positivo y sostenible en las familias y en la sociedad.",
      valuesEyebrow: "Valores",
      valuesTitle: "Nuestros valores",
      valuesSubtitle: "Los frutos del árbol de mirto: lo que somos y lo que sembramos.",
      valuesHint: "Toca cada fruto para conocer el valor.",
      orgChartEyebrow: "Cómo nos organizamos",
      orgChartTitle: "Organigrama",
      seoTitle: "Nosotros",
      seoDescription: "Misión, visión, valores y organigrama de la Fundación Hadassa.",
    },
  }),

  projectsPage: section({
    title: "Proyectos (página)",
    description: "Listado de proyectos y textos de la ficha de cada proyecto.",
    preview: "/donar",
    fields: [
      { name: "eyebrow", label: "Antetítulo", type: "text", group: "Listado", help: "Los proyectos se editan en Panel → Proyectos." },
      { name: "title", label: "Título", type: "text", group: "Listado" },
      { name: "subtitle", label: "Subtítulo", type: "textarea", group: "Listado" },
      { name: "doorCta", label: "Botón de cada puerta", type: "text", group: "Listado" },

      { name: "backLabel", label: "Enlace «volver»", type: "text", group: "Ficha del proyecto" },
      { name: "beneficiariesLabel", label: "Texto de beneficiarios", type: "text", group: "Ficha del proyecto" },
      { name: "donateCta", label: "Botón donar", type: "text", group: "Ficha del proyecto" },
      { name: "raisedLabel", label: "Texto «recaudados»", type: "text", group: "Barra de meta" },
      { name: "goalLabel", label: "Texto «Meta»", type: "text", group: "Barra de meta" },
      { name: "goalPercentLabel", label: "Texto «de la meta»", type: "text", group: "Barra de meta" },
      ...seoFields(),
    ],
    defaults: {
      eyebrow: "Proyectos",
      title: "Nuestros proyectos",
      subtitle:
        "Cada proyecto es una puerta abierta a la restauración: educación, alimento, palabra y cuidado para quienes más lo necesitan.",
      doorCta: "Ver más",
      backLabel: "Todos los proyectos",
      beneficiariesLabel: "personas beneficiadas",
      donateCta: "Apoyar este proyecto",
      raisedLabel: "recaudados",
      goalLabel: "Meta",
      goalPercentLabel: "de la meta",
      seoTitle: "Proyectos",
      seoDescription: "Casa de Fruto, Palabras de Vida, Alimento Diario y Olor Fragante: los proyectos de la Fundación Hadassa.",
    },
  }),

  casaDeFruto: section({
    title: "Casa de Fruto",
    description: "Página del centro infantil Casa de Fruto.",
    preview: "/casa-de-fruto",
    fields: [
      { name: "title", label: "Título (insignia; cada palabra en una línea)", type: "text", group: "Encabezado" },
      { name: "eyebrow", label: "Antetítulo", type: "text", group: "Encabezado" },
      { name: "tagline", label: "Frase corta", type: "textarea", group: "Encabezado" },
      { name: "question", label: "Pregunta principal", type: "text", group: "Encabezado" },
      { name: "videoUrl", label: "Video: ¿Qué es la Casa de Fruto?", type: "url", group: "Encabezado" },
      { name: "backgroundUrl", label: "Imagen de fondo (aula)", type: "image", group: "Encabezado" },

      { name: "intro", label: "Introducción", type: "textarea", group: "Textos" },
      { name: "body", label: "Cuerpo (párrafos separados por línea en blanco)", type: "textarea", group: "Textos" },

      { name: "teachersTitle", label: "Título de Maestras", type: "text", group: "Maestras" },
      { name: "teachersText", label: "Texto de Maestras", type: "textarea", group: "Maestras" },
      { name: "teachersVideoUrl", label: "Video de las maestras", type: "url", group: "Maestras" },
      { name: "teachersVideoPlaceholder", label: "Texto si aún no hay video", type: "text", group: "Maestras" },

      { name: "contactLabel", label: "Etiqueta del teléfono", type: "text", group: "Contacto y llamado" },
      { name: "contactPhone", label: "Teléfono de contacto", type: "phone", group: "Contacto y llamado" },
      { name: "ctaLabel", label: "Botón final", type: "text", group: "Contacto y llamado" },

      { name: "illustrationRunning", label: "Ilustración 1 (junto a la pregunta)", type: "image", group: "Ilustraciones" },
      { name: "illustrationBlocks", label: "Ilustración 2 (sobre el video)", type: "image", group: "Ilustraciones" },
      { name: "illustrationPlaying", label: "Ilustración 3 (bajo el video)", type: "image", group: "Ilustraciones" },
      { name: "illustrationGrass", label: "Ilustración 4 (final)", type: "image", group: "Ilustraciones" },
      { name: "photosTitle", label: "Título de las fotos", type: "text", group: "Fotos" },
      {
        name: "photos",
        label: "Fotos",
        type: "list",
        itemLabel: "Foto",
        group: "Fotos",
        itemFields: [
          { name: "image", label: "Imagen", type: "image" },
          { name: "alt", label: "Descripción (accesibilidad)", type: "text" },
          { name: "caption", label: "Leyenda", type: "text" },
        ],
      },
      ...seoFields(),
    ],
    defaults: {
      title: "Casa de Fruto",
      eyebrow: "Centro infantil",
      tagline: "Un espacio seguro donde los niños aprenden, juegan y conocen el amor del Padre.",
      question: "¿Qué es la Casa de Fruto?",
      videoUrl: "",
      backgroundUrl: "/images/aula.webp",
      intro:
        "El Centro infantil “Casa de Fruto” nace como una encomienda del Padre a Hadassa para apoyar a niños en situación vulnerable con educación, salud, alimentación, cuidados y, más que todo, mostrando el amor que tiene el Padre sobre ellos.",
      body:
        "Atendemos a hijos e hijas de mujeres privadas de libertad en el Centro de Orientación Femenina de Obrajes, en La Paz, con apoyo escolar, médico, dental y de desarrollo integral.\n\nCada semana los niños son impartidos de la vida de Dios a través de la adoración y el conocimiento de Cristo.\n\nTe invitamos a ser parte de este proceso celestial. ¡Recuerda que tu apoyo beneficia a un sector visibilizado y amado por Dios!",
      teachersTitle: "Maestras",
      teachersText:
        "Un equipo de maestras comprometidas que acompaña a cada niño en su aprendizaje, su juego y su crecimiento en fe.",
      teachersVideoUrl: "",
      teachersVideoPlaceholder: "Video presentando el trabajo de las maestras",
      contactLabel: "Contáctanos",
      contactPhone: "70580975",
      ctaLabel: "Sé parte de la transformación",
      illustrationRunning: "/images/kids-running.webp",
      illustrationBlocks: "/images/kid-blocks.webp",
      illustrationPlaying: "/images/kids-playing.webp",
      illustrationGrass: "/images/kids-grass.webp",
      photosTitle: "Un día en Casa de Fruto",
      photos: list([
        { image: "/images/fotos/nina-al-aula.webp", alt: "Niña con mochila entrando al aula de la mano de su maestra", caption: "¡A clases!" },
        { image: "/images/fotos/aula-casa-de-fruto.webp", alt: "Niños dibujando con su maestra", caption: "Aprendemos" },
        { image: "/images/fotos/manos-pintando.webp", alt: "Manos de un niño pintando con acuarelas", caption: "Creamos" },
        { image: "/images/fotos/dibujo-arbol.webp", alt: "Dibujo de un árbol con frutos", caption: "Florecemos" },
      ]),
      seoTitle: "Casa de Fruto",
      seoDescription:
        "Centro infantil Casa de Fruto: educación, salud, alimentación y cuidado para hijos de mujeres privadas de libertad en La Paz.",
    },
  }),

  donation: section({
    title: "Donaciones",
    description: "Landing de donación: textos, QR, cuenta bancaria y registro de donaciones.",
    preview: "/donar",
    fields: [
      { name: "hubEyebrow", label: "Antetítulo del hub", type: "text", group: "Encabezado del hub" },
      { name: "hubTitle", label: "Título del hub", type: "text", group: "Encabezado del hub" },
      { name: "hubSubtitle", label: "Subtítulo del hub", type: "text", group: "Encabezado del hub" },
      { name: "mainEyebrow", label: "Antetítulo de la fundación principal", type: "text", group: "Fundación principal" },
      { name: "mainDonateButton", label: "Botón donar a la fundación", type: "text", group: "Fundación principal" },
      { name: "mainMoreButton", label: "Botón conocer más", type: "text", group: "Fundación principal" },
      { name: "campaignsEyebrow", label: "Antetítulo de proyectos", type: "text", group: "Proyectos" },
      { name: "campaignsTitle", label: "Título de proyectos", type: "text", group: "Proyectos" },
      { name: "campaignsSubtitle", label: "Subtítulo de proyectos", type: "text", group: "Proyectos" },
      { name: "directEyebrow", label: "Antetítulo de donación directa", type: "text", group: "Donación directa" },
      { name: "directTitle", label: "Título de donación directa", type: "text", group: "Donación directa" },
      { name: "headline", label: "Frase superior", type: "text", group: "Tarjeta principal (también en Inicio)" },
      { name: "title", label: "Título", type: "text", group: "Tarjeta principal (también en Inicio)" },
      { name: "body", label: "Texto", type: "textarea", group: "Tarjeta principal (también en Inicio)" },
      { name: "cta", label: "Texto del botón", type: "text", group: "Tarjeta principal (también en Inicio)" },
      { name: "heroImageUrl", label: "Foto principal", type: "image", group: "Tarjeta principal (también en Inicio)" },
      { name: "heroImageAlt", label: "Descripción de la foto (accesibilidad)", type: "text", group: "Tarjeta principal (también en Inicio)" },

      { name: "supportingLabel", label: "Texto «Estás apoyando»", type: "text", group: "Sobre" },
      { name: "envelopeEyebrow", label: "Antetítulo", type: "text", group: "Sobre" },
      { name: "envelopeTitle", label: "Título", type: "text", group: "Sobre" },
      { name: "envelopeImageUrl", label: "Imagen del sobre", type: "image", group: "Sobre" },
      { name: "qrOptionTitle", label: "Opción QR: título", type: "text", group: "Sobre" },
      { name: "qrOptionText", label: "Opción QR: texto", type: "text", group: "Sobre" },
      { name: "bankOptionTitle", label: "Opción banco: título", type: "text", group: "Sobre" },
      { name: "bankOptionText", label: "Opción banco: texto", type: "text", group: "Sobre" },

      { name: "quickTitle", label: "Título de la tarjeta QR", type: "text", group: "QR y cuenta bancaria" },
      { name: "qrImageUrl", label: "Imagen del código QR", type: "image", group: "QR y cuenta bancaria", help: "Sube el QR que genera tu banco." },
      { name: "qrPlaceholderNote", label: "Aviso cuando aún no hay QR oficial", type: "text", group: "QR y cuenta bancaria" },
      { name: "accountIntro", label: "Texto sobre la cuenta", type: "text", group: "QR y cuenta bancaria" },
      { name: "bankName", label: "Banco", type: "text", group: "QR y cuenta bancaria" },
      { name: "accountNumber", label: "Número de cuenta", type: "text", group: "QR y cuenta bancaria" },
      { name: "accountHolder", label: "Titular", type: "text", group: "QR y cuenta bancaria" },
      { name: "accountType", label: "Tipo de cuenta", type: "text", group: "QR y cuenta bancaria" },
      { name: "holderId", label: "NIT / CI del titular", type: "text", group: "QR y cuenta bancaria" },
      { name: "bankLabel", label: "Etiqueta «Banco»", type: "text", group: "QR y cuenta bancaria" },
      { name: "accountLabel", label: "Etiqueta «Cuenta»", type: "text", group: "QR y cuenta bancaria" },
      { name: "holderLabel", label: "Etiqueta «Titular»", type: "text", group: "QR y cuenta bancaria" },
      { name: "typeLabel", label: "Etiqueta «Tipo»", type: "text", group: "QR y cuenta bancaria" },
      { name: "holderIdLabel", label: "Etiqueta «NIT / CI»", type: "text", group: "QR y cuenta bancaria" },
      { name: "qrBackgroundUrl", label: "Foto de fondo del QR", type: "image", group: "QR y cuenta bancaria" },

      { name: "registerTitle", label: "Título", type: "text", group: "Registrar donación" },
      { name: "registerText", label: "Texto", type: "textarea", group: "Registrar donación" },
      { name: "registerCta", label: "Botón", type: "text", group: "Registrar donación" },
      { name: "registerNoAccount", label: "Texto «¿No tienes cuenta?»", type: "text", group: "Registrar donación" },
      { name: "registerSignupLink", label: "Enlace de registro", type: "text", group: "Registrar donación" },
      ...seoFields(),
    ],
    defaults: {
      hubEyebrow: "Proyectos y donaciones",
      hubTitle: "Dona y transforma vidas",
      hubSubtitle: "Apoya a la Fundación Hadassa donde más se necesite o elige un proyecto. Cada aporte florece en una vida restaurada.",
      mainEyebrow: "Donde más se necesite",
      mainDonateButton: "Donar a la fundación",
      mainMoreButton: "Conocer más",
      campaignsEyebrow: "Proyectos",
      campaignsTitle: "O elige un proyecto",
      campaignsSubtitle: "Cada proyecto es una puerta abierta a la restauración: educación, alimento, Palabra y cuidado.",
      directEyebrow: "Sin registrarte",
      directTitle: "Dona directo con QR o transferencia",
      headline: "Tu apoyo es fundamental.",
      title: "Dona ahora",
      body:
        "Los niños que crecen en centros penitenciarios deben tener las mismas oportunidades para jugar, estudiar y sonreír. Con tu donación ayudas a extenderlo a todos los niños en su escolaridad, salud y nutrición básica. Escanea el código QR y sé parte de la transformación.",
      cta: "Sé parte de la transformación",
      heroImageUrl: "/images/ninos-leyendo.webp",
      heroImageAlt: "Niños leyendo libros escolares, vistos de espaldas",
      supportingLabel: "Estás apoyando",
      envelopeEyebrow: "Dos formas de donar",
      envelopeTitle: "Abre el sobre y elige",
      envelopeImageUrl: "/images/sobre.webp",
      qrOptionTitle: "Código QR",
      qrOptionText: "Escanéalo desde la app de tu banco.",
      bankOptionTitle: "Cuenta de banco",
      bankOptionText: "Transfiere o deposita directamente.",
      quickTitle: "¡Haz tu donación en menos de un minuto y sin rellenar datos!",
      qrImageUrl: "",
      qrPlaceholderNote: "QR referencial — pronto el QR oficial",
      accountIntro: "Dona directo a esta cuenta:",
      bankName: "[Nombre del banco]",
      accountNumber: "[Número de cuenta]",
      accountHolder: "Fundación Hadassa",
      accountType: "Caja de ahorro en bolivianos",
      holderId: "",
      bankLabel: "Banco",
      accountLabel: "Cuenta",
      holderLabel: "Titular",
      typeLabel: "Tipo",
      holderIdLabel: "NIT / CI",
      qrBackgroundUrl: "/images/tiza.webp",
      registerTitle: "¿Ya donaste? Registra tu donación y gana puntos",
      registerText:
        "Sube tu comprobante desde tu cuenta. Cuando la fundación lo valide, sumarás puntos que puedes canjear por descuentos y premios de nuestros aliados.",
      registerCta: "Registrar mi donación",
      registerNoAccount: "¿No tienes cuenta?",
      registerSignupLink: "Regístrate gratis",
      seoTitle: "Proyectos y donaciones",
      seoDescription: "Dona a la Fundación Hadassa por QR o transferencia bancaria, en menos de un minuto y sin rellenar datos.",
    },
  }),

  campaigns: section({
    title: "Campañas y donaciones",
    description: "Textos del buscador de proyectos, la ficha de cada campaña y el flujo de donación.",
    preview: "/donar",
    fields: [
      { name: "featuredTitle", label: "Título del carrusel de destacadas", type: "text", group: "Explorador" },
      { name: "searchPlaceholder", label: "Texto del buscador", type: "text", group: "Explorador" },
      { name: "allCategories", label: "Chip «Todas»", type: "text", group: "Explorador" },
      { name: "sortLabel", label: "Etiqueta de orden", type: "text", group: "Explorador" },
      { name: "resultsLabel", label: "Resultados (usa {n})", type: "text", group: "Explorador" },
      { name: "emptyTitle", label: "Sin resultados: título", type: "text", group: "Explorador" },
      { name: "emptyText", label: "Sin resultados: texto", type: "text", group: "Explorador" },
      { name: "donationsLabel", label: "Nº de donaciones (usa {n})", type: "text", group: "Tarjetas y ficha" },
      { name: "donationsLabelOne", label: "Una sola donación (usa {n})", type: "text", group: "Tarjetas y ficha" },
      { name: "daysLeftLabel", label: "Días restantes (usa {n})", type: "text", group: "Tarjetas y ficha" },
      { name: "endedLabel", label: "Campaña cerrada", type: "text", group: "Tarjetas y ficha" },
      { name: "donateButton", label: "Botón donar", type: "text", group: "Tarjetas y ficha" },
      { name: "donateNowButton", label: "Botón donar (ficha)", type: "text", group: "Tarjetas y ficha" },
      { name: "shareButton", label: "Botón compartir", type: "text", group: "Tarjetas y ficha" },
      { name: "storyTitle", label: "Título de la historia", type: "text", group: "Tarjetas y ficha" },
      { name: "recentTitle", label: "Título de donaciones recientes", type: "text", group: "Tarjetas y ficha" },
      { name: "recentEmpty", label: "Sin donaciones aún", type: "text", group: "Tarjetas y ficha" },
      { name: "donatedVerb", label: "Verbo «donó»", type: "text", group: "Tarjetas y ficha" },
      { name: "messagesTitle", label: "Título de palabras de apoyo", type: "text", group: "Tarjetas y ficha" },
      { name: "updatesTitle", label: "Título de novedades", type: "text", group: "Tarjetas y ficha" },
      { name: "topDonorsTitle", label: "Título de principales donantes", type: "text", group: "Tarjetas y ficha" },
      { name: "closedNotice", label: "Aviso de campaña que no recibe donaciones", type: "text", group: "Tarjetas y ficha" },
      { name: "eventsTitle", label: "Título de actividades relacionadas", type: "text", group: "Tarjetas y ficha" },
      { name: "casaDeFrutoLink", label: "Enlace a la página Casa de Fruto", type: "text", group: "Tarjetas y ficha" },
      { name: "viewCampaignLink", label: "Enlace «Ver campaña»", type: "text", group: "Tarjetas y ficha" },
      { name: "chooseTitle", label: "Pregunta de destino", type: "text", group: "Flujo de donación" },
      { name: "mainChipLabel", label: "Chip de la fundación principal", type: "text", group: "Flujo de donación" },
      { name: "stepAmount", label: "Paso 1", type: "text", group: "Flujo de donación" },
      { name: "stepPay", label: "Paso 2", type: "text", group: "Flujo de donación" },
      { name: "stepConfirm", label: "Paso 3", type: "text", group: "Flujo de donación" },
      { name: "amountTitle", label: "Título del monto", type: "text", group: "Flujo de donación" },
      { name: "customAmount", label: "Etiqueta monto personalizado", type: "text", group: "Flujo de donación" },
      { name: "pointsHint", label: "Puntos que ganará (usa {n})", type: "text", group: "Flujo de donación" },
      { name: "recurringLabel", label: "Opción donación mensual", type: "text", group: "Flujo de donación" },
      { name: "recurringHelp", label: "Ayuda donación mensual", type: "text", group: "Flujo de donación" },
      { name: "anonymousLabel", label: "Opción anónima", type: "text", group: "Flujo de donación" },
      { name: "anonymousHelp", label: "Ayuda anónima", type: "text", group: "Flujo de donación" },
      { name: "messageLabel", label: "Etiqueta del mensaje", type: "text", group: "Flujo de donación" },
      { name: "messagePlaceholder", label: "Ejemplo de mensaje", type: "text", group: "Flujo de donación" },
      { name: "payTitle", label: "Título del pago", type: "text", group: "Flujo de donación" },
      { name: "payText", label: "Texto del pago", type: "text", group: "Flujo de donación" },
      { name: "referenceLabel", label: "Etiqueta referencia", type: "text", group: "Flujo de donación" },
      { name: "receiptLabel", label: "Etiqueta comprobante", type: "text", group: "Flujo de donación" },
      { name: "confirmTitle", label: "Título de confirmación", type: "text", group: "Flujo de donación" },
      { name: "submitButton", label: "Botón enviar", type: "text", group: "Flujo de donación" },
      { name: "successTitle", label: "Éxito: título", type: "text", group: "Flujo de donación" },
      { name: "successText", label: "Éxito: texto", type: "text", group: "Flujo de donación" },
      { name: "successShare", label: "Éxito: invitación a compartir", type: "text", group: "Flujo de donación" },
      { name: "loginTitle", label: "Sin sesión: título", type: "text", group: "Flujo de donación" },
      { name: "loginText", label: "Sin sesión: texto", type: "text", group: "Flujo de donación" },
      { name: "loginButton", label: "Sin sesión: botón ingresar", type: "text", group: "Flujo de donación" },
      { name: "registerButton", label: "Sin sesión: botón registro", type: "text", group: "Flujo de donación" },
    ],
    defaults: {
      featuredTitle: "Campañas destacadas",
      searchPlaceholder: "Buscar campañas…",
      allCategories: "Todas",
      sortLabel: "Ordenar por",
      resultsLabel: "{n} campañas",
      emptyTitle: "No encontramos campañas",
      emptyText: "Prueba con otra búsqueda o categoría.",
      donationsLabel: "{n} donaciones",
      donationsLabelOne: "{n} donación",
      daysLeftLabel: "Quedan {n} días",
      endedLabel: "Campaña finalizada",
      donateButton: "Donar",
      donateNowButton: "Donar ahora",
      shareButton: "Compartir",
      storyTitle: "La historia",
      recentTitle: "Donaciones recientes",
      recentEmpty: "Sé la primera persona en apoyar esta campaña.",
      donatedVerb: "donó",
      messagesTitle: "Palabras de apoyo",
      updatesTitle: "Novedades",
      topDonorsTitle: "Principales donantes",
      closedNotice: "Esta campaña ya no recibe donaciones. ¡Gracias a todos los que la hicieron posible!",
      eventsTitle: "Actividades de esta campaña",
      casaDeFrutoLink: "Conoce Casa de Fruto",
      viewCampaignLink: "Ver la campaña",
      chooseTitle: "¿A quién quieres apoyar?",
      mainChipLabel: "Donde más se necesite",
      stepAmount: "Tu aporte",
      stepPay: "Pago",
      stepConfirm: "Confirmar",
      amountTitle: "¿Cuánto quieres donar?",
      customAmount: "Otro monto (Bs.)",
      pointsHint: "Ganarás {n} puntos cuando validemos tu donación.",
      recurringLabel: "Quiero donar este monto cada mes",
      recurringHelp: "Te recordaremos cada mes; registras cada aporte con su comprobante.",
      anonymousLabel: "Donar de forma anónima",
      anonymousHelp: "Tu nombre no aparecerá en la página de la campaña.",
      messageLabel: "Palabras de apoyo (opcional)",
      messagePlaceholder: "¡Con mucho cariño para los niños!",
      payTitle: "Realiza tu donación",
      payText: "Escanea el QR o transfiere a la cuenta. Luego cuéntanos cómo pagaste y adjunta el comprobante.",
      referenceLabel: "Nº de transacción o referencia (opcional)",
      receiptLabel: "Comprobante (imagen o PDF)",
      confirmTitle: "Revisa tu donación",
      submitButton: "Registrar mi donación",
      successTitle: "¡Gracias por sembrar esperanza!",
      successText: "Registramos tu donación. Nuestro equipo la validará con tu comprobante y entonces sumará a la campaña y a tus puntos.",
      successShare: "Comparte la campaña y multiplica el impacto",
      loginTitle: "Inicia sesión para registrar tu donación",
      loginText: "Puedes donar ahora mismo con el QR o la cuenta bancaria. Si inicias sesión, registras tu aporte, ves tu historial y ganas puntos para canjear con nuestros aliados.",
      loginButton: "Iniciar sesión",
      registerButton: "Crear cuenta",
    },
  }),

  activitiesPage: section({
    title: "Actividades (página)",
    description: "Textos de la página de actividades y de las tarjetas de cada actividad.",
    preview: "/actividades",
    fields: [
      { name: "eyebrow", label: "Antetítulo", type: "text", group: "Encabezado", help: "Las actividades se editan en Panel → Actividades." },
      { name: "title", label: "Título", type: "text", group: "Encabezado" },
      { name: "subtitle", label: "Subtítulo", type: "textarea", group: "Encabezado" },
      { name: "emptyTitle", label: "Título sin actividades", type: "text", group: "Sin actividades" },
      { name: "emptyText", label: "Texto sin actividades", type: "text", group: "Sin actividades" },
      { name: "emptyCta", label: "Botón sin actividades", type: "text", group: "Sin actividades" },
      { name: "registerCta", label: "Botón inscribirme", type: "text", group: "Tarjetas" },
      { name: "spotsOpen", label: "Cupos abiertos", type: "text", group: "Tarjetas" },
      { name: "spotsLeft", label: "Cupos disponibles ({n} = cantidad)", type: "text", group: "Tarjetas" },
      { name: "spotsNone", label: "Sin cupos", type: "text", group: "Tarjetas" },
      { name: "pointsLabel", label: "Puntos ({n} = puntos)", type: "text", group: "Tarjetas" },
      ...seoFields(),
    ],
    defaults: {
      eyebrow: "Voluntariado",
      title: "Actividades",
      subtitle: "Inscríbete, participa y suma puntos que puedes canjear por descuentos y premios de nuestros aliados.",
      emptyTitle: "Pronto anunciaremos nuevas actividades",
      emptyText: "Mientras tanto, puedes apoyar con una donación.",
      emptyCta: "Donar",
      registerCta: "Inscribirme",
      spotsOpen: "Cupos abiertos",
      spotsLeft: "{n} cupos disponibles",
      spotsNone: "Sin cupos",
      pointsLabel: "Ganas {n} puntos al asistir",
      seoTitle: "Actividades",
      seoDescription: "Participa como voluntario en las actividades de la Fundación Hadassa y gana puntos canjeables.",
    },
  }),

  contactPage: section({
    title: "Contacto (página)",
    description: "Textos de la página de contacto y del formulario.",
    preview: "/contacto",
    fields: [
      { name: "eyebrow", label: "Antetítulo", type: "text", group: "Encabezado", help: "Teléfono, correo y redes se editan en «Contacto y redes»." },
      { name: "title", label: "Título", type: "text", group: "Encabezado" },
      { name: "subtitle", label: "Subtítulo", type: "textarea", group: "Encabezado" },
      { name: "cardTitle", label: "Título de la tarjeta", type: "text", group: "Tarjeta de datos" },
      { name: "cardText", label: "Texto de la tarjeta", type: "text", group: "Tarjeta de datos" },
      { name: "phoneLabel", label: "Etiqueta teléfono", type: "text", group: "Tarjeta de datos" },
      { name: "emailLabel", label: "Etiqueta correo", type: "text", group: "Tarjeta de datos" },
      { name: "addressLabel", label: "Etiqueta dirección", type: "text", group: "Tarjeta de datos" },
      { name: "whatsappCta", label: "Botón WhatsApp", type: "text", group: "Tarjeta de datos" },
      { name: "whatsappMessage", label: "Mensaje inicial de WhatsApp", type: "text", group: "Tarjeta de datos" },
      { name: "formTitle", label: "Título", type: "text", group: "Formulario" },
      { name: "formText", label: "Texto", type: "text", group: "Formulario" },
      { name: "nameLabel", label: "Etiqueta nombre", type: "text", group: "Formulario" },
      { name: "phoneFieldLabel", label: "Etiqueta teléfono", type: "text", group: "Formulario" },
      { name: "emailFieldLabel", label: "Etiqueta correo", type: "text", group: "Formulario" },
      { name: "messageLabel", label: "Etiqueta mensaje", type: "text", group: "Formulario" },
      { name: "submitLabel", label: "Botón enviar", type: "text", group: "Formulario" },
      { name: "successMessage", label: "Mensaje de envío exitoso", type: "text", group: "Formulario" },
      ...seoFields(),
    ],
    defaults: {
      eyebrow: "Contacto",
      title: "Hablemos",
      subtitle: "¿Quieres ser voluntario, aliado o conocer más de nuestros proyectos? Escríbenos.",
      cardTitle: "Fundación Hadassa",
      cardText: "Llevando el aroma de Cristo.",
      phoneLabel: "Teléfono",
      emailLabel: "Correo",
      addressLabel: "Dirección",
      whatsappCta: "Escríbenos por WhatsApp",
      whatsappMessage: "Hola, quiero saber más de la Fundación Hadassa",
      formTitle: "Envíanos un mensaje",
      formText: "Te responderemos lo antes posible.",
      nameLabel: "Nombre",
      phoneFieldLabel: "Teléfono (opcional)",
      emailFieldLabel: "Correo electrónico",
      messageLabel: "Mensaje",
      submitLabel: "Enviar mensaje",
      successMessage: "¡Gracias! Recibimos tu mensaje y te contactaremos pronto.",
      seoTitle: "Contacto",
      seoDescription: "Escríbenos o llámanos: queremos conocerte y caminar contigo.",
    },
  }),

  authPages: section({
    title: "Ingreso y registro",
    description: "Textos de las páginas para ingresar y crear cuenta.",
    preview: "/ingresar",
    fields: [
      { name: "sideImageUrl", label: "Imagen del panel lateral", type: "image", group: "Panel lateral" },
      { name: "sideTitle", label: "Frase principal", type: "text", group: "Panel lateral" },
      {
        name: "sideBullets",
        label: "Beneficios",
        type: "list",
        itemLabel: "Beneficio",
        group: "Panel lateral",
        itemFields: [{ name: "text", label: "Texto", type: "text" }],
      },
      { name: "sideVerse", label: "Versículo", type: "text", group: "Panel lateral" },
      { name: "statsRaisedLabel", label: "Cifra: recaudado", type: "text", group: "Panel lateral", help: "Cifras en vivo; se ocultan si aún no hay donaciones aprobadas." },
      { name: "statsDonationsLabel", label: "Cifra: donaciones", type: "text", group: "Panel lateral" },
      { name: "statsCampaignsLabel", label: "Cifra: campañas", type: "text", group: "Panel lateral" },
      { name: "backLabel", label: "Enlace «volver al sitio»", type: "text", group: "Panel lateral" },

      { name: "loginEyebrow", label: "Antetítulo", type: "text", group: "Ingresar" },
      { name: "loginTitle", label: "Título", type: "text", group: "Ingresar" },
      { name: "loginSubtitle", label: "Subtítulo", type: "text", group: "Ingresar" },
      { name: "loginInactive", label: "Aviso de cuenta desactivada", type: "text", group: "Ingresar" },
      { name: "loginNoAccount", label: "Texto «¿Aún no tienes cuenta?»", type: "text", group: "Ingresar" },
      { name: "loginSignupLink", label: "Enlace a registro", type: "text", group: "Ingresar" },

      { name: "registerEyebrow", label: "Antetítulo", type: "text", group: "Crear cuenta" },
      { name: "registerTitle", label: "Título", type: "text", group: "Crear cuenta" },
      { name: "registerSubtitle", label: "Subtítulo", type: "text", group: "Crear cuenta" },
      { name: "registerHaveAccount", label: "Texto «¿Ya tienes cuenta?»", type: "text", group: "Crear cuenta" },
      { name: "registerLoginLink", label: "Enlace a ingresar", type: "text", group: "Crear cuenta" },
    ],
    defaults: {
      sideImageUrl: "/images/mirto.webp",
      sideTitle: "Cada aporte florece en una vida restaurada.",
      sideBullets: list([
        { text: "Registra tus donaciones y recibe su validación." },
        { text: "Inscríbete en actividades como voluntario." },
        { text: "Gana puntos y canjéalos con nuestros aliados." },
      ]),
      sideVerse: "“Somos grato olor de Cristo”",
      statsRaisedLabel: "recaudados",
      statsDonationsLabel: "donaciones",
      statsCampaignsLabel: "campañas activas",
      backLabel: "Volver al sitio",
      loginEyebrow: "Bienvenida de vuelta",
      loginTitle: "Ingresa a tu cuenta",
      loginSubtitle: "Sigue tus donaciones, actividades y puntos.",
      loginInactive: "Tu cuenta está desactivada. Contacta a la fundación para más información.",
      loginNoAccount: "¿Aún no tienes cuenta?",
      loginSignupLink: "Regístrate",
      registerEyebrow: "Únete a Hadassa",
      registerTitle: "Crea tu cuenta",
      registerSubtitle: "Dona, participa como voluntario y gana recompensas.",
      registerHaveAccount: "¿Ya tienes cuenta?",
      registerLoginLink: "Ingresa",
    },
  }),

  notFound: section({
    title: "Página no encontrada (404)",
    description: "Lo que se muestra cuando alguien entra a una dirección que no existe.",
    preview: "/esta-pagina-no-existe",
    fields: [
      { name: "eyebrow", label: "Antetítulo", type: "text" },
      { name: "title", label: "Título", type: "text" },
      { name: "text", label: "Texto", type: "textarea" },
      { name: "cta", label: "Botón", type: "text" },
    ],
    defaults: {
      eyebrow: "Error 404",
      title: "Este camino no existe",
      text: "La página que buscas se fue con el viento, como un pétalo de mirto.",
      cta: "Volver al inicio",
    },
  }),

  contact: section({
    title: "Contacto y redes",
    description: "Datos de contacto que aparecen en el pie de página y en la página de contacto.",
    preview: "/contacto",
    fields: [
      { name: "phone", label: "Teléfono", type: "phone" },
      { name: "whatsapp", label: "WhatsApp (solo números, con código de país)", type: "phone" },
      { name: "email", label: "Correo", type: "email" },
      { name: "address", label: "Dirección", type: "text" },
      { name: "facebook", label: "Facebook", type: "url", group: "Redes sociales" },
      { name: "instagram", label: "Instagram", type: "url", group: "Redes sociales" },
      { name: "tiktok", label: "TikTok", type: "url", group: "Redes sociales" },
      { name: "youtube", label: "YouTube", type: "url", group: "Redes sociales" },
    ],
    defaults: {
      phone: "70580975",
      whatsapp: "59170580975",
      email: "contacto@fundacionhadassa.org",
      address: "La Paz, Bolivia",
      facebook: "",
      instagram: "",
      tiktok: "",
      youtube: "",
    },
  }),

  gamification: section({
    title: "Puntos y recompensas",
    description: "Reglas del programa de puntos para donantes y voluntarios.",
    fields: [
      { name: "pointsPerBoliviano", label: "Puntos por cada Bs. donado", type: "number" },
      { name: "minDonation", label: "Donación mínima registrable (Bs.)", type: "number" },
    ],
    defaults: {
      pointsPerBoliviano: 10,
      minDonation: 10,
    },
  }),
} as const;

export type SectionKey = keyof typeof SITE_SECTIONS;

type Widen<T> = T extends number ? number : T extends boolean ? boolean : T extends readonly unknown[] ? ListItem[] : string;

export type SectionContent<K extends SectionKey> = {
  [F in keyof (typeof SITE_SECTIONS)[K]["defaults"]]: Widen<(typeof SITE_SECTIONS)[K]["defaults"][F]>;
};

export const SECTION_KEYS = Object.keys(SITE_SECTIONS) as SectionKey[];

export function isSectionKey(key: string): key is SectionKey {
  return Object.prototype.hasOwnProperty.call(SITE_SECTIONS, key);
}

/** Reemplaza `{n}` (u otras claves) en textos del CMS. */
export function fillTemplate(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in values ? String(values[k]) : m));
}
