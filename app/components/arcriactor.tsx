"use client";

import { useEffect, useRef, useState } from "react";
import {
  useScroll,
  useTransform,
  useMotionValueEvent,
  motion,
  useSpring,
} from "framer-motion";

const FRAME_COUNT = 240;
const BASE_PATH   = process.env.NEXT_PUBLIC_BASE_PATH || "";
const IMAGE_PATH  = `${BASE_PATH}/animatedarcriacter/ezgif-frame-`;

export default function ArcRiactor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]); // ref avoids state re-renders
  const [isLoading, setIsLoading] = useState(true);
  const rafRef     = useRef<number>(0);    // RAF handle — throttle canvas draws
  const lastIndex  = useRef<number>(-1);  // skip identical frames

  const { scrollYProgress } = useScroll();

  // ONE-WAY assembly, 0 → 239 over the first 80 % of scroll
  const currentFrame = useTransform(scrollYProgress, [0, 0.80], [0, FRAME_COUNT - 1]);
  const smoothFrame  = useSpring(currentFrame, { stiffness: 100, damping: 28, restDelta: 0.5 });

  // ─── Preload ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loaded = 0;

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src   = `${IMAGE_PATH}${i.toString().padStart(3, "0")}.jpg`;
      img.onload = img.onerror = () => {
        loadedImages[i - 1] = img;
        if (++loaded === FRAME_COUNT) {
          imagesRef.current = loadedImages;
          setIsLoading(false);
          drawFrame(0); // show first frame immediately
        }
      };
    }
  }, []);

  // ─── Draw — runs inside a RAF so it never blocks the main thread twice ────
  const drawFrame = (index: number) => {
    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext("2d");
    const img    = imagesRef.current[index];
    if (!canvas || !ctx || !img) return;

    // Cover-fit
    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const x     = (canvas.width  / 2) - (img.width  / 2) * scale;
    const y     = (canvas.height / 2) - (img.height / 2) * scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

    // ── Baked vignette (replaces the CSS blend-mode layers — zero GPU cost) ──
    const cx   = canvas.width / 2;
    const cy   = canvas.height / 2;
    const rMax = Math.hypot(cx, cy) * 1.1;

    // deep vignette
    const vig = ctx.createRadialGradient(cx, cy, rMax * 0.30, cx, cy, rMax);
    vig.addColorStop(0,    "rgba(0,0,0,0)");
    vig.addColorStop(0.55, "rgba(0,0,0,0.18)");
    vig.addColorStop(1,    "rgba(0,0,0,0.78)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // cool blue tint at the center
    const tint = ctx.createRadialGradient(cx, cy, 0, cx, cy, rMax * 0.5);
    tint.addColorStop(0,   "rgba(0,190,255,0.05)");
    tint.addColorStop(0.6, "rgba(0,60,160,0.04)");
    tint.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // ─── RAF-throttled scroll listener ────────────────────────────────────────
  useMotionValueEvent(smoothFrame, "change", (latest) => {
    const idx = Math.min(Math.max(Math.round(latest), 0), FRAME_COUNT - 1);
    if (idx === lastIndex.current) return;   // same frame — skip entirely
    lastIndex.current = idx;

    if (rafRef.current) return;              // RAF already queued — skip
    rafRef.current = requestAnimationFrame(() => {
      drawFrame(idx);
      rafRef.current = 0;
    });
  });

  // ─── Resize ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      drawFrame(lastIndex.current < 0 ? 0 : lastIndex.current);
    };
    window.addEventListener("resize", resize);
    resize();
    return () => window.removeEventListener("resize", resize);
  }, []);

  // ─── HUD numbers ──────────────────────────────────────────────────────────
  const coreTemp = useTransform(scrollYProgress, [0, 0.80], [3_000,   4_200_000]);
  const rpm      = useTransform(scrollYProgress, [0, 0.80], [    500,    25_000]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#050505]">

      {/* Loading */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-400/80 mb-4" />
          <p className="text-white/50 tracking-widest text-xs uppercase animate-pulse">Initializing Core...</p>
        </div>
      )}

      {/* Canvas — promoted to own GPU layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
        style={{ willChange: "transform" }}
      />

      {/* ══════════════════════════════════════════════════════════════════════
          PURE-CSS POST-PROCESSING — no blend modes, no SVG filters, no RAF
          All GPU-composited using only opacity + transform on static divs.
          ══════════════════════════════════════════════════════════════════════ */}

      {/* 1. Outer vignette — simple radial, pure opacity */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 68% 68% at 50% 50%, transparent 22%, rgba(0,0,0,0.50) 60%, rgba(0,0,0,0.88) 100%)",
        }}
      />

      {/* 2. HDR bloom ring — static gradient, pulsing with CSS keyframe only */}
      <div
        className="absolute pointer-events-none arc-bloom"
        style={{
          width: 360,
          height: 360,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(90,200,255,0.40) 0%, rgba(30,100,255,0.18) 40%, transparent 72%)",
          borderRadius: "50%",
          filter: "blur(16px)",
        }}
      />

      {/* 3. Inner core pulse — tight white, CSS pulse */}
      <div
        className="absolute pointer-events-none arc-core-pulse"
        style={{
          width: 160,
          height: 160,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.60) 0%, rgba(160,230,255,0.30) 40%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(6px)",
        }}
      />

      {/* 4. Specular highlight — static, slightly off-centre for realism */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 480,
          height: 380,
          top: "38%",
          left: "43%",
          transform: "translate(-50%,-50%) rotate(-18deg)",
          background:
            "radial-gradient(ellipse 55% 40% at 42% 48%, rgba(255,255,255,0.11) 0%, rgba(100,190,255,0.06) 45%, transparent 70%)",
          filter: "blur(24px)",
        }}
      />

      {/* 5. Subtle chromatic-abberation rim — pure CSS, no blend mode */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 78% 78% at 50% 50%, transparent 56%, rgba(0,200,255,0.03) 72%, rgba(255,0,80,0.025) 82%, transparent 90%)",
        }}
      />

      {/* 6. Top lens-curve highlight */}
      <div
        className="absolute inset-x-0 top-0 h-[45%] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 70% at 50% -8%, rgba(120,210,255,0.06) 0%, transparent 65%)",
        }}
      />

      {/* 7. Subtle side ambient light */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,70,180,0.05) 0%, transparent 18%, transparent 82%, rgba(0,70,180,0.05) 100%)",
        }}
      />

      {/* ── HUD Layer ────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-20 pointer-events-none">

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#4f90e5 1px, transparent 1px), linear-gradient(90deg, #4f90e5 1px, transparent 1px)",
            backgroundSize: "100px 100px",
          }}
        />

        {/* Scan line — single CSS animation, zero JS */}
        <motion.div
          className="absolute left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-blue-400/60 to-transparent"
          style={{ top: 0, boxShadow: "0 0 10px rgba(59,130,246,0.6)" }}
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />

        {/* Bottom-left numbers */}
        <div className="absolute bottom-10 left-10 hidden md:flex gap-8 backdrop-blur-sm bg-black/20 p-4 rounded-xl border border-white/5">
          <AnimatedNumber value={coreTemp} label="CORE TEMP (K)" />
          <AnimatedNumber value={rpm}      label="ROTOR RPM"     />
          <div className="flex flex-col items-end">
            <span className="text-xs text-green-400 font-mono tracking-widest uppercase mb-1">SYSTEM STATUS</span>
            <span className="text-xl font-mono text-white/90">OPTIMAL</span>
          </div>
        </div>

        {/* Right dot column */}
        <div className="absolute top-1/2 right-6 -translate-y-1/2 hidden md:flex flex-col gap-2">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 h-1 bg-white/20 rounded-full"
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 1.5, delay: i * 0.05, repeat: Infinity }}
            />
          ))}
        </div>
      </div>

      {/* ── CSS keyframes injected inline — no extra stylesheet needed ──── */}
      <style>{`
        .arc-bloom {
          animation: arcBloom 3s ease-in-out infinite;
        }
        .arc-core-pulse {
          animation: arcPulse 2.2s ease-in-out infinite;
        }
        @keyframes arcBloom {
          0%, 100% { opacity: 0.55; transform: translate(-50%, -50%) scale(1);    }
          50%       { opacity: 0.80; transform: translate(-50%, -50%) scale(1.08); }
        }
        @keyframes arcPulse {
          0%, 100% { opacity: 0.60; transform: translate(-50%, -50%) scale(1);    }
          50%       { opacity: 0.90; transform: translate(-50%, -50%) scale(1.10); }
        }
      `}</style>
    </div>
  );
}

// ─── AnimatedNumber ────────────────────────────────────────────────────────
const AnimatedNumber = ({
  value,
  label,
}: {
  value: import("framer-motion").MotionValue<number>;
  label: string;
}) => {
  const [display, setDisplay] = useState(0);
  useMotionValueEvent(value, "change", (v) => setDisplay(Math.round(v)));
  return (
    <div className="flex flex-col items-end">
      <span className="text-xs text-blue-400 font-mono tracking-widest uppercase mb-1">{label}</span>
      <span className="text-2xl font-mono text-white/90 tabular-nums">{display.toLocaleString()}</span>
    </div>
  );
};
