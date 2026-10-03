import { ExternalLink, Trash2 } from "lucide-react";
import { requireRole } from "@/modules/auth/session";
import { ensureDefaultMenu, listMenuItems } from "@/modules/menu/service";
import { deleteMenuItemAction } from "@/modules/menu/actions";
import { listPages } from "@/modules/pages/service";
import { MenuItemDialog } from "@/modules/menu/components/menu-item-dialog";
import { MenuRowActions } from "@/modules/menu/components/menu-row-actions";
import { ConfirmAction } from "@/modules/panel/confirm-action";
import { PageHeader } from "@/shared/ui/page-header";
import { Card, CardHeader } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { EmptyState } from "@/shared/ui/empty-state";

export const metadata = { title: "Menú del sitio" };

const CORE_ROUTES = [
  { href: "/", label: "Inicio" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/casa-de-fruto", label: "Casa de Fruto" },
  { href: "/donar", label: "Proyectos y donaciones" },
  { href: "/actividades", label: "Actividades" },
  { href: "/contacto", label: "Contacto" },
  { href: "/ingresar", label: "Ingresar" },
];

const LOCATIONS = [
  { key: "HEADER", title: "Menú principal", description: "Enlaces del encabezado del sitio (también en el menú móvil)." },
  { key: "FOOTER", title: "Pie de página", description: "Enlaces que aparecen en el footer." },
] as const;

export default async function MenuPage() {
  await requireRole("ADMIN");
  // La primera vez copia los enlaces actuales para que se puedan editar.
  await ensureDefaultMenu();
  const [items, pages] = await Promise.all([listMenuItems(), listPages()]);
  const suggestions = [...CORE_ROUTES, ...pages.map((p) => ({ href: `/${p.slug}`, label: p.title }))];

  return (
    <>
      <PageHeader
        title="Menú del sitio"
        description="Ordena, oculta o agrega enlaces del encabezado y del pie de página. Las páginas personalizadas marcadas como “en el menú” se agregan automáticamente al final."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        {LOCATIONS.map((loc) => {
          const rows = items.filter((i) => i.location === loc.key);
          return (
            <Card key={loc.key}>
              <CardHeader
                title={loc.title}
                description={loc.description}
                action={<MenuItemDialog location={loc.key} suggestions={suggestions} />}
              />
              {rows.length === 0 ? (
                <EmptyState title="Sin enlaces" description="Agrega el primer enlace de esta ubicación." />
              ) : (
                <ul className="divide-y divide-borde">
                  {rows.map((item, i) => (
                    <li key={item.id} className={`flex flex-wrap items-center gap-3 px-5 py-3 sm:px-6 ${item.isVisible ? "" : "opacity-60"}`}>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 font-medium text-tinta">
                          {item.label}
                          {item.openInNewTab && <ExternalLink className="size-3.5 text-tinta-suave" aria-label="Pestaña nueva" />}
                          {!item.isVisible && <Badge tone="alerta">Oculto</Badge>}
                        </p>
                        <p className="truncate text-xs text-tinta-suave">{item.href}</p>
                      </div>
                      <MenuRowActions id={item.id} isVisible={item.isVisible} isFirst={i === 0} isLast={i === rows.length - 1} />
                      <MenuItemDialog
                        item={{
                          id: item.id,
                          label: item.label,
                          href: item.href,
                          location: item.location,
                          sortOrder: item.sortOrder,
                          isVisible: item.isVisible,
                          openInNewTab: item.openInNewTab,
                        }}
                        suggestions={suggestions}
                      />
                      <ConfirmAction
                        action={deleteMenuItemAction}
                        fields={{ id: item.id }}
                        variant="ghost"
                        size="icon"
                        ariaLabel={`Eliminar ${item.label}`}
                        icon={<Trash2 className="size-4" aria-hidden />}
                        title={`Eliminar “${item.label}”`}
                        confirmLabel="Eliminar"
                        confirmVariant="danger"
                      />
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}
