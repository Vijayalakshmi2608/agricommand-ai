import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Rocket, Sprout, AlertTriangle, Handshake, Shield, Mic, TrendingUp } from "lucide-react";
import { useI18n } from "./i18n";
import { AppMode } from "./types";

export interface DemoSlide {
  id: string;
  icon: React.ReactNode;
  titleKey: string;
  subKey: string;
  bullets: string[];
  feature?: { mode: AppMode; tab: string } | null;
}

const SLIDES: DemoSlide[] = [
  {
    id: "title",
    icon: <Sprout className="h-10 w-10 text-emerald-400" />,
    titleKey: "demo.t1",
    subKey: "demo.sub1",
    bullets: [
      "AI crop grading • glut detection • barter • carbon passports",
      "Zero backend — works fully offline with simulated AI",
      "Multilingual: English, हिन्दी, தமிழ், मराठी",
    ],
    feature: null,
  },
  {
    id: "problem",
    icon: <AlertTriangle className="h-10 w-10 text-red-400" />,
    titleKey: "demo.t2",
    subKey: "demo.sub2",
    bullets: [
      "₹92,000 crore lost annually to post-harvest waste",
      "Farmers sell at 60-70% below fair market value",
      "12% of Indian farmers access real price data",
    ],
    feature: null,
  },
  {
    id: "grading",
    icon: <Rocket className="h-10 w-10 text-emerald-400" />,
    titleKey: "demo.t3",
    subKey: "demo.sub3",
    bullets: [
      "Upload or capture crop photos — vision AI grades instantly",
      "Shelf-life countdown + fair price + storage conditions",
      "Printable PDF certificate with QR verification",
    ],
    feature: { mode: "farmer", tab: "grading" },
  },
  {
    id: "glut",
    icon: <TrendingUp className="h-10 w-10 text-amber-400" />,
    titleKey: "demo.t4",
    subKey: "demo.sub4",
    bullets: [
      "India choropleth map flags oversupply in real time",
      "Smart rerouter finds deficit markets 589% more profitable",
      "Book routes with full cost breakdown in one tap",
    ],
    feature: { mode: "farmer", tab: "glut" },
  },
  {
    id: "barter",
    icon: <Handshake className="h-10 w-10 text-purple-400" />,
    titleKey: "demo.t5",
    subKey: "demo.sub5",
    bullets: [
      "Trade tractors, labor, compost — zero cash needed",
      "Live crop-credit exchange rate calculator",
      "Every trade settles via smart-contract escrow",
    ],
    feature: { mode: "farmer", tab: "barter" },
  },
  {
    id: "carbon",
    icon: <Shield className="h-10 w-10 text-emerald-400" />,
    titleKey: "demo.t6",
    subKey: "demo.sub6",
    bullets: [
      "Soil score 92/100 • 100% solar cold chain • 0.8 kg CO₂e/kg",
      "Consumers scan QR to verify full lifecycle journey",
      "Carbon credits earned per verified batch",
    ],
    feature: { mode: "farmer", tab: "carbon" },
  },
  {
    id: "impact",
    icon: <TrendingUp className="h-10 w-10 text-emerald-400" />,
    titleKey: "demo.t7",
    subKey: "demo.sub7",
    bullets: [
      "Tomato price: ₹8/kg → ₹28/kg (+250%)",
      "Post-harvest loss: 34% → 24.5% (-28%)",
      "4.7/5 farmer satisfaction across 47 farms",
    ],
    feature: { mode: "farmer", tab: "analytics" },
  },
  {
    id: "sdg",
    icon: <Mic className="h-10 w-10 text-blue-400" />,
    titleKey: "demo.t8",
    subKey: "demo.sub8",
    bullets: [
      "SDG 2 • 8 • 12 • 13 • 17 — measurable impact per goal",
      "Offline-first + multilingual = built for technology transfer",
      "Ready for MIT Solve, FAO, CGIAR, World Food Prize",
    ],
    feature: null,
  },
];

const SLIDE_MS = 20000;

export default function DemoMode({ onClose, onTryFeature }: { onClose: () => void; onTryFeature: (mode: AppMode, tab: string) => void }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Auto-advance
  useEffect(() => {
    setProgress(0);
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / SLIDE_MS);
      setProgress(p);
      if (p >= 1) {
        setIndex((i) => (i + 1) % SLIDES.length);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [index]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % SLIDES.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const slide = SLIDES[index];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-2">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] text-gray-400">
          {index + 1} / {SLIDES.length}
        </span>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:bg-red-500/15 hover:text-red-300 transition-all"
          aria-label={t("demo.close")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-2xl text-center"
        >
          <div className="mb-6 flex justify-center">{slide.icon}</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{t(slide.titleKey)}</h2>
          <p className="mt-3 text-sm text-emerald-300/90 font-medium">{t(slide.subKey)}</p>
          <ul className="mt-6 space-y-2.5">
            {slide.bullets.map((b, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.12 }}
                className="flex items-center justify-center gap-2 text-[13px] text-gray-300"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {b}
              </motion.li>
            ))}
          </ul>

          {slide.feature && (
            <button
              onClick={() => onTryFeature(slide.feature!.mode, slide.feature!.tab)}
              className="mt-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-emerald-500 transition-all"
            >
              🚀 {t("demo.try")}
            </button>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Nav arrows */}
      <button
        onClick={() => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 hover:text-emerald-300 transition-all"
        aria-label={t("demo.prev")}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => setIndex((i) => (i + 1) % SLIDES.length)}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 hover:text-emerald-300 transition-all"
        aria-label={t("demo.next")}
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <p className="absolute bottom-4 text-[9px] text-gray-600">Auto-advancing every 20s • ← → to navigate • Esc to exit</p>
    </div>
  );
}
