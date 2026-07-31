import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, Tractor, ShoppingCart, CloudSun } from "lucide-react";
import Navbar from "@/components/agripulse/Navbar";
import OpenRouterConfig from "@/components/agripulse/OpenRouterConfig";
import FarmerOps, { FarmerTab, FARMER_TABS } from "@/components/agripulse/FarmerOps";
import Marketplace, { ConsumerTab } from "@/components/agripulse/Marketplace";
import WeatherWidget from "@/components/agripulse/WeatherWidget";
import SDGPanel from "@/components/agripulse/SDGPanel";
import DemoMode from "@/components/agripulse/DemoMode";
import OfflineManager from "@/components/agripulse/OfflineManager";
import { AppMode } from "@/components/agripulse/types";
import { useI18n } from "@/components/agripulse/i18n";
import { I18nProvider } from "@/components/agripulse/i18n";

function DashboardInner() {
  const { t } = useI18n();
  const [mode, setMode] = useState<AppMode>("farmer");
  const [farmerTab, setFarmerTab] = useState<FarmerTab>("grading");
  const [consumerTab, setConsumerTab] = useState<ConsumerTab>("market");
  const [apiConfigOpen, setApiConfigOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // "P" keyboard shortcut for demo mode
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "p" || e.key === "P") {
        if (!e.metaKey && !e.ctrlKey && !e.altKey) setDemoOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleModeChange = useCallback((newMode: AppMode) => {
    setMode(newMode);
  }, []);

  const tryFeature = (m: AppMode, tab: string) => {
    setDemoOpen(false);
    setMode(m);
    if (m === "farmer") setFarmerTab(tab as FarmerTab);
    else setConsumerTab(tab as ConsumerTab);
  };

  if (!mounted) return null;

  const tabs = mode === "farmer" ? FARMER_TABS : [
    { id: "market", icon: ShoppingCart, labelKey: "ctabs.market" },
    { id: "impact", icon: Sprout, labelKey: "ctabs.impact" },
  ];

  return (
    <div className={`min-h-screen bg-background text-foreground bg-dot-grid ${mode === "consumer" ? "consumer-mode" : ""}`}>
      <Navbar
        mode={mode}
        onModeChange={handleModeChange}
        onOpenApiConfig={() => setApiConfigOpen(true)}
        onOpenDemo={() => setDemoOpen(true)}
      />

      {/* Offline / sync banner */}
      <OfflineManager />

      <OpenRouterConfig open={apiConfigOpen} onClose={() => setApiConfigOpen(false)} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 pb-24 md:pb-10">
        {/* Mode Header */}
        <div className="mb-5">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 flex-wrap"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
              mode === "farmer"
                ? "bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20"
                : "bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20"
            }`}>
              {mode === "farmer"
                ? <Tractor className="h-5 w-5 text-emerald-400" />
                : <ShoppingCart className="h-5 w-5 text-amber-400" />
              }
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {mode === "farmer" ? t("nav.farmer") : t("nav.consumer")}
              </h2>
              <p className="text-[11px] text-gray-400">
                {mode === "farmer" ? t("mode.farmerSub") : t("mode.consumerSub")}
              </p>
            </div>
            <div className="ml-auto hidden sm:flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Sprout className="h-3 w-3 text-emerald-400" />
              </div>
              <span className="text-[10px] text-emerald-400/70 font-medium">{t("mode.season")}</span>
            </div>
          </motion.div>
        </div>

        {/* Weather dock (farmer mode) */}
        {mode === "farmer" && (
          <div className="mb-5">
            <WeatherWidget />
          </div>
        )}

        {/* Feature content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {mode === "farmer" ? (
              <FarmerOps tab={farmerTab} onTabChange={setFarmerTab} />
            ) : (
              <Marketplace tab={consumerTab} onTabChange={setConsumerTab} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile bottom tab navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-emerald-500/10 bg-[rgba(15,17,23,0.95)] backdrop-blur-2xl pb-safe">
        <div className="flex overflow-x-auto px-2 py-1.5 gap-0.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = mode === "farmer" ? farmerTab === tab.id : consumerTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => mode === "farmer" ? setFarmerTab(tab.id as FarmerTab) : setConsumerTab(tab.id as ConsumerTab)}
                className={`flex min-w-[72px] flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-[9px] font-medium transition-all ${
                  active ? "bg-emerald-500/15 text-emerald-300" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t(tab.labelKey)}
              </button>
            );
          })}
        </div>
      </nav>

      {/* SDG floating panel */}
      <SDGPanel />

      {/* Demo mode overlay */}
      <AnimatePresence>
        {demoOpen && <DemoMode onClose={() => setDemoOpen(false)} onTryFeature={tryFeature} />}
      </AnimatePresence>

      {/* Footer */}
      <footer className="hidden md:block border-t border-emerald-500/10 bg-[rgba(15,17,23,0.5)] backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[10px] text-gray-500">
              AgriPulse AI v2.0 • Autonomous Agtech Command Center
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[9px] text-gray-600">
              <CloudSun className="h-3 w-3" /> Weather: Open-Meteo (live) + Nominatim
            </span>
            <span className="text-[9px] text-gray-600">Powered by OpenRouter AI</span>
            <span className="flex items-center gap-1 text-[9px] text-gray-600">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              All systems nominal
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Dashboard() {
  return (
    <I18nProvider>
      <DashboardInner />
    </I18nProvider>
  );
}
