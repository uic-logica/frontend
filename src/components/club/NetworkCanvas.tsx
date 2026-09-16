"use client";

import { useEffect, useRef } from "react";

type Node = { x: number; y: number; vx: number; vy: number };

/**
 * Pixel-faithful port of yalecomputersociety.org network canvas
 * (from their layout chunk: node count, link opacity, mouse repulsion).
 */
export function NetworkCanvas({ intensity = 1 }: { intensity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let nodes: Node[] = [];
    let raf = 0;
    const mouse = { x: 0, y: 0, active: false };
    const drawX: number[] = [];
    const drawY: number[] = [];

    const nodeCount = () => {
      const area = w * h;
      return Math.max(16, Math.min(w < 640 ? 32 : 88, Math.round(area / 16500)));
    };

    const seed = () => {
      nodes = Array.from({ length: nodeCount() }, () => {
        const angle = Math.random() * Math.PI * 2;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: 0.16 * Math.cos(angle),
          vy: 0.16 * Math.sin(angle),
        };
      });
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const paintStatic = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        drawX[i] = nodes[i].x;
        drawY[i] = nodes[i].y;
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dist = Math.hypot(drawX[i] - drawX[j], drawY[i] - drawY[j]);
          if (dist < 132) {
            ctx.strokeStyle = `rgba(255,255,255,${(1 - dist / 132) * 0.11 * intensity})`;
            ctx.beginPath();
            ctx.moveTo(drawX[i], drawY[i]);
            ctx.lineTo(drawX[j], drawY[j]);
            ctx.stroke();
          }
        }
        ctx.fillStyle = `rgba(255,255,255,${0.34 * intensity})`;
        ctx.beginPath();
        ctx.arc(drawX[i], drawY[i], 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const frame = () => {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0) {
          n.x = 0;
          n.vx = -n.vx;
        } else if (n.x > w) {
          n.x = w;
          n.vx = -n.vx;
        }
        if (n.y < 0) {
          n.y = 0;
          n.vy = -n.vy;
        } else if (n.y > h) {
          n.y = h;
          n.vy = -n.vy;
        }

        let px = n.x;
        let py = n.y;
        if (mouse.active) {
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 190 && dist > 0.001) {
            const push = (1 - dist / 190) * 26;
            px += (dx / dist) * push;
            py += (dy / dist) * push;
          }
        }
        drawX[i] = px;
        drawY[i] = py;
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const ax = drawX[i];
          const ay = drawY[i];
          const bx = drawX[j];
          const by = drawY[j];
          const dist = Math.hypot(ax - bx, ay - by);
          if (dist < 132) {
            const alpha = (1 - dist / 132) * 0.11 * intensity;
            ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        const px = drawX[i];
        const py = drawY[i];
        let alpha = 0.34 * intensity;
        if (mouse.active) {
          const dist = Math.hypot(px - mouse.x, py - mouse.y);
          if (dist < 190) {
            const t = 1 - dist / 190;
            alpha = Math.min(0.9, alpha + 0.55 * t);
            ctx.strokeStyle = `rgba(255,255,255,${0.33 * t})`;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.active = false;
    };
    const onVis = () => {
      if (document.hidden) stop();
      else start();
    };

    resize();

    if (reduced) {
      paintStatic();
      const onResizeStatic = () => {
        resize();
        paintStatic();
      };
      window.addEventListener("resize", onResizeStatic);
      return () => window.removeEventListener("resize", onResizeStatic);
    }

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("visibilitychange", onVis);
    start();

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [intensity]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
