"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Gift, PartyPopper } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { SubmitButton } from "@/shared/ui/submit-button";
import { FormMessage } from "@/shared/ui/form";
import { formatNumber } from "@/shared/lib/utils";
import { claimRewardAction } from "../actions";

export function ClaimRewardButton({ rewardId, title, cost, balance }: { rewardId: string; title: string; cost: number; balance: number }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);
  const affordable = balance >= cost;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <>
      <Button size="sm" variant={affordable ? "primary" : "outline"} disabled={!affordable} onClick={() => { setSession((n) => n + 1); setOpen(true); }} className="w-full">
        <Gift className="size-4" aria-hidden />
        {affordable ? "Canjear" : `Te faltan ${formatNumber(cost - balance)} pts`}
      </Button>
      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === ref.current && setOpen(false)}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-[var(--radius-card)] bg-papel p-0 text-tinta shadow-2xl backdrop:bg-noche-900/45 backdrop:backdrop-blur-sm"
      >
        {open && <ClaimBody key={session} rewardId={rewardId} title={title} cost={cost} balance={balance} onClose={() => setOpen(false)} />}
      </dialog>
    </>
  );
}

function ClaimBody({ rewardId, title, cost, balance, onClose }: { rewardId: string; title: string; cost: number; balance: number; onClose: () => void }) {
  const [state, action] = useActionState(claimRewardAction, null);
  return (
    <div className="p-6">
      {state?.ok ? (
        <div className="text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-rosa-50 text-vino">
            <PartyPopper className="size-7" aria-hidden />
          </span>
          <h2 className="mt-4 font-serif text-2xl">¡Canje exitoso!</h2>
          <p className="mt-2 text-sm text-tinta-suave">{state.message}</p>
          <p className="mt-1 text-xs text-tinta-suave">También lo verás en “Mis canjes”.</p>
          <Button className="mt-6" onClick={() => onClose()}>Listo</Button>
        </div>
      ) : (
        <form action={action} className="space-y-4">
          <input type="hidden" name="rewardId" value={rewardId} />
          <h2 className="font-serif text-xl">Canjear “{title}”</h2>
          <p className="text-sm text-tinta-suave">
            Se descontarán <strong className="text-vino">{formatNumber(cost)} puntos</strong>. Te quedarán {formatNumber(balance - cost)}.
          </p>
          <FormMessage state={state} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onClose()}>Cancelar</Button>
            <SubmitButton pendingText="Canjeando…">Confirmar canje</SubmitButton>
          </div>
        </form>
      )}
    </div>
  );
}
