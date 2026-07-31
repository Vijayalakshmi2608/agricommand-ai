import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Shield, CheckCircle2, Sprout, Droplets, Leaf, Sun, Truck,
  Scan, Eye, FileDown, Waves, Footprints, Network,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_CARBON_PASSPORT } from "./data";
import { CarbonPassport as CarbonPassportType } from "./types";
import { useI18n } from "./i18n";
import { SimulatedQR, SimulatedBadge, LiveBadge } from "./ui-kit";
import ConsumerPassportModal from "./ConsumerPassport";

function MetricBar({ icon, label, value, display, sub, color = "from-emerald-600 to-emerald-400", max = 100 }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  display: string;
  sub?: string;
  color?: string;
  max?: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-[11px] text-gray-300">{label}</span>
        </div>
        <span className="text-xs font-semibold text-emerald-300">{display}</span>
      </div>
      <div className="h-2 rounded-full bg-[rgba(12,15,25,0.6)] overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} fill-animate`}
          style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        />
      </div>
      {sub && <p className="text-[9px] text-emerald-400/70">{sub}</p>}
    </div>
  );
}

const ROUTE_STEPS = [
  { icon: "🏡", labelKey: "Farm" },
  { icon: "🧊", labelKey: "Local Cold Store" },
  { icon: "🚛", labelKey: "Distribution Hub" },
  { icon: "🛒", labelKey: "End Consumer" },
];

