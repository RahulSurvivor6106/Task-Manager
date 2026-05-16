"use client";

import { useEffect, useRef } from "react";

export default function AnimatedAI({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const container = ref.current;
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.zIndex = "-1";
    container.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const DPR = Math.max(1, window.devicePixelRatio || 1);

    function resize() {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = Math.floor(width * DPR);
      canvas.height = Math.floor(height * DPR);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    const particles: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
    const count = Math.max(20, Math.floor((container.clientWidth * container.clientHeight) / 60000));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: 1 + Math.random() * 2,
      });
    }

    let raf = 0;
    let last = performance.now();

    function draw(now: number) {
      const dt = Math.min(40, now - last) / 16.666;
      last = now;

      ctx.clearRect(0, 0, width, height);

      // subtle gradient background
      const g = ctx.createLinearGradient(0, 0, width, height);
      g.addColorStop(0, "rgba(14,165,233,0.03)");
      g.addColorStop(1, "rgba(99,102,241,0.03)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);

      // draw lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 9000) {
            const alpha = 0.12 * (1 - d2 / 9000);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(34,211,238,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      // draw particles
      for (const p of particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        ctx.beginPath();
        ctx.fillStyle = "rgba(34,211,238,0.9)";
        ctx.globalAlpha = 0.9;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(draw);
    }

    function start() {
      resize();
      last = performance.now();
      raf = requestAnimationFrame(draw);
    }

    start();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      if (canvas.parentNode === container) container.removeChild(canvas);
    };
  }, []);

  return <div ref={ref} className={className ?? "absolute inset-0 -z-20"} aria-hidden />;
}
