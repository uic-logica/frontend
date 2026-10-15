import Image from "next/image";
import { initials } from "./types";

export function Avatar({
  name,
  photoUrl,
  className = "d-avatar",
}: {
  name?: string | null;
  photoUrl?: string | null;
  className?: string;
}) {
  if (photoUrl) {
    return (
      <Image
        className={className}
        src={photoUrl}
        width={96}
        height={96}
        unoptimized
        alt={`${name || "Member"}'s profile photo`}
      />
    );
  }
  return <span className={className}>{initials(name || null)}</span>;
}
