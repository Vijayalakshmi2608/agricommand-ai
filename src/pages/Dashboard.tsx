import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, Tractor, ShoppingCart } from "lucide-react";
import Navbar from "@/components/agripulse/Navbar";
import OpenRouterConfig from "@/components/agripulse/OpenRouterConfig";
import FarmerOps from "@/components/agripulse/FarmerOps";
import Marketplace from "@/components/agripulse/Marketplace";
import { AppMode } from "@/components/agripulse/types";

export default function Dashboard() {
  const [mode, setMode] = useState<AppMode>("farmer");
  const [apiConfigOpen, setApiConfigOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleModeChange = useCallback((newMode: AppMode) => {
    setMode(newMode);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground bg-grid">
      {/* Navbar */}
      <Navbar
        mode={mode}
        onModeChange={handleModeChange}
        onOpenApiConfig={() => setApiConfigOpen(true)}
      />

      {/* API Config Modal */}
      <OpenRouterConfig
        open={apiConfigOpen}
        onClose={() => setApiConfigOpen(false)}
      />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        {/* Mode Header */}
        <div className="mb-6">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
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
                {mode === "farmer" ? "Farmer Operations" : "Consumer Marketplace"}
              </h2>
              <p className="text-[11px] text-gray-400">
                {mode === "farmer"
                  ? "AI-powered crop management, grading, and logistics command center"
                  : "Verified sustainable produce marketplace with full chain transparency"
                }
              </p>
            </div>
            <div className="ml-auto hidden sm:flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Sprout className="h-3 w-3 text-emerald-400" />
              </div>
              <span className="text-[10px] text-emerald-400/70 font-medium">Kharif Season 2026 • Active</span>
            </div>
          </motion.div>
        </div>

        {/* Feature Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {mode === "farmer" ? <FarmerOps /> : <Marketplace />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-500/10 bg-[rgba(15,17,23,0.5)] backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[10px] text-gray-500">
              AgriPulse AI v1.0 • Autonomous Agtech Command Center
            </span>
          </div>
          <div className="flex items-center gap-4">
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
