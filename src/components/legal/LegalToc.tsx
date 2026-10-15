"use client";

import { useEffect, useState } from "react";

/** "On this page": marks the section you're reading (the one nearest the top of the window). */
export function LegalToc({ items }: { items: { id: string; title: string }[] }) {
  const [current, setCurrent] = useState(items[0]?.id);
  useEffect(() => {
    const sections = items.map((i) => document.getElementById(i.id)).filter((s): s is HTMLElement => !!s);
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setCurrent(top.target.id);
      },
      { rootMargin: "0px 0px -70% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [items]);
  return (
    <ul>
      {items.map((i) => (
        <li key={i.id}>
          <a href={`#${i.id}`} aria-current={i.id === current ? "location" : undefined}>{i.title}</a>
        </li>
      ))}
    </ul>
  );
}
