"use client";

import { useEffect, useRef } from "react";
import { FourDots } from "@/components/brand/LogicaMark";

const beats = [
  {
    label: "Who we are",
    title: "A Latinx home for builders at UIC",
    body: "LOGICA brings students together around computing, academics, and culture — a place to belong and to push hard.",
  },
  {
    label: "What we do",
    title: "Events, mentorship, real projects",
    body: "From workshops to company visits to peer study, we turn ambition into shared practice.",
  },
  {
    label: "How to join",
    title: "Show up. Sign in. Build with us.",
    body: "Start with an event, meet the board, or sign in with your UIC email — the door is open.",
  },
] as const;

export function StoryReveal() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-beat]"));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    let killed = false;
    let cleanup: (() => void) | undefined;

    async function runGsap() {
      try {
        const gsap = (await import("gsap")).default;
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        if (killed) return;
        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
          items.forEach((el) => {
            const wipe = el.querySelector<HTMLElement>(".plane-wipe");
            const words = el.querySelectorAll<HTMLElement>("[data-word]");
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: el,
                start: "top 82%",
                toggleActions: "play none none reverse",
              },
            });
            tl.fromTo(el, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, 0);
            if (wipe) {
              tl.fromTo(wipe, { scaleX: 0 }, { scaleX: 1, duration: 0.55, ease: "power2.inOut" }, 0);
            }
            if (words.length) {
              tl.fromTo(
                words,
                { opacity: 0, y: 12 },
                { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "power2.out" },
                0.15,
              );
            }
          });
        }, root!);
        cleanup = () => ctx.revert();
      } catch {
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) entry.target.classList.add("is-visible");
            });
          },
          { threshold: 0.35 },
        );
        items.forEach((el) => {
          el.classList.add("story-beat");
          io.observe(el);
        });
        cleanup = () => io.disconnect();
      }
    }

    void runGsap();
    return () => {
      killed = true;
      cleanup?.();
    };
  }, []);

  return (
    <section ref={rootRef} className="bg-paper border-t border-ink" aria-labelledby="story-heading">
      <div className="mx-auto max-w-shell px-4 py-14 md:px-6 md:py-24">
        <FourDots />
        <p className="type-label mt-4 text-ink-muted">The story in three beats</p>
        <h2 id="story-heading" className="type-display-2 mt-3">
          Who we are → what we do → get involved
        </h2>

        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {beats.map((beat, index) => (
            <li key={beat.label} data-beat className="card relative overflow-hidden opacity-0">
              <div className="plane-wipe bg-signal opacity-15" aria-hidden />
              <div className="relative z-[1] h-1 w-full bg-signal" aria-hidden />
              <div className="relative z-[1] p-6">
                <p className="type-label text-ink-muted">
                  {String(index + 1).padStart(2, "0")} · {beat.label}
                </p>
                <h3 className="type-h3 mt-3 text-balance">
                  {beat.title.split(" ").map((word, i) => (
                    <span key={`${word}-${i}`} data-word className="mr-[0.3em] inline-block">
                      {word}
                    </span>
                  ))}
                </h3>
                <p className="mt-3 text-body-sm text-ink-muted">{beat.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
