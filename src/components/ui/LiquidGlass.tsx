"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

/**
 * Apple-style liquid glass.
 *
 * The part that makes it read as *glass* and not as a frosted rectangle is
 * refraction: the backdrop is bent through the panel's bevelled rim. CSS has no
 * property for that, so we build a displacement map (an image whose R/G channels
 * encode an x/y pixel offset), feed it to `feDisplacementMap`, and hang the whole
 * filter off `backdrop-filter`. Three passes at slightly different scales give the
 * red/green/blue fringe real glass has.
 *
 * logica-lean: SVG filters in `backdrop-filter` are a Chromium-only extension.
 * Safari and Firefox get frosted blur + rim, which still reads as glass, just
 * without the bend. Revisit when either engine ships the filter reference.
 */

/**
 * WebKit parses `backdrop-filter: url(#f)` and then paints nothing at all — not
 * even the blur beside it — so a plain CSS fallback never gets its turn. Gate on
 * the engine instead, and skip building the map on the browsers that ignore it.
 */
function supportsRefraction() {
  if (typeof navigator === "undefined") return false;
  const brands = (
    navigator as Navigator & { userAgentData?: { brands?: { brand: string }[] } }
  ).userAgentData?.brands;
  return !!brands?.some((b) => b.brand === "Chromium");
}

/** Signed distance to a rounded rect (negative inside). */
function sdf(x: number, y: number, halfW: number, halfH: number, r: number) {
  const qx = Math.abs(x - halfW) - halfW + r;
  const qy = Math.abs(y - halfH) - halfH + r;
  return (
    Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r
  );
}

/**
 * Encode the rim's refraction into a PNG. Depth into the panel drives how far a
 * sample is pulled outward along the surface normal: hardest at the very edge,
 * zero once past the bevel, so the middle of the panel stays clear glass.
 *
 * The map is grown by `pad` on every side and stays neutral out there, because a
 * rim sample reaches for backdrop that lies outside the panel — without the
 * margin the filter region clips it and the corners tear.
 */
function displacementMap(
  w: number,
  h: number,
  radius: number,
  bezel: number,
  pad: number,
) {
  const canvas = document.createElement("canvas");
  canvas.width = w + pad * 2;
  canvas.height = h + pad * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const image = ctx.createImageData(canvas.width, canvas.height);
  const halfW = w / 2;
  const halfH = h / 2;
  const r = Math.min(radius, halfW, halfH);

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const px = x + 0.5 - pad;
      const py = y + 0.5 - pad;
      const depth = -sdf(px, py, halfW, halfH, r);
      const t = depth <= 0 || depth >= bezel ? 0 : 1 - depth / bezel;

      let nx = 0;
      let ny = 0;
      if (t > 0) {
        // Gradient of the SDF is the outward surface normal.
        nx = (sdf(px + 1, py, halfW, halfH, r) - sdf(px - 1, py, halfW, halfH, r)) / 2;
        ny = (sdf(px, py + 1, halfW, halfH, r) - sdf(px, py - 1, halfW, halfH, r)) / 2;
        const len = Math.hypot(nx, ny) || 1;
        nx /= len;
        ny /= len;
      }

      const m = t ** 1.7;
      const i = (y * canvas.width + x) * 4;
      image.data[i] = Math.round(255 * (0.5 + 0.5 * nx * m));
      image.data[i + 1] = Math.round(255 * (0.5 + 0.5 * ny * m));
      image.data[i + 2] = 0;
      image.data[i + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL();
}

export type LiquidGlassProps = {
  children?: ReactNode;
  className?: string;
  /** Corner radius in px. Must match the map, so it is a prop, not a class. */
  radius?: number;
  /** Width of the refracting rim in px. */
  bezel?: number;
  /** Peak pixel displacement at the edge. */
  strength?: number;
  blur?: number;
  saturation?: number;
  /** White film over the glass, 0–1. */
  tint?: number;
  style?: CSSProperties;
};

export function LiquidGlass({
  children,
  className = "",
  radius = 24,
  bezel = 16,
  strength = 24,
  blur = 5,
  saturation = 1.7,
  tint = 0.06,
  style,
}: LiquidGlassProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<{ url: string; w: number; h: number } | null>(null);
  const pad = Math.ceil(strength * 1.2) + 2;

  useEffect(() => {
    const el = ref.current;
    if (!el || !supportsRefraction()) return;

    let frame = 0;
    const measure = () => {
      const w = Math.round(el.clientWidth);
      const h = Math.round(el.clientHeight);
      if (!w || !h) return;
      setMap((prev) =>
        prev?.w === w && prev?.h === h
          ? prev
          : { url: displacementMap(w, h, radius, bezel, pad), w, h },
      );
    };

    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    });
    observer.observe(el);
    measure();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [radius, bezel, pad]);

  const frost = `blur(${blur}px) saturate(${saturation})`;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: map
            ? `.lg-${uid}{backdrop-filter:url(#lgf-${uid}) ${frost}}`
            : `.lg-${uid}{backdrop-filter:${frost};-webkit-backdrop-filter:${frost}}`,
        }}
      />
      {map && (
        <svg aria-hidden className="pointer-events-none absolute h-0 w-0">
          <filter
            id={`lgf-${uid}`}
            filterUnits="userSpaceOnUse"
            x={-pad}
            y={-pad}
            width={map.w + pad * 2}
            height={map.h + pad * 2}
            colorInterpolationFilters="sRGB"
          >
            <feImage
              href={map.url}
              x={-pad}
              y={-pad}
              width={map.w + pad * 2}
              height={map.h + pad * 2}
              preserveAspectRatio="none"
              result="map"
            />
            {/* Blue bends most, red least — that split is the chromatic fringe. */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              scale={strength * 1.88}
              xChannelSelector="R"
              yChannelSelector="G"
              result="redPass"
            />
            <feColorMatrix
              in="redPass"
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="red"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              scale={strength * 2}
              xChannelSelector="R"
              yChannelSelector="G"
              result="greenPass"
            />
            <feColorMatrix
              in="greenPass"
              type="matrix"
              values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="green"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              scale={strength * 2.12}
              xChannelSelector="R"
              yChannelSelector="G"
              result="bluePass"
            />
            <feColorMatrix
              in="bluePass"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
              result="blue"
            />
            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" />
          </filter>
        </svg>
      )}
      <div
        ref={ref}
        className={`lg-${uid} relative isolate ${className}`}
        style={{
          borderRadius: radius,
          backgroundColor: `rgba(255,255,255,${tint})`,
          boxShadow: [
            // Specular rim: lit from the top-left, as Apple's is.
            "inset 1px 1px 0 rgba(255,255,255,0.45)",
            "inset -1px -1px 0 rgba(255,255,255,0.16)",
            "inset 0 0 14px rgba(255,255,255,0.10)",
            "0 8px 32px rgba(0,0,0,0.38)",
          ].join(","),
          ...style,
        }}
      >
        {children}
      </div>
    </>
  );
}
