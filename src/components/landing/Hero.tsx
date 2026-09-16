"use client";

import Image from "next/image";
import { useRef } from "react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { FourDots } from "@/components/brand/LogicaMark";

/** Full-bleed ink hero — logo as brand lockup (DESIGN.md). */
export function Hero() {
  const stageRef = useRef<HTMLElement>(null);

  function onPointerMove(e: React.PointerEvent<HTMLElement>) {
    const el = stageRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    el.style.setProperty("--kx", x.toFixed(3));
    el.style.setProperty("--ky", y.toFixed(3));
  }

  function onPointerLeave() {
    stageRef.current?.style.setProperty("--kx", "0");
    stageRef.current?.style.setProperty("--ky", "0");
  }

  return (
    <section
      ref={stageRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative isolate min-h-[100svh] overflow-hidden bg-ink text-paper"
      aria-labelledby="hero-heading"
    >
      <div className="pointer-events-none absolute inset-0 constructivist-grid" aria-hidden />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-signal" aria-hidden />

      <div className="relative mx-auto grid min-h-[100svh] max-w-shell grid-cols-1 items-center gap-12 px-4 pb-16 pt-28 md:grid-cols-[1.1fr_0.9fr] md:gap-10 md:px-6 md:pb-20 md:pt-32">
        <div className="max-w-xl">
          <FourDots className="hero-rise" />
          <h1 id="hero-heading" className="hero-rise hero-rise-delay-1 type-display-1 mt-6 text-balance">
            People build brighter tomorrows.
          </h1>
          <p className="hero-rise hero-rise-delay-2 mt-5 max-w-md text-body-lg text-paper/80">
            Ideas, connection, and opportunity for Latinx students in computing
            and academics at UIC.
          </p>
          <div className="hero-rise hero-rise-delay-3 mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/signin" size="lg" variant="signal">
              Join us
            </ButtonLink>
            <ButtonLink href="/#mission" size="lg" variant="outline">
              Our mission
            </ButtonLink>
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-center">
          <div className="kinetic-mark">
            <Image
              src="/logo-logica.png"
              alt="LOGICA — circuit tree logo"
              width={320}
              height={320}
              priority
              className="h-auto w-[min(72vw,20rem)] md:w-[min(36vw,22rem)]"
            />
          </div>
          <p className="mt-6 max-w-[14rem] text-center type-label text-paper/60">
            Rooted in culture.
            <br />
            Built for what&apos;s next.
          </p>
        </div>
      </div>
    </section>
  );
}
