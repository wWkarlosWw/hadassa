import { cn } from "@/shared/lib/utils";

/** Tabla responsive: hace scroll horizontal dentro de su contenedor. */
export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="-mx-px overflow-x-auto">
      <table className={cn("w-full min-w-[640px] text-left text-sm", className)} {...props} />
    </div>
  );
}

export function Th({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn("border-b border-borde bg-crema/60 px-4 py-3 text-xs font-semibold tracking-wide text-tinta-suave uppercase first:pl-6 last:pr-6", className)}
      {...props}
    />
  );
}

export function Td({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("border-b border-borde/70 px-4 py-3.5 align-middle first:pl-6 last:pr-6", className)} {...props} />;
}
