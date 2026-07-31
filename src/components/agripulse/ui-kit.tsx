import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ============ HOOKS ============
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/** Session-scoped prefill queue (voice assistant → crop grading form). */
export function readPrefill(): Record<string, string> | null {
  try {
    const raw = sessionStorage.getItem("agripulse-prefill");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writePrefill(data: Record<string, string>) {
  try {
    sessionStorage.setItem("agripulse-prefill", JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function clearPrefill() {
  try {
    sessionStorage.removeItem("agripulse-prefill");
  } catch {
    /* ignore */
  }
}

// ============ SIMULATED QR ============
export function SimulatedQR({ seed, size = 128, className }: { seed: string; size?: number; className?: string }) {
  const n = 21;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const cells: boolean[] = [];
  for (let i = 0; i < n * n; i++) {
    h = (Math.imul(h, 1103515245) + 12345) >>> 0;
    cells.push(((h >> 16) & 1023) % 100 < 46);
  }
  const finder = (cx: number, cy: number) => {
    const rects: { x: number; y: number; s: number; c: string }[] = [];
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const border = r === 0 || r === 6 || c === 0 || c === 6;
        const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        rects.push({ x: cx + c, y: cy + r, s: 1, c: border || core ? "#059669" : "#ffffff" });
      }
    }
    return rects;
  };
  const rects = [...finder(0, 0), ...finder(n - 7, 0), ...finder(0, n - 7)];
  return (
    <svg viewBox={`0 0 ${n} ${n}`} width={size} height={size} className={className} role="img" aria-label="QR code simulation">
      <rect width={n} height={n} fill="#ffffff" />
      {cells.map((on, i) => {
        const x = i % n;
        const y = Math.floor(i / n);
        const inFinder = (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);
        if (inFinder) return null;
        return on ? <rect key={i} x={x} y={y} width={1} height={1} fill="#0b3b2c" /> : null;
      })}
      {rects.map((r, i) => (
        <rect key={`f${i}`} x={r.x} y={r.y} width={r.s} height={r.s} fill={r.c} />
      ))}
    </svg>
  );
}

// ============ SPARKLINE ============
export function Sparkline({ values, color = "#10B981", width = 120, height = 36 }: { values: number[]; color?: string; width?: number; height?: number }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * (width - 4) + 2;
      const y = height - 3 - ((v - min) / range) * (height - 6);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {values.map((_, i) => {
        const [x, y] = pts.split(" ")[i].split(",").map(Number);
        return <circle key={i} cx={x} cy={y} r={2} fill={color} />;
      })}
    </svg>
  );
}

// ============ SCORE RING ============
export function ScoreRing({ value, size = 104, stroke = 9, color = "#10B981", label }: { value: number; size?: number; stroke?: number; color?: string; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 1200;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setProgress(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }} role="img" aria-label={`${label || "Score"}: ${value}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * progress) / 100}
          style={{ transition: "stroke-dashoffset 60ms linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white" style={{ fontVariantNumeric: "tabular-nums" }}>
          {Math.round(progress)}
          <span className="text-xs text-gray-500">%</span>
        </span>
        {label && <span className="text-[8px] text-gray-500 uppercase tracking-wider">{label}</span>}
      </div>
    </div>
  );
}

// ============ ANIMATED COUNTER ============
export function CountUp({ value, prefix = "", suffix = "", duration = 1100, className }: { value: number | string; prefix?: string; suffix?: string; duration?: number; className?: string }) {
  const num = typeof value === "number" ? value : parseFloat(value);
  const display = typeof value === "string" ? value : undefined;
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (display !== undefined) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setV(num * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [num, duration, display]);
  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {prefix}
      {display !== undefined ? display : Math.round(v * 100) / 100}
      {suffix}
    </span>
  );
}

// ============ DATA SOURCE BADGES ============
export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-300">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
      </span>
      LIVE
    </span>
  );
}

export function SimulatedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gray-500/30 bg-gray-500/10 px-2 py-0.5 text-[9px] font-medium text-gray-400">
      Simulated
    </span>
  );
}

// ============ SKELETON ============
export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("skeleton-shimmer", className)} aria-hidden="true" />;
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="glass-card p-5 space-y-3">
      <SkeletonBlock className="h-4 w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock key={i} className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}

// ============ EMPTY STATE ============
export function EmptyState({ icon, title, sub, cta, onCta }: { icon: ReactNode; title: string; sub?: string; cta?: string; onCta?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-500/15 bg-[rgba(22,28,46,0.25)] px-6 py-14 text-center"
    >
      <div className="mb-4 text-emerald-500/25">{icon}</div>
      <p className="text-sm font-medium text-gray-300">{title}</p>
      {sub && <p className="mt-1 text-xs text-gray-500 max-w-xs">{sub}</p>}
      {cta && onCta && (
        <button
          onClick={onCta}
          className="mt-5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-300 transition-all hover:bg-emerald-500/20"
        >
          {cta}
        </button>
      )}
    </motion.div>
  );
}

// ============ SECTION HEADER ============
export function SectionHeader({ icon, title, sub, accent = "text-emerald-400", bg = "bg-emerald-500/15" }: { icon: ReactNode; title: string; sub?: string; accent?: string; bg?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", bg)}>{icon}</div>
      <div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}
