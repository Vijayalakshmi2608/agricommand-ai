import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  AlertTriangle, Map, Navigation, Truck, Fuel, BadgeCheck, Timer,
  ArrowRight, IndianRupee, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOCK_STATE_GLUT, MOCK_REROUTES } from "./data";
import { StateGlut } from "./types";
import { useI18n } from "./i18n";
import IndiaMap, { LEVEL_LABELS } from "./IndiaMap";
import { SkeletonBlock } from "./ui-kit";

export default function GlutDetector() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<StateGlut | null>(null);
  const [activeAlert, setActiveAlert] = useState<StateGlut | null>(MOCK_STATE_GLUT[0]);

  const refresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 900);
  };

  const selectState = (stateName: string) => {
    const found = MOCK_STATE_GLUT.find((s) => s.state === stateName);
    setSelected(found || null);
    if (found) setActiveAlert(found);
  };

  const bookRoute = () => {
    toast.success(t("glut.booked"), { description: activeAlert?.crop && `${activeAlert.crop} → ${MOCK_REROUTES[activeAlert.state]?.destination}` });
  };

  const levelStyle: Record<string, string> = {
    critical: "border-red-500/30 bg-red-500/5 pulse-alert",
    high: "border-amber-500/25 bg-amber-500/5",
    normal: "border-emerald-500/15 bg-[rgba(22,28,46,0.4)]",
    deficit: "border-blue-500/25 bg-blue-500/5",
  };

  const levelBadge: Record<string, string> = {
    critical: "text-red-400 bg-red-500/10 border-red-500/20",
    high: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    normal: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    deficit: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">{t("glut.title")}</h2>
            <p className="text-[11px] text-gray-400">{t("glut.sub")}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={refresh} className="rounded-lg text-gray-400 hover:text-emerald-300 text-xs gap-1.5">
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          {t("glut.refresh")}
        </Button>
      </div>

      {/* ===== MAP ===== */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Map className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[10px] font-medium text-gray-400 uppercase">{t("glut.map")}</span>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          {loading ? (
            <SkeletonBlock className="h-[420px] w-full" />
          ) : (
            <IndiaMap data={MOCK_STATE_GLUT} selected={selected?.state} onSelect={selectState} />
          )}
          {/* Legend */}
          <div className="space-y-3">
            <p className="text-[9px] text-gray-500 uppercase tracking-wider">{t("glut.legend")}</p>
            {(Object.keys(LEVEL_LABELS) as (keyof typeof LEVEL_LABELS)[]).map((level) => (
              <div key={level} className="flex items-center gap-2.5">
                <span className="h-3.5 w-3.5 rounded" style={{ background: LEVEL_LABELS[level].color, opacity: 0.7 }} />
                <span className="text-[11px] text-gray-300">{t(LEVEL_LABELS[level].labelKey)}</span>
              </div>
            ))}
            <div className="mt-4 rounded-xl border border-emerald-500/10 bg-[rgba(12,15,25,0.5)] p-3">
              <p className="text-[10px] text-gray-400 leading-relaxed">
                💡 {activeAlert ? `${activeAlert.state} — ${activeAlert.crop}` : "Click a state"} • {t("glut.surplusPct")} {activeAlert?.surplusPct}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== ALERT CARDS ===== */}
      <div>
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">{t("glut.alerts")}</p>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <SkeletonBlock key={i} className="h-24 w-full" />)}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {MOCK_STATE_GLUT.filter((s) => s.level === "critical" || s.level === "high").map((alert) => (
              <motion.button
                key={alert.state}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => { setActiveAlert(alert); setSelected(alert); }}
                className={`rounded-xl border p-4 text-left transition-all duration-300 ${levelStyle[alert.level]} ${
                  activeAlert?.state === alert.state ? "ring-1 ring-emerald-400/30" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className={`mt-0.5 rounded-full px-2 py-0.5 text-[9px] font-semibold border ${levelBadge[alert.level]}`}>
                      {alert.level.toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white">⚠ {t("glut.crash")} — {alert.state} {alert.crop}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        <span className="text-red-300">{alert.surplusPct}%</span> {t("glut.surplusPct")}
                      </p>
                    </div>
                  </div>
                  <Timer className="h-4 w-4 text-gray-500 flex-shrink-0" />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <p className="text-gray-500">{t("glut.priceDrop")}</p>
                    <p className="text-red-300 font-semibold">{alert.priceNow} <span className="text-gray-600 line-through">{alert.priceWas}</span></p>
                  </div>
                  <div>
                    <p className="text-gray-500">{t("glut.timeLeft")}</p>
                    <p className="text-amber-300 font-semibold">{alert.timeLeftHrs}h</p>
                  </div>
                  <div>
                    <p className="text-gray-500">{t("glut.origin")}</p>
                    <p className="text-gray-300 font-semibold">{MOCK_REROUTES[alert.state]?.destination.split(",")[0]}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* ===== SMART REROUTER ===== */}
      <AnimatePresence mode="wait">
        {activeAlert && MOCK_REROUTES[activeAlert.state] && (
          <motion.div
            key={activeAlert.state}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass-card p-5 border-emerald-500/20"
          >
            <div className="flex items-center gap-2 mb-4">
              <Navigation className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300">{t("glut.rerouter")}</span>
              <span className="ml-auto text-[9px] text-gray-500">{activeAlert.state} • {activeAlert.crop}</span>
            </div>

            {/* Origin → Destination */}
            <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-3 items-center mb-4">
              <div className="rounded-xl bg-[rgba(12,15,25,0.5)] p-3">
                <p className="text-[9px] text-gray-500 uppercase">{t("glut.origin")}</p>
                <p className="text-xs font-semibold text-white mt-0.5">{MOCK_REROUTES[activeAlert.state].origin}</p>
                <p className="text-[9px] text-red-300 mt-0.5">{t("glut.surplusVol")}: {MOCK_REROUTES[activeAlert.state].originSurplus}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-emerald-400 hidden sm:block" />
              <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/15 p-3">
                <p className="text-[9px] text-gray-500 uppercase">{t("glut.destination")}</p>
                <p className="text-xs font-semibold text-emerald-300 mt-0.5">{MOCK_REROUTES[activeAlert.state].destination}</p>
                <p className="text-[9px] text-blue-300 mt-0.5">{t("glut.deficitDemand")}: {MOCK_REROUTES[activeAlert.state].destDeficit}</p>
              </div>
            </div>

            {/* Route details */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-lg bg-[rgba(12,15,25,0.5)] p-2.5 text-center">
                <p className="text-[9px] text-gray-500">{t("glut.distance")}</p>
                <p className="text-xs font-semibold text-white">{MOCK_REROUTES[activeAlert.state].distance}</p>
              </div>
              <div className="rounded-lg bg-[rgba(12,15,25,0.5)] p-2.5 text-center">
                <p className="text-[9px] text-gray-500">{t("glut.transit")}</p>
                <p className="text-xs font-semibold text-white">{MOCK_REROUTES[activeAlert.state].transit}</p>
              </div>
              <div className="rounded-lg bg-[rgba(12,15,25,0.5)] p-2.5 text-center">
                <p className="text-[9px] text-gray-500">{t("glut.capacity")}</p>
                <p className="text-xs font-semibold text-white">{MOCK_REROUTES[activeAlert.state].capacity}</p>
              </div>
            </div>

            {/* Cost breakdown */}
            <div className="rounded-xl bg-amber-500/5 border border-amber-500/15 p-3 mb-4">
              <p className="text-[9px] text-gray-500 uppercase mb-2 flex items-center gap-1.5">
                <Fuel className="h-3 w-3 text-amber-400" /> {t("glut.costBreakdown")}
              </p>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div className="flex items-center justify-between rounded-lg bg-[rgba(12,15,25,0.5)] px-2.5 py-2">
                  <span className="text-gray-500">{t("glut.fuel")}</span>
                  <span className="font-semibold text-white">₹ {MOCK_REROUTES[activeAlert.state].costFuel.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-[rgba(12,15,25,0.5)] px-2.5 py-2">
                  <span className="text-gray-500">{t("glut.toll")}</span>
                  <span className="font-semibold text-white">₹ {MOCK_REROUTES[activeAlert.state].costToll.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-[rgba(12,15,25,0.5)] px-2.5 py-2">
                  <span className="text-gray-500">{t("glut.loading")}</span>
                  <span className="font-semibold text-white">₹ {MOCK_REROUTES[activeAlert.state].costLoading.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Net profit */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20 p-3.5">
              <div className="flex-1">
                <p className="text-[9px] text-gray-500 uppercase flex items-center gap-1">
                  <BadgeCheck className="h-3 w-3 text-emerald-400" /> {t("glut.netProfit")}
                </p>
                <p className="text-xl font-bold text-emerald-300">
                  <IndianRupee className="h-4 w-4 inline" /> {MOCK_REROUTES[activeAlert.state].netProfit.toLocaleString("en-IN")}
                </p>
                <p className="text-[9px] text-gray-500">
                  {t("glut.vsLocal")}: ₹ {MOCK_REROUTES[activeAlert.state].localSale.toLocaleString("en-IN")} (+{Math.round((MOCK_REROUTES[activeAlert.state].netProfit / MOCK_REROUTES[activeAlert.state].localSale) * 100)}%)
                </p>
              </div>
              <Button onClick={bookRoute} className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs px-5 py-3 gap-2 shadow-lg shadow-emerald-500/20">
                <Truck className="h-3.5 w-3.5" />
                {t("glut.bookRoute")}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
