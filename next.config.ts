import type { NextConfig } from "next";

const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "http://127.0.0.1:54321");

const nextConfig: NextConfig = {
  // Proyectos y donaciones son una sola sección: /donar.
  async redirects() {
    return [
      { source: "/proyectos", destination: "/donar", permanent: true },
      { source: "/proyectos/:slug", destination: "/donar/:slug", permanent: true },
    ];
  },
  images: {
    // Imágenes subidas al bucket público `media` de Supabase Storage.
    remotePatterns: [
      {
        protocol: supabaseUrl.protocol.replace(":", "") as "http" | "https",
        hostname: supabaseUrl.hostname,
        port: supabaseUrl.port,
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Supabase local corre en 127.0.0.1 (IP privada).
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
  experimental: {
    // Comprobantes e imágenes de hasta 10 MB (+ margen de multipart).
    serverActions: { bodySizeLimit: "11mb" },
    proxyClientMaxBodySize: "11mb",
  },
};

export default nextConfig;