export default function CarbonPassportModule() {
  const { t } = useI18n();
  const [passport] = useState<CarbonPassportType>(MOCK_CARBON_PASSPORT);
  const [showQR, setShowQR] = useState(false);
  const [preview, setPreview] = useState(false);

  const footprintPct = passport.carbonFootprint && passport.carbonBaseline
    ? Math.round((passport.carbonFootprint / passport.carbonBaseline) * 100)
    : 33;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15">
          <Shield className="h-4.5 w-4.5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">{t("carbon.title")}</h2>
          <p className="text-[11px] text-gray-400">{t("carbon.sub")}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        {/* Main passport card */}
        <div className="glass-card p-5 border-emerald-500/15">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[9px] text-gray-400 uppercase tracking-widest">{t("carbon.passportId")}</p>
              <p className="text-xs font-mono text-emerald-300">{passport.batchId}</p>
            </div>
            <div className="flex items-center gap-2">
              <LiveBadge />
              <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/20 text-[9px]">
                <CheckCircle2 className="h-3 w-3 mr-1" /> {t("carbon.verified")}
              </Badge>
            </div>
          </div>

          {/* Crop header */}
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-emerald-500/10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-2xl">🍅</div>
            <div>
              <p className="text-sm font-semibold text-white">{passport.cropType}</p>
              <p className="text-[10px] text-gray-400">{passport.farmer} • {passport.location}</p>
              <p className="text-[9px] text-gray-500">Harvested {passport.harvestDate}</p>
            </div>
          </div>

          {/* Metrics */}
          <div className="space-y-4">
            <MetricBar
              icon={<Sprout className="h-3.5 w-3.5 text-emerald-400" />}
              label={t("carbon.soil")}
              value={passport.soilScore}
              display={`${passport.soilScore}/100`}
              sub={`${t("carbon.noTill")} ✓ • ${t("carbon.coverCrop")} ✓ • ${t("carbon.organicMatter")}`}
            />
            <MetricBar
              icon={<Droplets className="h-3.5 w-3.5 text-blue-400" />}
              label={t("carbon.water")}
              value={passport.waterEfficiency || 78}
              display={`${passport.waterEfficiency || 78}/100`}
              sub={`${t("carbon.drip")} ✓ • ${t("carbon.rainwater")} ✓ • -62% vs flood baseline`}
            />
            <MetricBar
              icon={<Footprints className="h-3.5 w-3.5 text-amber-400" />}
              label={t("carbon.carbonFootprint")}
              value={100 - footprintPct + 33}
              display={`${passport.carbonFootprint || 0.8} ${t("carbon.perKg")}`}
              sub={`vs baseline ${passport.carbonBaseline || 2.4} → -${Math.round((1 - (passport.carbonFootprint || 0.8) / (passport.carbonBaseline || 2.4)) * 100)}% (soil sequestration • transport • cold storage)`}
              color="from-amber-600 to-amber-400"
            />
            <MetricBar
              icon={<Sun className="h-3.5 w-3.5 text-amber-400" />}
              label={t("carbon.solar")}
              value={passport.solarStoragePercent}
              display={`${passport.solarStoragePercent}%`}
              sub={t("carbon.solarPanels")}
            />
            <MetricBar
              icon={<Truck className="h-3.5 w-3.5 text-emerald-400" />}
              label={t("carbon.foodMiles")}
              value={passport.foodMilesSaved}
              display={`${passport.foodMilesSaved} mi`}
              sub={`${t("carbon.vsBaseline")} 680 mi → -50%`}
              max={680}
            />
            <MetricBar
              icon={<Network className="h-3.5 w-3.5 text-blue-400" />}
              label={t("carbon.biodiversity")}
              value={passport.biodiversityScore}
              display={`${passport.biodiversityScore}/100`}
              sub={`8 companion crops planted • ${passport.co2Sequestered} t CO₂ sequestered/ha`}
            />
          </div>

          {/* Route visualization */}
          <div className="mt-5 pt-4 border-t border-emerald-500/10">
            <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-3">{t("carbon.route")}</p>
            <div className="flex items-center justify-between gap-1">
              {ROUTE_STEPS.map((step, i) => (
                <div key={i} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-1 text-center flex-1">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(12,15,25,0.6)] border border-emerald-500/15 text-base">
                      {step.icon}
                    </div>
                    <span className="text-[8px] text-gray-500 max-w-[60px]">{step.labelKey}</span>
                  </div>
                  {i < ROUTE_STEPS.length - 1 && <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/40 to-transparent mx-0.5 mb-4" />}
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="mt-5 pt-4 border-t border-emerald-500/10">
            <div className="flex flex-wrap gap-2">
              {passport.certifications.map((cert) => (
                <Badge key={cert} className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-[9px]">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> {cert}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowQR(!showQR)}
              className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/15 bg-[rgba(12,15,25,0.5)] py-3 text-xs text-gray-300 hover:bg-emerald-500/5 hover:text-emerald-300 transition-all"
            >
              <Scan className="h-4 w-4" />
              {t("carbon.qr")}
            </button>
            <Button onClick={() => setPreview(true)} className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs gap-2">
              <Eye className="h-4 w-4" /> {t("carbon.preview")}
            </Button>
            <button
              onClick={() => window.print()}
              className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-emerald-500/15 bg-[rgba(12,15,25,0.5)] py-3 text-xs text-gray-300 hover:bg-emerald-500/5 hover:text-emerald-300 transition-all"
            >
              <FileDown className="h-4 w-4" /> {t("carbon.download")}
            </button>
          </div>

          {/* QR reveal */}
          <AnimatePresence>
            {showQR && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="mt-4 flex flex-col items-center rounded-xl bg-[rgba(12,15,25,0.5)] p-4">
                  <SimulatedQR seed={passport.batchId} size={140} className="rounded-lg" />
                  <p className="mt-2 text-[10px] text-gray-500 text-center">{t("carbon.qrCaption")}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar summary */}
        <div className="space-y-4">
          <div className="glass-card p-4 text-center">
            <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">{t("market.sustainabilityScore")}</p>
            <p className="text-4xl font-bold text-emerald-300">92</p>
            <p className="text-[10px] text-gray-500 mt-1">Soil 92 • Water 78 • Biodiversity 88</p>
            <div className="mt-3 flex justify-center gap-2">
              <SimulatedBadge />
            </div>
          </div>

          <div className="glass-card p-4">
            <p className="text-[10px] text-gray-300 mb-3 flex items-center gap-1.5">
              <Waves className="h-3.5 w-3.5 text-blue-400" /> Impact Snapshot
            </p>
            <div className="space-y-2.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-500">CO₂ sequestered</span>
                <span className="font-semibold text-white">{passport.co2Sequestered} t/ha</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Water saved</span>
                <span className="font-semibold text-white">{passport.waterSaved.toLocaleString()} L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Food miles saved</span>
                <span className="font-semibold text-white">{passport.foodMilesSaved} mi</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 bg-gradient-to-br from-emerald-500/8 to-emerald-600/3">
            <p className="text-[10px] text-gray-300 mb-1 flex items-center gap-1.5">
              <Leaf className="h-3.5 w-3.5 text-emerald-400" /> Carbon Credits
            </p>
            <p className="text-lg font-bold text-emerald-300">142 credits</p>
            <p className="text-[9px] text-gray-500">Earned this month from verified batches</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {preview && (
          <ConsumerPassportModal
            data={{
              passportId: passport.batchId,
              crop: passport.cropType,
              emoji: "🍅",
              farmer: passport.farmer,
              farm: "Ratnagiri Fresh Farms",
              location: passport.location,
              distanceKm: 48,
              foodMiles: passport.foodMilesSaved,
              sustainabilityScore: 92,
            }}
            onClose={() => setPreview(false)}
          />
        )}
      </AnimatePresence>

      {/* Printable certificate */}
      <div className="print-certificate" style={{ display: "none" }}>
        <div style={{ padding: 40, fontFamily: "Georgia, serif" }}>
          <h1 style={{ fontSize: 26, color: "#059669" }}>Carbon Certificate — {passport.batchId}</h1>
          <p>Crop: {passport.cropType} • Farm: {passport.farmer} • {passport.location}</p>
          <p>Soil Score: {passport.soilScore}/100 • Water Efficiency: {passport.waterEfficiency}/100</p>
          <p>Carbon Footprint: {passport.carbonFootprint} kg CO₂e/kg (baseline {passport.carbonBaseline})</p>
          <p>Solar Cold Storage: {passport.solarStoragePercent}% • Food Miles Saved: {passport.foodMilesSaved}</p>
          <p>Certifications: {passport.certifications.join(", ")}</p>
          <p style={{ marginTop: 40, fontSize: 12, color: "#555" }}>Issued by AgriPulse AI — Autonomous Agtech Command Center</p>
        </div>
      </div>
    </div>
  );
}
