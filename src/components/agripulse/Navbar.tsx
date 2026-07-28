import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings2,
  Key,
  Tractor,
  ShoppingCart,
  Activity,
  ChevronDown,
  Sprout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppMode } from "./types";

interface NavbarProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onOpenApiConfig: () => void;
}

export default function Navbar({ mode, onModeChange, onOpenApiConfig }: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isFarmer = mode === "farmer";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-emerald-500/10 bg-[rgba(15,17,23,0.85)] backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20">
            <Sprout className="h-5 w-5 text-emerald-400" />
            <div className="absolute -right-1 -top-1 h-2.5 w-2.5">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />
              <span className="absolute inset-0 rounded-full bg-emerald-400" />
            </div>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold tracking-tight text-white">
              AgriPulse AI
            </h1>
            <p className="text-[10px] text-emerald-400/70 font-medium tracking-wider uppercase">
              Command Center
            </p>
          </div>
          <div className="ml-2 flex items-center gap-1.5 rounded-full border border-emerald-500/15 bg-emerald-500/5 px-2.5 py-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[10px] font-medium text-emerald-400/80">
              LIVE
            </span>
          </div>
        </div>

        {/* Center: Mode Toggle */}
        <div className="relative flex items-center rounded-xl bg-[rgba(22,28,46,0.8)] border border-emerald-500/10 p-1">
          <button
            onClick={() => onModeChange("farmer")}
            className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all duration-300 ${
              isFarmer
                ? "bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 text-emerald-300 shadow-sm shadow-emerald-500/10"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            <Tractor className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Farmer Operations</span>
            <span className="sm:hidden">Farmer</span>
          </button>
          <button
            onClick={() => onModeChange("consumer")}
            className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all duration-300 ${
              !isFarmer
                ? "bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 text-emerald-300 shadow-sm shadow-emerald-500/10"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Consumer Marketplace</span>
            <span className="sm:hidden">Market</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenApiConfig}
            className="rounded-lg border border-emerald-500/10 bg-[rgba(22,28,46,0.5)] text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-300 gap-2 text-xs"
          >
            <Key className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">API Key</span>
          </Button>

          {/* Activity dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="rounded-lg border border-emerald-500/10 bg-[rgba(22,28,46,0.5)] text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-300"
            >
              <Activity className="h-4 w-4" />
            </Button>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
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
                      <p className="text-[10px] text-gray-500">North-4 zone - 15 min ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg bg-blue-500/5 p-2.5">
                    <div className="h-2 w-2 mt-1 rounded-full bg-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-300">Barter trade completed</p>
                      <p className="text-[10px] text-gray-500">Tractor x Wheat Credits - 1h ago</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setDropdownOpen(false)}
                  className="mt-3 w-full rounded-lg border border-emerald-500/10 py-2 text-[10px] text-gray-400 hover:text-emerald-300 transition-colors"
                >
                  View All Activity →
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
