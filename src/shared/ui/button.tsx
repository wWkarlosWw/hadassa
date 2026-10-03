import Link from "next/link";
import { cn } from "@/shared/lib/utils";

const variants = {
  primary: "bg-lavanda-600 text-white hover:bg-lavanda-700 shadow-sm",
  rosa: "bg-rosa text-vino-700 hover:bg-rosa-500 hover:text-white",
  vino: "bg-vino text-white hover:bg-vino-700",
  outline: "border border-borde bg-papel text-tinta hover:border-rosa hover:bg-rosa-50",
  ghost: "text-tinta-suave hover:bg-rosa-50 hover:text-tinta",
  danger: "bg-error text-white hover:brightness-95",
  light: "bg-white/90 text-noche-900 hover:bg-white backdrop-blur",
} as const;

const sizes = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-7 text-base gap-2.5",
  icon: "h-9 w-9 justify-center",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200",
    "disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
    variants[variant],
    sizes[size],
    className,
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize };

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...props} />;
}

type LinkButtonProps = React.ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize };

export function LinkButton({ variant, size, className, ...props }: LinkButtonProps) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}
