"use client";

import { Check, X } from "lucide-react";
import { ConfirmAction } from "@/modules/panel/confirm-action";
import { approveDonationAction, rejectDonationAction } from "../actions";

export function DonationReviewActions({ id, summary }: { id: string; summary: string }) {
  return (
    <div className="flex justify-end gap-1.5">
      <ConfirmAction
        action={approveDonationAction}
        fields={{ id }}
        variant="primary"
        icon={<Check className="size-4" aria-hidden />}
        label="Aprobar"
        title="Aprobar donación"
        description={`${summary}. Se acreditarán los puntos al donante.`}
        confirmLabel="Aprobar"
      />
      <ConfirmAction
        action={rejectDonationAction}
        fields={{ id }}
        variant="ghost"
        icon={<X className="size-4" aria-hidden />}
        ariaLabel="Rechazar"
        title="Rechazar donación"
        description={summary}
        confirmLabel="Rechazar"
        confirmVariant="danger"
        reasonField="reason"
        reasonLabel="Motivo (lo verá el donante)"
      />
    </div>
  );
}
