import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import {
  Key, Tractor, ShoppingCart, Activity, Sprout, Globe, PlayCircle,
  BarChart3, ChevronDown, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppMode } from "./types";
import { useI18n, LANGS, LANG_NAMES, Lang } from "./i18n";

interface NavbarProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onOpenApiConfig: () => void;
  onOpenDemo: () => void;
}

export default function Navbar({ mode, onModeChange, onOpenApiConfig, onOpenDemo }: NavbarProps) {
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const [langOpen, setLangOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const isFarmer = mode === "farmer";

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, []);

  const selectLang = (l: Lang) => {
    setLang(l);
    setLangOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-emerald-500/10 bg-[rgba(15,17,23,0.85)] backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 gap-2">
        {/* Left: Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20">
            <Sprout className="h-5 w-5 text-emerald-400" />
            <div className="absolute -right-1 -top-1 h-2.5 w-2.5">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />
              <span className="absolute inset-0 rounded-full bg-emerald-400" />
            </div>
          </div>
          <div className="hidden sm:block min-w-0">
            <h1 className="text-sm font-bold tracking-tight text-white leading-tight">AgriPulse AI</h1>
            <p className="text-[9px] text-emerald-400/70 font-medium tracking-wider uppercase">{t("app.subtitle")}</p>
          </div>
          <div className="ml-1 flex items-center gap-1.5 rounded-full border border-emerald-500/15 bg-emerald-500/5 px-2 py-1 flex-shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[10px] font-medium text-emerald-400/80">{t("nav.live")}</span>
          </div>
        </div>

        {/* Center: Mode toggle (hidden on very small screens, shown in mobile nav) */}
        <div className="relative hidden md:flex items-center rounded-xl bg-[rgba(22,28,46,0.8)] border border-emerald-500/10 p-1">
          <button
            onClick={() => onModeChange("farmer")}
            className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all duration-300 ${
              isFarmer ? "bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 text-emerald-300 shadow-sm shadow-emerald-500/10" : "text-gray-400 hover:text-gray-300"
            }`}
          >
            <Tractor className="h-3.5 w-3.5" />
            {t("nav.farmer")}
          </button>
          <button
            onClick={() => onModeChange("consumer")}
            className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all duration-300 ${
              !isFarmer ? "bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-300 shadow-sm shadow-amber-500/10" : "text-gray-400 hover:text-gray-300"
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {t("nav.consumer")}
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Language selector */}
          <div className="relative" ref={langRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLangOpen(!langOpen)}
              className="rounded-lg border border-emerald-500/10 bg-[rgba(22,28,46,0.5)] text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-300 gap-1.5 text-xs px-2.5"
              aria-label={t("nav.language")}
            >
              <Globe className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">{LANG_NAMES[lang]}</span>
              <ChevronDown className="h-3 w-3 text-gray-500" />
            </Button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  className="absolute right-0 mt-2 w-40 rounded-xl border border-emerald-500/10 bg-[rgba(22,28,46,0.98)] backdrop-blur-2xl shadow-2xl shadow-emerald-500/5 p-1.5"
                >
                  {LANGS.map((l) => (
                    <button
                      key={l}
                      onClick={() => selectLang(l)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors ${
                        lang === l ? "bg-emerald-500/15 text-emerald-300" : "text-gray-300 hover:bg-emerald-500/5"
                      }`}
                    >
                      {LANG_NAMES[l]}
                      {lang === l && <Check className="h-3 w-3" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Impact link */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/impact")}
            className="hidden sm:flex rounded-lg border border-emerald-500/10 bg-[rgba(22,28,46,0.5)] text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-300 gap-1.5 text-xs px-2.5"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            {t("nav.impact")}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenDemo}
            className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 gap-1.5 text-xs px-2.5"
          >
            <PlayCircle className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{t("nav.demo")}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenApiConfig}
            className="hidden sm:flex rounded-lg border border-emerald-500/10 bg-[rgba(22,28,46,0.5)] text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-300 gap-1.5 text-xs px-2.5"
          >
            <Key className="h-3.5 w-3.5" />
            {t("nav.apiKey")}
          </Button>

          {/* Activity dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setActivityOpen(!activityOpen)}
              className="hidden sm:flex rounded-lg border border-emerald-500/10 bg-[rgba(22,28,46,0.5)] text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-300"
              aria-label="Activity"
            >
              <Activity className="h-4 w-4" />
            </Button>
            <AnimatePresence>
              {activityOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  className="absolute right-0 mt-2 w-64 rounded-xl border border-emerald-500/10 bg-[rgba(22,28,46,0.95)] backdrop-blur-2xl shadow-2xl shadow-emerald-500/5 p-4"
                >
                  <div className="text-xs font-medium text-gray-400 mb-3">Recent Activity</div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 rounded-lg bg-emerald-500/5 p-2.5">
                      <div className="h-2 w-2 mt-1 rounded-full bg-emerald-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-300">Crop grade submitted</p>
                        <p className="text-[10px] text-gray-500">Organic Tomatoes - 2 min ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg bg-amber-500/5 p-2.5">
                      <div className="h-2 w-2 mt-1 rounded-full bg-amber-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-300">Glut alert detected</p>
                        <p className="text-[10px] text-gray-500">Maharashtra zone - 15 min ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg bg-blue-500/5 p-2.5">
                      <div className="h-2 w-2 mt-1 rounded-full bg-blue-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-300">Escrow released</p>
                        <p className="text-[10px] text-gray-500">0x7f3a…c891 - 1h ago</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setActivityOpen(false)} className="mt-3 w-full rounded-lg border border-emerald-500/10 py-2 text-[10px] text-gray-400 hover:text-emerald-300 transition-colors">
                    View All Activity →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}
