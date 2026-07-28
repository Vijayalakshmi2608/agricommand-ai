import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Upload,
  Camera,
  Leaf,
  AlertTriangle,
  Truck,
  DollarSign,
  Timer,
  Shield,
  Sun,
  Sprout,
  Scan,
  Mic,
  MicOff,
  MessageSquare,
  Send,
  Sparkles,
  Map,
  CheckCircle2,
  BookOpen,
  Navigation,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CROP_TYPES, CROP_IMAGES, CropGradeResult, GlutAlert, VoiceCommand, CarbonPassport } from "./types";
import { gradeCrop, getGlutAlerts, parseVoiceCommand } from "./ai";
import { MOCK_CARBON_PASSPORT } from "./data";
import Analytics from "./Analytics";

// ============================================================
// SECTION 2: CROP GRADING PORTAL
// ============================================================
function CropGradingPortal() {
  const [cropType, setCropType] = useState("");
  const [weight, setWeight] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CropGradeResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleSubmit = async () => {
    if (!cropType || !weight || !harvestDate || !zipCode) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await gradeCrop({
        cropType,
        weight: parseFloat(weight),
        harvestDate,
        zipCode,
        imageBase64: imagePreview || undefined,
      });
      setResult(res);
      toast.success("Crop graded successfully!");
    } catch {
      toast.error("Grading failed. Using mock data.");
    }
    setLoading(false);
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-emerald-400";
    if (grade.startsWith("B")) return "text-amber-400";
    return "text-orange-400";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15">
          <Leaf className="h-4.5 w-4.5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">AI Crop Intake & Grading</h2>
          <p className="text-[11px] text-gray-400">Submit your batch for quality assessment</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-500/10 bg-[rgba(22,28,46,0.4)] p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Crop Type</label>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="w-full rounded-lg border border-emerald-500/12 bg-[rgba(12,15,25,0.8)] px-3 py-2 text-xs text-white placeholder:text-gray-600 focus:border-emerald-400/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                >
                  <option value="" className="bg-[#0f1117]">Select crop...</option>
                  {CROP_TYPES.map((c) => (
                    <option key={c} value={c} className="bg-[#0f1117]">{CROP_IMAGES[c]} {c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full rounded-lg border border-emerald-500/12 bg-[rgba(12,15,25,0.8)] px-3 py-2 text-xs text-white placeholder:text-gray-600 focus:border-emerald-400/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Harvest Date</label>
                <input
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="w-full rounded-lg border border-emerald-500/12 bg-[rgba(12,15,25,0.8)] px-3 py-2 text-xs text-white focus:border-emerald-400/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 [color-scheme:dark]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Farm ZIP Code</label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="e.g. 422001"
                  className="w-full rounded-lg border border-emerald-500/12 bg-[rgba(12,15,25,0.8)] px-3 py-2 text-xs text-white placeholder:text-gray-600 focus:border-emerald-400/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>
            </div>

            {/* Image Upload Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-emerald-500/20 bg-[rgba(12,15,25,0.5)] p-6 text-center hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Crop preview" className="mx-auto max-h-32 rounded-lg object-cover" />
                  <div className="mt-2 flex items-center justify-center gap-1.5">
                    <Camera className="h-3 w-3 text-emerald-400" />
                    <span className="text-[10px] text-emerald-400">Click to change image</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-center">
                    <Upload className="h-8 w-8 text-emerald-400/50 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <p className="text-xs text-gray-400">
                    <span className="text-emerald-400 font-medium">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-[10px] text-gray-600">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading || !cropType || !weight || !harvestDate || !zipCode}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 gap-2 text-xs py-5 rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-40"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Grade My Crop (AI-Powered)
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Results Card */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Grade Header */}
                <div className="rounded-xl border border-emerald-500/12 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-5 text-center">
                  <div className="text-4xl font-bold tracking-tight mb-1">
                    <span className={getGradeColor(result.grade)}>{result.grade}</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
                    <span className="text-emerald-300 font-medium">{result.score}% Quality Score</span>
                    <span className="text-gray-600">|</span>
                    <span>Batch: {result.batchId}</span>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-emerald-500/10 bg-[rgba(22,28,46,0.4)] p-3.5">
                    <div className="flex items-center gap-2 mb-2">
                      <Timer className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-[10px] font-medium text-gray-400 uppercase">Shelf Life</span>
                    </div>
                    <p className="text-xl font-bold text-white">{result.shelfLifeDays}</p>
                    <p className="text-[10px] text-gray-500">Days remaining</p>
                  </div>
                  <div className="rounded-xl border border-emerald-500/10 bg-[rgba(22,28,46,0.4)] p-3.5">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-[10px] font-medium text-gray-400 uppercase">Fair Price</span>
                    </div>
                    <p className="text-xl font-bold text-white">${result.pricePerKg}</p>
                    <p className="text-[10px] text-gray-500">Per kg (market rate)</p>
                  </div>
                </div>

                {/* Storage Tips */}
                <div className="rounded-xl border border-emerald-500/10 bg-[rgba(22,28,46,0.4)] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-[10px] font-medium text-gray-400 uppercase">Optimal Storage Tips</span>
                  </div>
                  <ul className="space-y-1.5">
                    {result.storageTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-[11px] text-gray-300">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Sustainability Metrics */}
                <div className="rounded-xl border border-emerald-500/10 bg-[rgba(22,28,46,0.4)] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sprout className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-[10px] font-medium text-gray-400 uppercase">Sustainability Score</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-emerald-300">{result.carbonScore}</div>
                      <div className="text-[9px] text-gray-500">Carbon Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-emerald-300">{result.soilScore}</div>
                      <div className="text-[9px] text-gray-500">Soil Health</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-emerald-300">{result.foodMilesSaved}</div>
                      <div className="text-[9px] text-gray-500">Miles Saved</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-full min-h-[300px] items-center justify-center rounded-xl border border-dashed border-emerald-500/10 bg-[rgba(22,28,46,0.2)]"
              >
                <div className="text-center p-8">
                  <Leaf className="h-10 w-10 text-emerald-500/20 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Submit crop details to see</p>
                  <p className="text-xs text-gray-600">AI-powered quality assessment results</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SECTION 3: GLUT DETECTOR & SMART REROUTER
// ============================================================
function GlutDetector() {
  const [alerts, setAlerts] = useState<GlutAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<GlutAlert | null>(null);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    const data = await getGlutAlerts();
    setAlerts(data);
    setLoading(false);
  };

  const riskColor = (level: string) => {
    switch (level) {
      case "critical": return "text-red-400 bg-red-500/10 border-red-500/20";
      case "high": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "medium": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      default: return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Glut Detector & Smart Rerouter</h2>
            <p className="text-[11px] text-gray-400">Predictive oversupply alerts & alternative routing</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadAlerts}
          className="rounded-lg text-gray-400 hover:text-emerald-300 text-xs"
        >
          Refresh
        </Button>
      </div>

      {/* Zone Map Simulation */}
      <div className="rounded-xl border border-emerald-500/10 bg-[rgba(22,28,46,0.4)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Map className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[10px] font-medium text-gray-400 uppercase">Regional Harvest Zones</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["North", "South", "East", "West", "Central", "Coastal"].map((zone) => {
            const hasAlert = alerts.some(a => a.zone.startsWith(zone.slice(0, 1)));
            const surplus = alerts.filter(a => a.zone.startsWith(zone.slice(0, 1))).reduce((s, a) => s + a.surplusTons, 0);
            return (
              <div
                key={zone}
                className={`rounded-lg border p-2.5 text-center transition-all ${
                  hasAlert
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-emerald-500/10 bg-[rgba(12,15,25,0.5)]"
                }`}
              >
                <div className={`text-[10px] font-semibold ${hasAlert ? "text-amber-300" : "text-gray-300"}`}>
                  {zone}
                </div>
                {surplus > 0 && (
                  <div className="text-[9px] text-amber-400/80 mt-0.5">{surplus}T surplus</div>
                )}
                {surplus === 0 && (
                  <div className="text-[9px] text-gray-600 mt-0.5">Stable</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-[rgba(22,28,46,0.4)] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`rounded-xl border p-4 cursor-pointer transition-all duration-300 ${
                alert.riskLevel === "critical"
                  ? "border-red-500/30 bg-red-500/5 pulse-alert"
                  : alert.riskLevel === "high"
                  ? "border-amber-500/25 bg-amber-500/5"
                  : "border-emerald-500/15 bg-[rgba(22,28,46,0.4)]"
              }`}
              onClick={() => setSelectedAlert(selectedAlert?.id === alert.id ? null : alert)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-full px-2 py-0.5 text-[9px] font-semibold border ${riskColor(alert.riskLevel)}`}>
                    {alert.riskLevel.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      ⚠️ Price Crash Risk in {alert.zone}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {alert.cropType} — {alert.surplusTons.toLocaleString()} tons oversupply detected
                    </p>
                  </div>
                </div>
                <ChevronDownIcon open={selectedAlert?.id === alert.id} />
              </div>

              <AnimatePresence>
                {selectedAlert?.id === alert.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-emerald-500/10">
                      <div className="flex items-center gap-2 mb-3">
                        <Navigation className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-medium text-emerald-300">Smart Reroute Solution</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="rounded-lg bg-emerald-500/5 p-2.5">
                          <span className="text-[9px] text-gray-400 uppercase">Route To</span>
                          <p className="text-xs font-semibold text-white mt-0.5">{alert.demandZone}</p>
                          <p className="text-[9px] text-gray-500">{alert.routeDistance} • {alert.transitTime}</p>
                        </div>
                        <div className="rounded-lg bg-emerald-500/5 p-2.5">
                          <span className="text-[9px] text-gray-400 uppercase">Demand Deficit</span>
                          <p className="text-xs font-semibold text-white mt-0.5">{alert.demandDeficitTons.toLocaleString()} tons</p>
                          <p className="text-[9px] text-gray-500">Active buying demand</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-amber-500/5 p-2.5">
                          <span className="text-[9px] text-gray-400 uppercase">Fuel Cost</span>
                          <p className="text-xs font-semibold text-amber-300 mt-0.5">₹{alert.fuelCostOffset.toLocaleString()}</p>
                          <p className="text-[9px] text-gray-500">Estimated offset</p>
                        </div>
                        <div className="rounded-lg bg-emerald-500/10 p-2.5">
                          <span className="text-[9px] text-gray-400 uppercase">Net Profit</span>
                          <p className="text-xs font-semibold text-emerald-300 mt-0.5">₹{alert.projectedNetProfit.toLocaleString()}</p>
                          <p className="text-[9px] text-gray-500">Projected recovery</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="mt-3 w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs py-4 rounded-lg"
                      >
                        <Truck className="h-3.5 w-3.5" />
                        Execute Smart Reroute — Ship to {alert.demandZone}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

// ============================================================
// SECTION 4: CARBON PASSPORT
// ============================================================
function CarbonPassportModule() {
  const [passport, setPassport] = useState<CarbonPassport>(MOCK_CARBON_PASSPORT);
  const [showQR, setShowQR] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15">
          <Shield className="h-4.5 w-4.5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Soil-to-Shelf Carbon Passport</h2>
          <p className="text-[11px] text-gray-400">Verified sustainability credentials for every batch</p>
        </div>
      </div>

      <div className="rounded-xl border border-emerald-500/12 bg-gradient-to-br from-emerald-500/8 to-emerald-600/3 p-5">
        {/* Passport Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[9px] text-gray-400 uppercase tracking-widest">Passport ID</p>
            <p className="text-xs font-mono text-emerald-300">{passport.batchId}</p>
          </div>
          <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/20 text-[9px]">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
          </Badge>
        </div>

        {/* Crop Info */}
        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-emerald-500/10">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-2xl">
            {CROP_IMAGES[passport.cropType] || "🌱"}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{passport.cropType}</p>
            <p className="text-[10px] text-gray-400">{passport.farmer} • {passport.location}</p>
            <p className="text-[9px] text-gray-500">Harvested {passport.harvestDate}</p>
          </div>
        </div>

        {/* Metrics */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sprout className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[11px] text-gray-300">Regenerative Soil Score</span>
              </div>
              <span className="text-xs font-semibold text-emerald-300">{passport.soilScore}/100</span>
            </div>
            <div className="h-2 rounded-full bg-[rgba(12,15,25,0.6)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 fill-animate"
                style={{ width: `${passport.soilScore}%` }}
              />
            </div>
            <p className="text-[9px] text-emerald-400/70">No-Till Verified • Organic Matter 4.2%</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[11px] text-gray-300">Solar-Powered Cold Storage</span>
              </div>
              <span className="text-xs font-semibold text-emerald-300">{passport.solarStoragePercent}%</span>
            </div>
            <div className="h-2 rounded-full bg-[rgba(12,15,25,0.6)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 fill-animate"
                style={{ width: `${passport.solarStoragePercent}%` }}
              />
            </div>
            <p className="text-[9px] text-emerald-400/70">100% Zero-Emission Cold Chain</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[11px] text-gray-300">Food Miles Saved</span>
              </div>
              <span className="text-xs font-semibold text-emerald-300">{passport.foodMilesSaved} mi</span>
            </div>
            <div className="h-2 rounded-full bg-[rgba(12,15,25,0.6)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 fill-animate"
                style={{ width: `${Math.min(100, (passport.foodMilesSaved / 500) * 100)}%` }}
              />
            </div>
            <p className="text-[9px] text-emerald-400/70">{passport.foodMilesSaved} miles lower than commercial baseline</p>
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

        {/* QR Simulation */}
        <div className="mt-5 pt-4 border-t border-emerald-500/10">
          <button
            onClick={() => setShowQR(!showQR)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/15 bg-[rgba(12,15,25,0.5)] py-3 text-xs text-gray-300 hover:bg-emerald-500/5 hover:text-emerald-300 transition-all"
          >
            <Scan className="h-4 w-4" />
            {showQR ? "Hide" : "Show"} Consumer Trust QR Code
          </button>
          {showQR && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 overflow-hidden"
            >
              <div className="relative mx-auto w-48 h-48 rounded-xl bg-white p-4 flex items-center justify-center">
                <div className="relative w-full h-full">
                  {/* Simulated QR Code */}
                  <div className="grid grid-cols-7 gap-1 w-full h-full">
                    {Array.from({ length: 49 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-sm ${
                          [0, 1, 6, 7, 8, 13, 14, 20, 21, 27, 28, 34, 35, 41, 42, 43, 48].includes(i)
                            ? "bg-emerald-600"
                            : [5, 10, 11, 12, 17, 22, 23, 29, 30, 36, 37, 38, 39, 44, 45, 46, 47].includes(i)
                            ? "bg-emerald-500"
                            : Math.random() > 0.5 ? "bg-emerald-800" : "bg-white"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-10 w-10 rounded-sm bg-emerald-500 flex items-center justify-center">
                    <Sprout className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
              <p className="mt-2 text-center text-[9px] text-gray-500">
                Scan to view full lifecycle — Batch {passport.batchId}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SECTION 5: VOICE ASSISTANT
// ============================================================
function VoiceAssistant() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState<VoiceCommand | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");

  const handleVoiceToggle = () => {
    if (!listening) {
      if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
        toast.error("Speech recognition not available in this browser");
        return;
      }
      setListening(true);
      startListening();
    } else {
      setListening(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript;
      setTranscript(text);
    };

    recognition.onend = () => {
      setListening(false);
      if (transcript) processTranscript(transcript);
    };

    recognition.start();
  };

  const processTranscript = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    const result = await parseVoiceCommand(text);
    setResponse(result);
    setLoading(false);

    toast.success("Voice command processed!", {
      description: `Intent: ${result.intent} (${Math.round(result.confidence * 100)}% confidence)`,
    });
  };

  const handleTextSubmit = () => {
    if (!inputText.trim()) return;
    setTranscript(inputText);
    processTranscript(inputText);
    setInputText("");
  };

  const getIntentLabel = (intent: string) => {
    const labels: Record<string, string> = {
      "market-price": "Market Price Inquiry",
      "log-batch": "Batch Logging",
      "check-grade": "Quality Check Request",
      "find-barter": "Barter Search",
      "glut-check": "Surplus Check",
      unknown: "General Query",
    };
    return labels[intent] || "Unknown";
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15">
          <Mic className="h-4.5 w-4.5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Voice-Field Assistant</h2>
          <p className="text-[11px] text-gray-400">Speak or type in regional languages</p>
        </div>
      </div>

      <div className="rounded-xl border border-purple-500/10 bg-[rgba(22,28,46,0.4)] p-5">
        {/* Audio Visualizer */}
        <div className={`flex items-center justify-center gap-0.5 h-16 mb-4 rounded-xl ${
          listening ? "bg-purple-500/5" : "bg-[rgba(12,15,25,0.5)]"
        }`}>
          {listening ? (
            <div className="flex items-center gap-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-full bg-gradient-to-t from-purple-500 to-emerald-400 waveform-bar"
                  style={{
                    animationDelay: `${i * 0.08}s`,
                    height: `${12 + Math.random() * 20}px`,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500">
              <MicOff className="h-5 w-5" />
              <span className="text-xs">Tap to speak in Hindi, Marathi, Tamil, or English</span>
            </div>
          )}
        </div>

        {/* Voice Button */}
        <div className="flex justify-center mb-4">
          <button
            onClick={handleVoiceToggle}
            className={`relative h-16 w-16 rounded-full transition-all duration-300 ${
              listening
                ? "bg-gradient-to-r from-red-500 to-purple-600 shadow-lg shadow-red-500/30 scale-110"
                : "bg-gradient-to-r from-purple-500 to-emerald-500 shadow-lg shadow-purple-500/20 hover:scale-105"
            }`}
          >
            {listening ? (
              <Mic className="h-6 w-6 text-white mx-auto" />
            ) : (
              <Mic className="h-6 w-6 text-white mx-auto" />
            )}
            {listening && (
              <span className="absolute -top-1 -right-1 h-4 w-4">
                <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-60" />
                <span className="absolute inset-0 rounded-full bg-red-400" />
              </span>
            )}
          </button>
        </div>

        {/* Text Input Alternative */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
            placeholder="Type here... e.g., 'What is tomato price in Mumbai?'"
            className="flex-1 rounded-xl border border-purple-500/12 bg-[rgba(12,15,25,0.8)] px-4 py-2.5 text-xs text-white placeholder:text-gray-600 focus:border-purple-400/40 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
          />
          <Button
            onClick={handleTextSubmit}
            disabled={!inputText.trim() || loading}
            size="sm"
            className="rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/20"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="mt-4 rounded-xl bg-purple-500/5 border border-purple-500/10 p-3">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-[10px] font-medium text-gray-400 uppercase">Transcript</span>
            </div>
            <p className="text-xs text-gray-300">"{transcript}"</p>
          </div>
        )}

        {/* AI Response */}
        {loading && (
          <div className="mt-3 flex items-center justify-center gap-2 py-4">
            <div className="h-4 w-4 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" />
            <span className="text-xs text-gray-400">Processing...</span>
          </div>
        )}

        {response && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[10px] font-medium text-emerald-400 uppercase">
                  {getIntentLabel(response.intent)}
                </span>
              </div>
              <span className="text-[9px] text-gray-500">
                {Math.round(response.confidence * 100)}% confidence
              </span>
            </div>
            <pre className="text-[11px] text-gray-300 font-sans whitespace-pre-wrap">
              {JSON.stringify(response.parsedData, null, 2)}
            </pre>
          </motion.div>
        )}

        <p className="mt-3 text-[10px] text-gray-600 text-center">
          Supports English, Hindi, Marathi, Tamil, Telugu, Bengali
        </p>
      </div>
    </div>
  );
}

// ============================================================
// EXPORT: MAIN FARMER OPS CONTAINER
// ============================================================
export default function FarmerOps() {
  const [activeTab, setActiveTab] = useState("grading");

  const tabs = [
    { id: "grading", label: "Crop Grading", icon: Leaf },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "glut", label: "Glut Alerts", icon: AlertTriangle },
    { id: "carbon", label: "Carbon Passport", icon: Shield },
    { id: "voice", label: "Voice Assistant", icon: Mic },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Tab Navigation */}
      <div className="flex gap-1 rounded-xl bg-[rgba(22,28,46,0.5)] border border-emerald-500/10 p-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-[11px] font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-emerald-500/15 text-emerald-300 shadow-sm"
                  : "text-gray-400 hover:text-gray-300 hover:bg-emerald-500/5"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === "grading" && <CropGradingPortal />}
          {activeTab === "analytics" && <Analytics />}
          {activeTab === "glut" && <GlutDetector />}
          {activeTab === "carbon" && <CarbonPassportModule />}
          {activeTab === "voice" && <VoiceAssistant />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
