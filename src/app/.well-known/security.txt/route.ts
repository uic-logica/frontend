import { siteUrl } from "@/lib/seo";

export const dynamic = "force-static";

export function GET() {
  const expires = new Date(Date.UTC(new Date().getUTCFullYear() + 1, 8, 29)).toISOString();
  const body = [
    "Contact: mailto:logica@uic.edu", `Expires: ${expires}`, "Preferred-Languages: en",
    `Canonical: ${new URL("/.well-known/security.txt", siteUrl).href}`, "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
