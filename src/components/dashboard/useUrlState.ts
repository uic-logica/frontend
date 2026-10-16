"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

/**
 * One query parameter as state: `?id=` for the open item, `?status=` for a
 * tab, `?q=` for a search. Refresh, Back and a pasted link all land on the
 * same view. Writes use `replace` (no history entry per keystroke) except
 * opening an item, which pushes so Back closes it.
 */
export function useUrlState(key: string, fallback = ""): [string, (value: string, opts?: { push?: boolean }) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const value = params.get(key) ?? fallback;
  const set = useCallback(
    (next: string, opts?: { push?: boolean }) => {
      const query = new URLSearchParams(window.location.search);
      if (next && next !== fallback) query.set(key, next);
      else query.delete(key);
      const url = query.size ? `${pathname}?${query}` : pathname;
      if (opts?.push) router.push(url, { scroll: false });
      else router.replace(url, { scroll: false });
    },
    [fallback, key, pathname, router],
  );
  return [value, set];
}
