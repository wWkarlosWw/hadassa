import Image from "next/image";
import { QrCode } from "lucide-react";

export function BankInfo({
  content,
}: {
  content: { quickTitle: string; qrImageUrl: string; bankName: string; accountNumber: string; accountHolder: string; accountType: string; holderId: string };
}) {
  const rows = [
    ["Banco", content.bankName],
    ["Cuenta", content.accountNumber],
    ["Titular", content.accountHolder],
    ["Tipo", content.accountType],
    ["NIT / CI", content.holderId],
  ].filter(([, v]) => v);

  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-borde bg-papel shadow-[var(--shadow-suave)]">
      <div className="bg-rosa px-5 py-4 text-sm font-semibold text-vino-700">{content.quickTitle}</div>
      <div className="grid place-items-center bg-crema p-5">
        {content.qrImageUrl ? (
          <Image src={content.qrImageUrl} alt="Código QR para donar a Fundación Hadassa" width={220} height={220} className="size-52 rounded-xl bg-white object-contain p-2" unoptimized={content.qrImageUrl.endsWith(".svg")} />
        ) : (
          <div className="grid size-52 place-items-center rounded-xl border border-dashed border-borde bg-white text-center text-xs text-tinta-suave">
            <span>
              <QrCode className="mx-auto mb-2 size-8" aria-hidden />
              El QR se mostrará aquí
            </span>
          </div>
        )}
      </div>
      <dl className="space-y-2 px-5 py-4 text-sm">
        <p className="font-semibold text-tinta">Dona directo a esta cuenta:</p>
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3">
            <dt className="text-tinta-suave">{k}</dt>
            <dd className="text-right font-medium break-all">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
