import { cn } from "@/shared/lib/utils";

const control =
  "w-full rounded-xl border border-borde bg-papel px-3.5 text-sm text-tinta placeholder:text-tinta-suave/70 " +
  "transition focus:border-lavanda focus:outline-none focus:ring-4 focus:ring-lavanda-100 disabled:opacity-60 " +
  "aria-[invalid=true]:border-error aria-[invalid=true]:ring-error-50";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, "min-h-28 py-2.5 leading-relaxed", className)} {...props} />;
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(control, "h-11 pr-8", className)} {...props} />;
}

export function Checkbox({ label, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-2.5 text-sm text-tinta", className)}>
      <input type="checkbox" className="size-4 rounded border-borde accent-lavanda-600" {...props} />
      {label}
    </label>
  );
}

/** Etiqueta + control + ayuda/error. */
export function Field({
  label,
  htmlFor,
  error,
  help,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string[] | string;
  help?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const message = Array.isArray(error) ? error[0] : error;
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-tinta">
        {label}
      </label>
      {children}
      {message ? (
        <p className="text-xs font-medium text-error" role="alert">
          {message}
        </p>
      ) : help ? (
        <p className="text-xs text-tinta-suave">{help}</p>
      ) : null}
    </div>
  );
}

/** Mensaje global de un formulario (resultado de una Server Action). */
export function FormMessage({ state }: { state: { ok: boolean; error?: string; message?: string } | null }) {
  if (!state) return null;
  const text = state.ok ? state.message : state.error;
  if (!text) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={cn(
        "rounded-xl px-4 py-3 text-sm font-medium",
        state.ok ? "bg-exito-50 text-exito" : "bg-error-50 text-error",
      )}
    >
      {text}
    </p>
  );
}
