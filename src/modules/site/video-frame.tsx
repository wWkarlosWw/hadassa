import { Play } from "lucide-react";
import { toEmbedUrl } from "./video";
import { cn } from "@/shared/lib/utils";

/** Video embebido o, si aún no hay video, un marcador elegante. */
export function VideoFrame({
  url,
  title,
  placeholder = "Muy pronto compartiremos este video",
  className,
}: {
  url?: string | null;
  title: string;
  placeholder?: string;
  className?: string;
}) {
  const embed = toEmbedUrl(url);
  return (
    <div className={cn("relative aspect-video w-full overflow-hidden bg-noche-900", className)}>
      {embed ? (
        <iframe
          src={embed}
          title={title}
          className="absolute inset-0 size-full"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-rosa-100 via-crema to-lavanda-100">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-noche-900 text-white shadow-lg sm:size-20">
              <Play className="ml-1 size-7 fill-white sm:size-9" aria-hidden />
            </span>
            <p className="px-4 text-sm font-medium text-tinta-suave">{placeholder}</p>
          </div>
        </div>
      )}
    </div>
  );
}
