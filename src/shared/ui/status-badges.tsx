import { Badge, type BadgeTone } from "./badge";

const DONATION: Record<string, [string, BadgeTone]> = {
  PENDING: ["Pendiente", "alerta"],
  APPROVED: ["Aprobada", "exito"],
  REJECTED: ["Rechazada", "error"],
};
const PARTICIPATION: Record<string, [string, BadgeTone]> = {
  REGISTERED: ["Inscrito", "lavanda"],
  ATTENDED: ["Asistió", "exito"],
  CANCELLED: ["Cancelado", "neutral"],
};
const CLAIM: Record<string, [string, BadgeTone]> = {
  PENDING: ["Por usar", "alerta"],
  REDEEMED: ["Usado", "exito"],
  CANCELLED: ["Cancelado", "neutral"],
};
const ROLE: Record<string, [string, BadgeTone]> = {
  USER: ["Donante", "rosa"],
  SUPERVISOR: ["Supervisor", "lavanda"],
  ADMIN: ["Administrador", "vino"],
};
export const METHOD_LABEL: Record<string, string> = {
  QR: "Pago QR",
  TRANSFER: "Transferencia",
  CASH: "Efectivo",
  OTHER: "Otro",
};

function make(map: Record<string, [string, BadgeTone]>) {
  return function StatusBadge({ status }: { status: string }) {
    const [label, tone] = map[status] ?? [status, "neutral"];
    return <Badge tone={tone}>{label}</Badge>;
  };
}

export const DonationStatusBadge = make(DONATION);
export const ParticipationStatusBadge = make(PARTICIPATION);
export const ClaimStatusBadge = make(CLAIM);
export const RoleBadge = make(ROLE);
