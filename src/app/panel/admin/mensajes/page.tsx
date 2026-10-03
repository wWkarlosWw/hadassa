import { Phone, Reply } from "lucide-react";
import { requireRole } from "@/modules/auth/session";
import { listContactMessages } from "@/modules/cms/service";
import { MessageActions } from "@/modules/cms/components/message-actions";
import { PageHeader } from "@/shared/ui/page-header";
import { Card } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { EmptyState } from "@/shared/ui/empty-state";
import { formatDateTime } from "@/shared/lib/utils";

export const metadata = { title: "Mensajes" };

export default async function MensajesPage() {
  await requireRole("ADMIN");
  const messages = await listContactMessages();
  const unread = messages.filter((m) => !m.isRead).length;

  return (
    <>
      <PageHeader title="Mensajes de contacto" description={unread ? `${unread} sin leer de ${messages.length}.` : "Mensajes recibidos desde el formulario de contacto del sitio."} />
      {messages.length === 0 ? (
        <Card><EmptyState title="Sin mensajes" description="Cuando alguien escriba desde la web, lo verás aquí." /></Card>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <Card key={m.id} className={m.isRead ? "" : "border-lavanda-300"}>
              <div className="flex items-start gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{m.name}</p>
                    {!m.isRead && <Badge tone="lavanda">Nuevo</Badge>}
                    <span className="text-xs text-tinta-suave">{formatDateTime(m.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 flex flex-wrap gap-x-4 text-xs text-tinta-suave">
                    <a href={`mailto:${m.email}`} className="hover:underline">{m.email}</a>
                    {m.phone && (
                      <a href={`tel:${m.phone}`} className="inline-flex items-center gap-1 hover:underline">
                        <Phone className="size-3" aria-hidden /> {m.phone}
                      </a>
                    )}
                  </p>
                  <p className="mt-3 text-sm whitespace-pre-line text-tinta">{m.message}</p>
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent("Respuesta de Fundación Hadassa")}`}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-lavanda-700 hover:underline"
                  >
                    <Reply className="size-4" aria-hidden /> Responder por correo
                  </a>
                </div>
                <MessageActions id={m.id} isRead={m.isRead} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
