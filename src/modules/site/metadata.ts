import "server-only";
import type { Metadata } from "next";

/** Metadatos de una página a partir de sus campos SEO del CMS. */
export function seoMetadata(content: { seoTitle?: string; seoDescription?: string }, fallbackTitle?: string): Metadata {
  const title = content.seoTitle || fallbackTitle;
  return {
    ...(title ? { title } : {}),
    ...(content.seoDescription ? { description: content.seoDescription } : {}),
  };
}
