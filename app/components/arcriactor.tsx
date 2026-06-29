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

  const [loadProgress, setLoadProgress] = useState(0);

  // ─── Cache Storage Helpers ────────────────────────────────────────────────
  const CACHE_NAME = "arc-reactor-image-cache-v1";

  const getCachedImage = async (url: string): Promise<string | null> => {
    try {
      if (typeof window === "undefined" || !("caches" in window)) return null;
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(url);
      if (cachedResponse) {
        const blob = await cachedResponse.blob();
        return URL.createObjectURL(blob);
      }
    } catch (e) {
      console.warn("Cache API read error:", e);
    }
    return null;
  };

  const cacheImage = async (url: string, response: Response) => {
    try {
      if (typeof window === "undefined" || !("caches" in window)) return;
      const cache = await caches.open(CACHE_NAME);
      await cache.put(url, response);
    } catch (e) {
      console.warn("Cache API write error:", e);
    }
  };

  const loadAndCacheImage = (
    url: string,
    index: number,
    targetArray: HTMLImageElement[]
  ): Promise<void> => {
    return new Promise(async (resolve) => {
      // 1. Try Cache Storage first
      try {
        const cachedUrl = await getCachedImage(url);
        if (cachedUrl) {
          const img = new Image();
          img.src = cachedUrl;
          img.onload = () => {
            targetArray[index] = img;
            resolve();
          };
          img.onerror = () => {
            fallbackToNetwork(url, index, targetArray).then(resolve);
          };
          return;
        }
      } catch (err) {
        // Fallback
      }

      // 2. Fetch & Cache
      try {
        const response = await fetch(url);
        if (response.ok) {
          const responseClone = response.clone();
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);

          const img = new Image();
          img.src = objectUrl;
          img.onload = () => {
            targetArray[index] = img;
            cacheImage(url, responseClone);
            resolve();
          };
          img.onerror = () => {
            fallbackToNetwork(url, index, targetArray).then(resolve);
          };
        } else {
          fallbackToNetwork(url, index, targetArray).then(resolve);
        }
      } catch (e) {
        fallbackToNetwork(url, index, targetArray).then(resolve);
      }
    });
  };

  const fallbackToNetwork = (
    url: string,
    index: number,
    targetArray: HTMLImageElement[]
  ): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        targetArray[index] = img;
        resolve();
      };
      img.onerror = () => {
        resolve();
      };
    });
  };

  // ─── Progressive Loader ──────────────────────────────────────────────────
  useEffect(() => {
    const loadImages = async () => {
      const loadedImages: HTMLImageElement[] = [];

      // 1. Load the first critical frames (0 to 14) so the page is ready to show
      const criticalCount = 15;
      const criticalPromises = [];
      
      for (let i = 0; i < criticalCount; i++) {
        const url = `${IMAGE_PATH}${(i + 1).toString().padStart(3, "0")}.jpg`;
        criticalPromises.push(
          loadAndCacheImage(url, i, loadedImages).then(() => {
            // Update progress for critical batch (0% to 100% of critical load)
            const count = loadedImages.filter(Boolean).length;
            setLoadProgress(Math.min(Math.round((count / criticalCount) * 100), 100));
          })
        );
      }

      await Promise.all(criticalPromises);
      imagesRef.current = loadedImages;
      setIsLoading(false); // Hide full loading screen immediately!
      drawFrame(0);

      // 2. Stream remaining frames in background in parallel batches of 8
      const remainingFrames = [];
      for (let i = criticalCount; i < FRAME_COUNT; i++) {
        const url = `${IMAGE_PATH}${(i + 1).toString().padStart(3, "0")}.jpg`;
        remainingFrames.push({ url, index: i });
      }

      const batchSize = 8;
      for (let i = 0; i < remainingFrames.length; i += batchSize) {
        const batch = remainingFrames.slice(i, i + batchSize);
        await Promise.all(
          batch.map((item) => loadAndCacheImage(item.url, item.index, loadedImages))
        );
        // Silently update images reference
        imagesRef.current = [...loadedImages];
      }
    };

    loadImages();
  }, []);

  // ─── Draw Frame with Smart Fallback ───────────────────────────────────────
  const drawFrame = (index: number) => {
    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Smart Fallback: Find nearest loaded frame if target frame isn't loaded yet
    let img = imagesRef.current[index];
    if (!img) {
      let nearestIndex = -1;
      let minDistance = Infinity;
      for (let i = 0; i < FRAME_COUNT; i++) {
        if (imagesRef.current[i]) {
          const dist = Math.abs(i - index);
          if (dist < minDistance) {
            minDistance = dist;
            nearestIndex = i;
          }
        }
      }
      if (nearestIndex !== -1) {
        img = imagesRef.current[nearestIndex];
      }
    }

    if (!img) return; // absolute fallback (if nothing is loaded yet)

    // Cover-fit
    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const x     = (canvas.width  / 2) - (img.width  / 2) * scale;
    const y     = (canvas.height / 2) - (img.height / 2) * scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

    // Baked vignette
    const cx   = canvas.width / 2;
    const cy   = canvas.height / 2;
    const rMax = Math.hypot(cx, cy) * 1.1;

    const vig = ctx.createRadialGradient(cx, cy, rMax * 0.30, cx, cy, rMax);
    vig.addColorStop(0,    "rgba(0,0,0,0)");
    vig.addColorStop(0.55, "rgba(0,0,0,0.18)");
    vig.addColorStop(1,    "rgba(0,0,0,0.78)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cool blue tint center
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
    if (idx === lastIndex.current) return;
    lastIndex.current = idx;

    if (rafRef.current) return;
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
          <p className="text-white/70 tracking-widest text-xs uppercase animate-pulse font-mono">
            Initializing Core... {loadProgress}%
          </p>
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
