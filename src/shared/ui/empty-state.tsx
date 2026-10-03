import Image from "next/image";
import { cn } from "@/shared/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-14 text-center", className)}>
      <Image src="/brand/sello-tallo.webp" alt="" width={72} height={72} className="mb-4 opacity-80" />
      <p className="font-serif text-lg text-tinta">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-tinta-suave">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
