import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LOGICA @ UIC", short_name: "LOGICA",
    description: "Latinx Organization for Growth in Computing and Academics at UIC.",
    start_url: "/", scope: "/", display: "standalone",
    background_color: "#000000", theme_color: "#000000",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { src: "/logo-logica.png", sizes: "447x447", type: "image/png", purpose: "any" },
    ],
  };
}
