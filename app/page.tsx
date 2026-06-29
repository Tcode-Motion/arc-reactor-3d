"use client";

import { useScroll, useTransform, useMotionValueEvent, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { 
  Cpu, 
  Thermometer, 
  ShieldAlert, 
  Zap, 
  Radio, 
  CheckCircle2, 
  Terminal as TerminalIcon, 
  Gauge,
  Activity,
  Layers,
  ArrowRight,
  ChevronRight
} from "lucide-react";

const logsStage1 = [
  "SECURE SYSTEM HANDSHAKE: INITIATED",
  "DECRYPTING CORE MODULE ACCESS CODES...",
  "ACCESS AUTHORIZED: COMMAND_CLEARANCE_OMEGA",
  "PALLADIUM-103 CORE DOCK EXTENDING...",
  "ISOTOPE HARVEST INTEGRITY AT 100%",
  "DECAY RADIATION EMISSION CHECK: NOMINAL",
  "ENGAGING LOCKING MECHANISMS..."
];

const logsStage2 = [
  "CRYOGENIC FLUID VENT SYSTEM: ONLINE",
  "RECIRCULATION PUMPS ENGAGED AT 4000 RPM",
  "LIQUID NITROGEN PRESSURE: 8.4 BAR",
  "CHAMBER TEMPERATURE CRITICAL DRIFT CHECK...",
  "HEAT FLUX DISSIPATION: NOMINAL",
  "THERMOMETER PROBES ACTIVE IN 12 SECTORS"
];

const logsStage3 = [
  "HELICAL MAGNET TOROIDS ENERGIZING...",
  "COIL EXCESS TEMPERATURE SENSORS: GREEN",
  "CURRENT DRAW: 15,000 AMPS",
  "POLOIDAL OSCILLATION ACTIVE AT 400 HZ",
  "MAGNETIC FLUX DENSITY: 14.5 TESLA",
  "PLASMA CONFINEMENT STABILITY STATUS: LOCKED"
];

const logsStage4 = [
  "PALLADIUM ISOTOPE EMITTER POWER: 45KV",
  "DEUTERIUM GAS INJECTORS ENGAGED",
  "PLASMA DENSITY CORRECTION INJECTOR: ON",
  "IONIZATION EFFICIENCY: 99.82%",
  "NEUTRINO EMISSION DETECTION ACTIVE",
  "INITIATING COLLISION AND REACTION LOOP..."
];

const logsStage5 = [
  "MHD ENERGY CAPTURE GRID ACTIVE",
  "SOLID STATE CONVERTER: SYSTEM READY",
  "BUSBAR BUS-A VOLTAGE CALIBRATION: 850KV",
  "SYNC PHASE LOCK ANGLE CALIBRATION: NOMINAL",
  "ENERGY TRANSLATION EFFICIENCY: 99.95%",
  "INTEGRATING MAIN POWER FEED TO BUSES..."
];

export default function Home() {
  const { scrollYProgress } = useScroll();
  const [currentStep, setCurrentStep] = useState(0);

  // Synchronize step index with scroll progress
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest < 0.13) setCurrentStep(0);
    else if (latest < 0.27) setCurrentStep(1);
    else if (latest < 0.41) setCurrentStep(2);
    else if (latest < 0.55) setCurrentStep(3);
    else if (latest < 0.69) setCurrentStep(4);
    else if (latest < 0.83) setCurrentStep(5);
    else setCurrentStep(6);
  });

  // --- Animation Helpers ---
  const useScrollFade = (start: number, end: number) => {
    // Slower fade in and out for natural pacing
    const fadeInStart = start;
    const fadeInEnd = start + 0.04;
    const fadeOutStart = end - 0.04;
    const fadeOutEnd = end;
    
    const opacity = useTransform(scrollYProgress, [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd], [0, 1, 1, 0]);
    const y = useTransform(scrollYProgress, [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd], [40, 0, 0, -40]);
    return { opacity, y };
  };

  // --- Text Animation Logic (Stages) ---
  
  // 0. Hero (0% - 10%)
  const opacityHero = useTransform(scrollYProgress, [0, 0.10], [1, 0]);
  const yHero = useTransform(scrollYProgress, [0, 0.10], [0, -40]);

  // 1. MK-I Core (12% - 24%)
  const { opacity: opacityStage1, y: yStage1 } = useScrollFade(0.12, 0.24);

  // 2. Thermal Regulation (26% - 38%)
  const { opacity: opacityStage2, y: yStage2 } = useScrollFade(0.26, 0.38);

  // 3. Magnetic Containment (40% - 52%)
  const { opacity: opacityStage3, y: yStage3 } = useScrollFade(0.40, 0.52);

  // 4. Fusion Injection (54% - 66%)
  const { opacity: opacityStage4, y: yStage4 } = useScrollFade(0.54, 0.66);

  // 5. Output Regulation (68% - 80%)
  const { opacity: opacityStage5, y: yStage5 } = useScrollFade(0.68, 0.80);

  // 6. System Online / CTA (83% - 96%)
  const opacityCTA = useTransform(scrollYProgress, [0.83, 0.92], [0, 1]);
  const yCTA = useTransform(scrollYProgress, [0.83, 0.92], [40, 0]);

  return (
    // Height determines animation duration (900vh = comfortable, not sluggish)
    <div className="relative h-[900vh]">
      
      {/* --- Vertical Progress Stepper (Left Side Fixed) --- */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-6 select-none pointer-events-none">
        {[
          { number: "00", name: "HEADING",        pct: 0.00 },
          { number: "01", name: "PALLADIUM CORE", pct: 0.12 },
          { number: "02", name: "THERMAL SHIELD", pct: 0.26 },
          { number: "03", name: "MAGNETIC MATRIX",pct: 0.40 },
          { number: "04", name: "FUSION FEED",    pct: 0.54 },
          { number: "05", name: "OUTPUT REG",     pct: 0.68 },
          { number: "06", name: "CORE ONLINE",    pct: 0.87 },
        ].map((step, idx) => {
          const isActive = currentStep === idx;
          return (
            <div 
              key={idx} 
              className="flex items-center gap-4 group cursor-pointer pointer-events-auto" 
              onClick={() => {
                const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                window.scrollTo({ top: step.pct * maxScroll, behavior: "smooth" });
              }}
            >
              <div className={`w-9 h-9 rounded-full border flex items-center justify-center font-mono text-xs transition-all duration-500 relative ${
                isActive 
                  ? "bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_15px_#3b82f6]" 
                  : "border-white/10 text-white/30 group-hover:border-white/30 group-hover:text-white/60"
              }`}>
                {step.number}
                {isActive && (
                  <span className="absolute -inset-1 rounded-full border border-blue-500/40 animate-ping opacity-75" />
                )}
              </div>
              <span className={`text-[10px] font-mono tracking-widest transition-all duration-500 uppercase ${
                isActive 
                  ? "text-blue-400 opacity-100 font-bold" 
                  : "text-white/20 opacity-0 group-hover:opacity-60 group-hover:text-white/60"
              }`}>
                {step.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* 0. Hero Section (0% - 12%) */}
      <motion.div 
          style={{ opacity: opacityHero, y: yHero }} 
          className="fixed inset-0 flex items-start justify-center p-4 pointer-events-none pt-28 md:pt-32"
      >
          {/* Main Card - Liquid Glass Effect */}
          <div className="text-center backdrop-blur-[2px] bg-white/1 p-10 md:p-14 rounded-[3rem] border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] max-w-4xl w-full">
               <h1 className="text-5xl md:text-8xl font-black text-white/90 tracking-tighter mb-4 drop-shadow-2xl">
                  ARC REACTOR
               </h1>
               <div className="h-1 w-24 bg-blue-500 mx-auto mb-6 rounded-full shadow-[0_0_10px_#3b82f6]" />
               <p className="text-blue-200/80 tracking-[0.4em] uppercase text-xs font-semibold mb-10">
                   Next Generation Energy // Stark Industries
               </p>
              
               {/* Detailed Diagnostics Data Grid */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono text-left max-w-3xl mx-auto">
                   <div className="bg-black/50 p-4 rounded-xl border border-white/5 backdrop-blur-md">
                       <span className="block text-white/30 mb-1 text-[9px] tracking-widest">NET OUTPUT</span>
                       <div className="flex items-end gap-1.5">
                           <span className="text-green-400 text-lg font-bold">128.5</span>
                           <span className="text-white/50 mb-0.5">GW</span>
                       </div>
                   </div>
                   <div className="bg-black/50 p-4 rounded-xl border border-white/5 backdrop-blur-md">
                       <span className="block text-white/30 mb-1 text-[9px] tracking-widest">FUSION EFFICIENCY</span>
                       <div className="flex items-end gap-1.5">
                           <span className="text-blue-400 text-lg font-bold">99.9</span>
                           <span className="text-white/50 mb-0.5">%</span>
                       </div>
                   </div>
                   <div className="bg-black/50 p-4 rounded-xl border border-white/5 backdrop-blur-md">
                       <span className="block text-white/30 mb-1 text-[9px] tracking-widest">CORE TEMP</span>
                       <div className="flex items-end gap-1.5">
                           <span className="text-orange-400 text-lg font-bold">4.2</span>
                           <span className="text-white/50 mb-0.5">MK</span>
                       </div>
                   </div>
                    <div className="bg-black/50 p-4 rounded-xl border border-white/5 backdrop-blur-md">
                       <span className="block text-white/30 mb-1 text-[9px] tracking-widest">FIELD INTEGRITY</span>
                       <div className="flex items-end gap-1.5">
                           <span className="text-purple-400 text-lg font-bold">STABLE</span>
                       </div>
                   </div>
               </div>
          </div>
      </motion.div>

      {/* 1. MK-I Core Stage (15% - 26%) */}
      <motion.div 
          style={{ opacity: opacityStage1, y: yStage1 }}
          className="fixed inset-0 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center px-6 md:px-24 py-16 pointer-events-none"
      >
          {/* Left card: Main Info */}
          <div className="lg:col-span-5 backdrop-blur-xl bg-black/40 p-8 rounded-2xl border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.15)] flex flex-col justify-between h-[480px]">
              <div>
                  <div className="flex items-center gap-3 mb-4">
                      <Cpu className="w-5 h-5 text-blue-400 animate-pulse" />
                      <span className="text-[10px] font-mono text-blue-400 tracking-widest">STAGE 01 // CORE EXPANSION</span>
                  </div>
                  <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4">
                      MK-I Palladium Core
                  </h2>
                  <p className="text-sm text-white/70 leading-relaxed font-light mb-6">
                      The primary energy generator matrix. Preload locks release the high-density Palladium-103 isotope fuel plates, safely suspended inside a titanium alloy containment ring to allow proper thermal expansion during initialization.
                  </p>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-white/40 border-t border-white/10 pt-4">
                 <div><span className="block text-blue-400 font-bold mb-1">ALLOY</span><span className="text-white/80">TI-GOLD PLATED</span></div>
                 <div><span className="block text-blue-400 font-bold mb-1">STATUS</span><span className="text-green-400">UNLOCKED</span></div>
                 <div><span className="block text-blue-400 font-bold mb-1">ISOTOPE</span><span className="text-white/80">PD-103</span></div>
              </div>
          </div>
          
          {/* Empty Space for the 3D Canvas in center */}
          <div className="lg:col-span-2" />

          {/* Right card: Diagnostic terminal */}
          <div className="lg:col-span-5 backdrop-blur-xl bg-black/40 p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-[480px]">
              <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                      <span className="text-xs font-mono text-white/40 flex items-center gap-2">
                          <TerminalIcon className="w-3.5 h-3.5 text-blue-400" />
                          SYS_LOG // PALLADIUM_DOCK
                      </span>
                      <span className="text-[9px] font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded">CONNECTED</span>
                  </div>
                  <div className="space-y-2 font-mono text-[11px] text-blue-300/80 max-h-[220px] overflow-y-auto pr-2">
                      {logsStage1.map((log, i) => (
                          <div key={i} className="flex gap-2 items-start">
                              <span className="text-blue-500/40 select-none">[{12 + i}:00]</span>
                              <span>{log}</span>
                          </div>
                      ))}
                  </div>
              </div>
              
              <div className="mt-4 border-t border-white/10 pt-4">
                  <span className="text-[9px] font-mono text-white/40 block mb-2 uppercase tracking-wider">ISOTOPE INTEGRITY RATIO</span>
                  <div className="flex items-center gap-4">
                      <div className="flex-1 bg-white/10 h-2 rounded-full overflow-hidden">
                          <motion.div 
                              className="h-full bg-blue-500" 
                              initial={{ width: 0 }}
                              animate={{ width: "98.2%" }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                          />
                      </div>
                      <span className="font-mono text-xs text-white">98.2%</span>
                  </div>
              </div>
          </div>
      </motion.div>

      {/* 2. Thermal Regulation Stage (29% - 40%) */}
      <motion.div 
          style={{ opacity: opacityStage2, y: yStage2 }}
          className="fixed inset-0 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center px-6 md:px-24 py-16 pointer-events-none"
      >
          {/* Left card: Diagnostic terminal */}
          <div className="lg:col-span-5 backdrop-blur-xl bg-black/40 p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-[480px]">
              <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                      <span className="text-xs font-mono text-white/40 flex items-center gap-2">
                          <TerminalIcon className="w-3.5 h-3.5 text-orange-400" />
                          SYS_LOG // CRYOGENIC_COOLING
                      </span>
                      <span className="text-[9px] font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded">ONLINE</span>
                  </div>
                  <div className="space-y-2 font-mono text-[11px] text-orange-300/80 max-h-[220px] overflow-y-auto pr-2">
                      {logsStage2.map((log, i) => (
                          <div key={i} className="flex gap-2 items-start">
                              <span className="text-orange-500/40 select-none">[{22 + i}:00]</span>
                              <span>{log}</span>
                          </div>
                      ))}
                  </div>
              </div>
              
              {/* Cooling visual meter */}
              <div className="mt-4 border-t border-white/10 pt-4">
                  <span className="text-[9px] font-mono text-white/40 block mb-2 uppercase tracking-wider">COOLING CHANNEL PRESSURE RANGE</span>
                  <div className="flex justify-between items-end h-12 gap-1.5 pt-2">
                      {[60, 80, 50, 90, 75, 40, 65, 85, 95].map((val, idx) => (
                          <div key={idx} className="bg-white/10 w-full h-full rounded-t overflow-hidden relative">
                              <motion.div 
                                  className="absolute bottom-0 left-0 right-0 bg-orange-500" 
                                  initial={{ height: 0 }}
                                  animate={{ height: `${val}%` }}
                                  transition={{ duration: 1.5, delay: idx * 0.1, repeat: Infinity, repeatType: "reverse" }}
                              />
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          {/* Empty Space for the 3D Canvas in center */}
          <div className="lg:col-span-2" />

          {/* Right card: Main Info */}
          <div className="lg:col-span-5 backdrop-blur-xl bg-black/40 p-8 rounded-2xl border border-orange-500/20 shadow-[0_0_30px_rgba(249,115,22,0.15)] flex flex-col justify-between h-[480px] text-right">
              <div>
                  <div className="flex items-center gap-3 mb-4 justify-end">
                      <span className="text-[10px] font-mono text-orange-400 tracking-widest">STAGE 02 // THERMAL SHIELD</span>
                      <Thermometer className="w-5 h-5 text-orange-400 animate-pulse" />
                  </div>
                  <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4">
                      Thermal Regulation
                  </h2>
                  <p className="text-sm text-white/70 leading-relaxed font-light mb-6">
                      An integrated cryo-coolant shroud utilizing liquid nitrogen manifolds protects the core framework. This limits thermal displacement and keeps core expansion boundaries perfectly nominal during high-energy plasma generation.
                  </p>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-white/40 border-t border-white/10 pt-4 text-right">
                 <div><span className="block text-orange-400 font-bold mb-1">TEMP</span><span className="text-white/80">-180 °C</span></div>
                 <div><span className="block text-orange-400 font-bold mb-1">FLOW RATE</span><span className="text-white/80">450 L/M</span></div>
                 <div><span className="block text-orange-400 font-bold mb-1">SHIELD</span><span className="text-green-400">ACTIVE</span></div>
              </div>
          </div>
      </motion.div>

      {/* 3. Magnetic Containment Stage (43% - 54%) */}
      <motion.div 
          style={{ opacity: opacityStage3, y: yStage3 }}
          className="fixed inset-0 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center px-6 md:px-24 py-16 pointer-events-none"
      >
          {/* Left card: Main Info */}
          <div className="lg:col-span-5 backdrop-blur-xl bg-black/40 p-8 rounded-2xl border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.15)] flex flex-col justify-between h-[480px]">
              <div>
                  <div className="flex items-center gap-3 mb-4">
                      <Radio className="w-5 h-5 text-purple-400 animate-pulse" />
                      <span className="text-[10px] font-mono text-purple-400 tracking-widest">STAGE 03 // MAGNETIC MATRIX</span>
                  </div>
                  <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4">
                      Magnetic Containment
                  </h2>
                  <p className="text-sm text-white/70 leading-relaxed font-light mb-6">
                      Coordinated toroidal magnetic field coils suspend the plasma away from the structural walls. High-voltage magnetic containment rings generate 14.5 Tesla fields to hold the superheated plasma inside a zero-touch vacuum chamber.
                  </p>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-white/40 border-t border-white/10 pt-4">
                 <div><span className="block text-purple-400 font-bold mb-1">MAGNETICS</span><span className="text-white/80">14.5 TESLA</span></div>
                 <div><span className="block text-purple-400 font-bold mb-1">FREQUENCY</span><span className="text-white/80">400 HZ</span></div>
                 <div><span className="block text-purple-400 font-bold mb-1">COILS</span><span className="text-green-400">NOMINAL</span></div>
              </div>
          </div>
          
          {/* Empty Space for the 3D Canvas in center */}
          <div className="lg:col-span-2" />

          {/* Right card: Diagnostic terminal with Oscillating wave */}
          <div className="lg:col-span-5 backdrop-blur-xl bg-black/40 p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-[480px]">
              <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                      <span className="text-xs font-mono text-white/40 flex items-center gap-2">
                          <TerminalIcon className="w-3.5 h-3.5 text-purple-400" />
                          SYS_LOG // TOROIDAL_COILS
                      </span>
                      <span className="text-[9px] font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded">STABILIZED</span>
                  </div>
                  <div className="space-y-2 font-mono text-[11px] text-purple-300/80 max-h-[220px] overflow-y-auto pr-2">
                      {logsStage3.map((log, i) => (
                          <div key={i} className="flex gap-2 items-start">
                              <span className="text-purple-500/40 select-none">[{32 + i}:00]</span>
                              <span>{log}</span>
                          </div>
                      ))}
                  </div>
              </div>
              
              {/* Dynamic Waveform Graph */}
              <div className="mt-4 border-t border-white/10 pt-4">
                  <span className="text-[9px] font-mono text-white/40 block mb-2 uppercase tracking-wider">MAGNETIC FIELD OSCILLATION</span>
                  <div className="h-14 border border-white/5 bg-black/20 rounded flex items-center justify-center overflow-hidden">
                      <svg className="w-full h-10 text-purple-500" viewBox="0 0 200 40">
                          <motion.path
                              d="M0 20 Q25 5 50 20 T100 20 T150 20 T200 20"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              animate={{ d: [
                                  "M0 20 Q25 5 50 20 T100 20 T150 20 T200 20",
                                  "M0 20 Q25 35 50 20 T100 20 T150 20 T200 20",
                                  "M0 20 Q25 5 50 20 T100 20 T150 20 T200 20"
                              ]}}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                          />
                      </svg>
                  </div>
              </div>
          </div>
      </motion.div>

      {/* 4. Fusion Injection Stage (57% - 68%) */}
      <motion.div 
          style={{ opacity: opacityStage4, y: yStage4 }}
          className="fixed inset-0 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center px-6 md:px-24 py-16 pointer-events-none"
      >
          {/* Left card: Diagnostic terminal */}
          <div className="lg:col-span-5 backdrop-blur-xl bg-black/40 p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-[480px]">
              <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                      <span className="text-xs font-mono text-white/40 flex items-center gap-2">
                          <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
                          SYS_LOG // ISOTOPE_FEED
                      </span>
                      <span className="text-[9px] font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded">FEED_NOMINAL</span>
                  </div>
                  <div className="space-y-2 font-mono text-[11px] text-cyan-300/80 max-h-[220px] overflow-y-auto pr-2">
                      {logsStage4.map((log, i) => (
                          <div key={i} className="flex gap-2 items-start">
                              <span className="text-cyan-500/40 select-none">[{42 + i}:00]</span>
                              <span>{log}</span>
                          </div>
                      ))}
                  </div>
              </div>
              
              {/* Particle flow grid representation */}
              <div className="mt-4 border-t border-white/10 pt-4">
                  <span className="text-[9px] font-mono text-white/40 block mb-2 uppercase tracking-wider">COLLISION TRIGGER PULSE RATE</span>
                  <div className="flex gap-1 items-center justify-between font-mono text-xs text-white/60">
                      <span>0.0 Hz</span>
                      <div className="flex gap-1">
                          {[...Array(6)].map((_, i) => (
                              <motion.div 
                                  key={i} 
                                  className="w-3 h-3 bg-cyan-500/30 rounded"
                                  animate={{ backgroundColor: ["rgba(6,182,212,0.1)", "rgba(6,182,212,0.8)", "rgba(6,182,212,0.1)"] }}
                                  transition={{ duration: 1, delay: i * 0.15, repeat: Infinity }}
                              />
                          ))}
                      </div>
                      <span className="text-cyan-400 font-bold">120.0 Hz</span>
                  </div>
              </div>
          </div>

          {/* Empty Space for the 3D Canvas in center */}
          <div className="lg:col-span-2" />

          {/* Right card: Main Info */}
          <div className="lg:col-span-5 backdrop-blur-xl bg-black/40 p-8 rounded-2xl border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col justify-between h-[480px] text-right">
              <div>
                  <div className="flex items-center gap-3 mb-4 justify-end">
                      <span className="text-[10px] font-mono text-cyan-400 tracking-widest">STAGE 04 // FUSION FEED</span>
                      <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
                  </div>
                  <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4">
                      Fusion Injection
                  </h2>
                  <p className="text-sm text-white/70 leading-relaxed font-light mb-6">
                      Deuterium fuel isotopes are ionized and accelerated into the containment matrix. Collision pathways collide deuterons against the palladium core grid, establishing the self-sustaining fusion chain reaction loop.
                  </p>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-white/40 border-t border-white/10 pt-4 text-right">
                 <div><span className="block text-cyan-400 font-bold mb-1">FEED RATE</span><span className="text-white/80">800 mg/s</span></div>
                 <div><span className="block text-cyan-400 font-bold mb-1">ACCELERATION</span><span className="text-white/80">45 kV</span></div>
                 <div><span className="block text-cyan-400 font-bold mb-1">IONIZATION</span><span className="text-white/80">99.82 %</span></div>
              </div>
          </div>
      </motion.div>

      {/* 5. Output Regulation Stage (71% - 82%) */}
      <motion.div 
          style={{ opacity: opacityStage5, y: yStage5 }}
          className="fixed inset-0 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center px-6 md:px-24 py-16 pointer-events-none"
      >
          {/* Left card: Main Info */}
          <div className="lg:col-span-5 backdrop-blur-xl bg-black/40 p-8 rounded-2xl border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.15)] flex flex-col justify-between h-[480px]">
              <div>
                  <div className="flex items-center gap-3 mb-4">
                      <Zap className="w-5 h-5 text-green-400 animate-pulse" />
                      <span className="text-[10px] font-mono text-green-400 tracking-widest">STAGE 05 // OUTPUT REGULATION</span>
                  </div>
                  <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4">
                      Output Regulation
                  </h2>
                  <p className="text-sm text-white/70 leading-relaxed font-light mb-6">
                      An integrated magnetohydrodynamic (MHD) power harvester captures fusion heat and charges directly, translating kinetic plasma energy into steady-state grid power with zero thermal converter loss.
                  </p>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-white/40 border-t border-white/10 pt-4">
                 <div><span className="block text-green-400 font-bold mb-1">BUS VOLTS</span><span className="text-white/80">850 kV</span></div>
                 <div><span className="block text-green-400 font-bold mb-1">BUS AMPS</span><span className="text-white/80">400 kA</span></div>
                 <div><span className="block text-green-400 font-bold mb-1">CONVERSION</span><span className="text-white/80">99.95 %</span></div>
              </div>
          </div>
          
          {/* Empty Space for the 3D Canvas in center */}
          <div className="lg:col-span-2" />

          {/* Right card: Diagnostic terminal with live load bars */}
          <div className="lg:col-span-5 backdrop-blur-xl bg-black/40 p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-[480px]">
              <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                      <span className="text-xs font-mono text-white/40 flex items-center gap-2">
                          <TerminalIcon className="w-3.5 h-3.5 text-green-400" />
                          SYS_LOG // MHD_CONVERTER
                      </span>
                      <span className="text-[9px] font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded">HARVESTING</span>
                  </div>
                  <div className="space-y-2 font-mono text-[11px] text-green-300/80 max-h-[220px] overflow-y-auto pr-2">
                      {logsStage5.map((log, i) => (
                          <div key={i} className="flex gap-2 items-start">
                              <span className="text-green-500/40 select-none">[{52 + i}:00]</span>
                              <span>{log}</span>
                          </div>
                      ))}
                  </div>
              </div>
              
              {/* Dynamic load bars */}
              <div className="mt-4 border-t border-white/10 pt-4">
                  <span className="text-[9px] font-mono text-white/40 block mb-2 uppercase tracking-wider">HARVESTED ENERGY SYNCHRONIZATION</span>
                  <div className="flex items-end justify-between h-14 gap-1 border-b border-white/10 pb-1">
                      {[40, 55, 75, 60, 85, 95, 90, 97, 100].map((val, idx) => (
                          <motion.div
                              key={idx}
                              className="bg-green-500 w-full rounded-t"
                              initial={{ height: 0 }}
                              animate={{ height: `${val}%` }}
                              transition={{ duration: 1.2, delay: idx * 0.08, repeat: Infinity, repeatType: "reverse" }}
                          />
                      ))}
                  </div>
              </div>
          </div>
      </motion.div>

      {/* 6. Safety & CTA (Centered 85% - 100%) */}
      <motion.div 
          style={{ opacity: opacityCTA, y: yCTA }}
          className="fixed inset-0 flex items-center justify-center pointer-events-none p-4 z-30"
      >
          <div className="w-[850px] max-w-full text-center backdrop-blur-xl bg-black/80 p-8 md:p-12 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto">
              <div className="flex flex-col sm:flex-row justify-between items-center border-b border-white/10 pb-6 mb-8 gap-4">
                  <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-400 animate-pulse"/>
                      REACTOR STATUS
                  </h2>
                  <span className="font-mono text-xs text-green-400 bg-green-500/10 px-4 py-1.5 rounded-full border border-green-500/30 tracking-widest uppercase">ALL SYSTEMS ONLINE // NOMINAL</span>
              </div>

              {/* Advanced Dashboard Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-left font-mono">
                  <div className="bg-white/5 p-5 rounded-xl border border-white/5">
                      <span className="text-[9px] text-white/40 tracking-widest block mb-2">POWER DISTRIBUTION</span>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-3">
                          <div className="h-full bg-blue-500 w-[94%]" />
                      </div>
                      <span className="text-xl font-bold text-white">94.82%</span>
                  </div>
                  <div className="bg-white/5 p-5 rounded-xl border border-white/5">
                      <span className="text-[9px] text-white/40 tracking-widest block mb-2">GRID SYNCHRONIZATION</span>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-3">
                          <div className="h-full bg-purple-500 w-[99.9%]" />
                      </div>
                      <span className="text-xl font-bold text-white">99.98%</span>
                  </div>
                  <div className="bg-white/5 p-5 rounded-xl border border-white/5">
                      <span className="text-[9px] text-white/40 tracking-widest block mb-2">CORE CORE UPTIME</span>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-3">
                          <div className="h-full bg-green-500 w-[100%]" />
                      </div>
                      <span className="text-xl font-bold text-white">100.00%</span>
                  </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                  <Link href="/login" className="px-8 py-4 bg-white hover:bg-white/90 text-black font-extrabold rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2 group">
                      ACCESS MAIN CONSOLE
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="/preorder" className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-extrabold rounded-full transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                      ORDER CORE UNIT
                  </Link>
              </div>
          </div>
      </motion.div>

    </div>
  );
}
