import { cn } from "@/shared/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  tone = "dark",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl", className)}>
      {eyebrow && (
        <p className={cn("eyebrow rule-under mb-4 inline-block", tone === "light" ? "text-rosa-200" : "text-malva", align === "left" && "after:left-0 after:translate-x-0")}>
          {eyebrow}
        </p>
      )}
      <h2 className={cn("font-serif text-3xl leading-tight sm:text-4xl lg:text-5xl", tone === "light" ? "text-white" : "text-tinta")}>{title}</h2>
      {subtitle && <p className={cn("mt-4 text-base leading-relaxed sm:text-lg", tone === "light" ? "text-white/80" : "text-tinta-suave")}>{subtitle}</p>}
    </div>
  );
}
