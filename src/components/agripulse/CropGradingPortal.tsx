import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Upload, Camera, Leaf, Timer, DollarSign, BookOpen, CheckCircle2,
  Sparkles, Thermometer, Droplets, Sun, Scan, RefreshCw, Minus, Plus,
  FileDown, Sprout, ImagePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CROP_OPTIONS, INDIAN_STATES, CropGradeResult, CropGradeInput } from "./types";
import { gradeCrop } from "./ai";
import { useI18n } from "./i18n";
import { ScoreRing, Sparkline, CountUp, SimulatedBadge, SkeletonBlock, SimulatedQR, readPrefill, clearPrefill } from "./ui-kit";
import { enqueueAction, getOfflineState } from "./offline";

const ANALYSIS_STEPS = [
  "grading.step1",
  "grading.step2",
  "grading.step3",
  "grading.step4",
] as const;

const GRADE_COLORS: Record<string, string> = {
  "A+": "text-emerald-300 bg-emerald-500/15 border-emerald-500/30",
  A: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  "A-": "text-green-400 bg-green-500/10 border-green-500/25",
  "B+": "text-amber-400 bg-amber-500/10 border-amber-500/25",
  B: "text-orange-400 bg-orange-500/10 border-orange-500/25",
  C: "text-red-400 bg-red-500/10 border-red-500/25",
};

const STORAGE_CONDITIONS: Record<string, { temp: string; humidity: string; light: string }> = {
  "Alphonso Mango": { temp: "12–14°C", humidity: "85–90%", light: "Indirect / low" },
  "Kesar Mango": { temp: "12–14°C", humidity: "85–90%", light: "Indirect / low" },
  "Organic Tomato": { temp: "10–12°C", humidity: "85–90%", light: "Low" },
  "Banana": { temp: "13–14°C", humidity: "90–95%", light: "Low" },
  "Papaya": { temp: "10–12°C", humidity: "85–90%", light: "Low" },
  "Pomegranate": { temp: "5–8°C", humidity: "90%", light: "Dark" },
  "Onion": { temp: "0–4°C", humidity: "65–70%", light: "Dark, ventilated" },
  "Potato": { temp: "7–10°C", humidity: "90–95%", light: "Dark (no sprouting)" },
  "Cauliflower": { temp: "0–4°C", humidity: "95%", light: "Dark" },
  "Bitter Gourd": { temp: "12–15°C", humidity: "85%", light: "Low" },
  "Green Bell Pepper": { temp: "7–10°C", humidity: "90%", light: "Dark" },
  "Basmati Rice": { temp: "< 25°C", humidity: "< 65%", light: "Dark, airtight" },
  "Wheat": { temp: "< 25°C", humidity: "< 65%", light: "Dark, ventilated" },
  "Jowar": { temp: "< 25°C", humidity: "< 65%", light: "Dark, ventilated" },
  "Bajra": { temp: "< 25°C", humidity: "< 65%", light: "Dark, ventilated" },
  "Maize": { temp: "< 20°C", humidity: "< 60%", light: "Dark, ventilated" },
  "Chana Dal": { temp: "< 25°C", humidity: "< 60%", light: "Dark, airtight" },
  "Toor Dal": { temp: "< 25°C", humidity: "< 60%", light: "Dark, airtight" },
  "Masoor Dal": { temp: "< 25°C", humidity: "< 60%", light: "Dark, airtight" },
  "Cotton": { temp: "< 35°C", humidity: "< 12% moisture", light: "Dark warehouse" },
  "Sugarcane": { temp: "Cool, shaded", humidity: "High", light: "Shaded" },
  "Turmeric": { temp: "12–15°C", humidity: "70–80%", light: "Dark" },
};

export default function CropGradingPortal() {
  const { t } = useI18n();
  const [cropType, setCropType] = useState("");
  const [weight, setWeight] = useState("500");
  const [harvestDate, setHarvestDate] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [pin, setPin] = useState("");
  const [moisture, setMoisture] = useState(12);
  const [organic, setOrganic] = useState(true);
  const [image, setImage] = useState<string | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<CropGradeResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Voice-assistant prefill
  useEffect(() => {
    const pre = readPrefill();
    if (pre) {
      if (pre.crop) setCropType(pre.crop);
      if (pre.quantity) setWeight(pre.quantity);
      if (pre.date) setHarvestDate(pre.date);
      if (pre.state) setState(pre.state);
      clearPrefill();
      toast.info(t("grading.filled"));
    }
  }, [t]);

  // Attach camera stream
  useEffect(() => {
    if (cameraOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
    return () => {
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
    };
  }, [cameraOn]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOn(true);
    } catch {
      toast.error(t("grading.cameraDenied"));
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    setCameraOn(false);
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const maxW = 800;
    const scale = Math.min(1, maxW / video.videoWidth);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    setImage(canvas.toDataURL("image/jpeg", 0.82));
    stopCamera();
  };

  const handleUpload = useCallback((file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxW = 800;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
        setImage(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSubmit = async () => {
    if (!cropType || !weight || !harvestDate || !state || !pin) {
      toast.error("Please complete the form fields");
      return;
    }
    const input: CropGradeInput = {
      cropType,
      weight: parseFloat(weight),
      harvestDate,
      zipCode: pin,
      state,
      district,
      moisture,
      organic,
      imageBase64: image || undefined,
    };

    if (!getOfflineState().isOnline) {
      enqueueAction("grade", input as unknown as Record<string, unknown>);
      toast.warning(t("offline.queueHint"));
      return;
    }

    setAnalyzing(true);
    setStep(0);
    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      setStep(i);
      await new Promise((r) => setTimeout(r, 750));
    }
    try {
      const res = await gradeCrop(input);
      setResult(res);
      toast.success(t("grading.toastSuccess"));
    } catch {
      toast.error(t("grading.toastError"));
    }
    setAnalyzing(false);
  };

  const handleExport = () => {
    window.print();
  };

  const gradeColor = GRADE_COLORS[result?.grade || ""] || GRADE_COLORS.B;
  const shelfDays = result?.shelfLifeDays || 0;
  const shelfText = `${shelfDays} Days ${Math.round((shelfDays % 1) * 24)} Hours`;
  const priceLow = result ? Math.round(result.pricePerKg * 90) : 0;
  const priceHigh = result ? Math.round(result.pricePerKg * 110) : 0;
  const spark = result
    ? Array.from({ length: 7 }, (_, i) => result.pricePerKg * (0.86 + i * 0.04))
    : [];
  const storage = STORAGE_CONDITIONS[cropType] || { temp: "10–14°C", humidity: "80–90%", light: "Low" };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15">
          <Leaf className="h-4.5 w-4.5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">{t("grading.title")}</h2>
          <p className="text-[11px] text-gray-400">{t("grading.sub")}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ===== INPUT FORM ===== */}
        <div className="space-y-4">
          <div className="glass-card p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{t("grading.cropType")}</label>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="w-full rounded-xl border border-emerald-500/12 bg-[rgba(12,15,25,0.8)] px-3 py-2.5 text-xs text-white focus:border-emerald-400/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                >
                  <option value="" className="bg-[#0f1117]">{t("grading.selectCrop")}</option>
                  {(["Fruits", "Vegetables", "Grains", "Pulses", "Cash Crops"] as const).map((cat) => (
                    <optgroup key={cat} label={cat} className="bg-[#0f1117]">
                      {CROP_OPTIONS.filter((c) => c.category === cat).map((c) => (
                        <option key={c.name} value={c.name} className="bg-[#0f1117]">{c.emoji} {c.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{t("grading.weight")}</label>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setWeight(String(Math.max(10, (parseFloat(weight) || 0) - 10)))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/12 bg-[rgba(12,15,25,0.8)] text-gray-400 hover:text-emerald-300"
                    aria-label="Decrease weight"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full rounded-lg border border-emerald-500/12 bg-[rgba(12,15,25,0.8)] px-2 py-2 text-center text-xs text-white focus:border-emerald-400/40 focus:outline-none"
                    aria-label={t("grading.weight")}
                  />
                  <button
                    onClick={() => setWeight(String((parseFloat(weight) || 0) + 10))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/12 bg-[rgba(12,15,25,0.8)] text-gray-400 hover:text-emerald-300"
                    aria-label="Increase weight"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{t("grading.harvestDate")}</label>
                <input
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="w-full rounded-lg border border-emerald-500/12 bg-[rgba(12,15,25,0.8)] px-3 py-2 text-xs text-white focus:border-emerald-400/40 focus:outline-none [color-scheme:dark]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{t("grading.state")}</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full rounded-lg border border-emerald-500/12 bg-[rgba(12,15,25,0.8)] px-3 py-2 text-xs text-white focus:border-emerald-400/40 focus:outline-none"
                >
                  <option value="" className="bg-[#0f1117]">{t("grading.selectState")}</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s} className="bg-[#0f1117]">{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{t("grading.district")}</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Nashik"
                  className="w-full rounded-lg border border-emerald-500/12 bg-[rgba(12,15,25,0.8)] px-3 py-2 text-xs text-white placeholder:text-gray-600 focus:border-emerald-400/40 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{t("grading.pin")}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="422001"
                  className="w-full rounded-lg border border-emerald-500/12 bg-[rgba(12,15,25,0.8)] px-3 py-2 text-xs text-white placeholder:text-gray-600 focus:border-emerald-400/40 focus:outline-none"
                />
              </div>

              {/* Moisture slider */}
              <div className="space-y-1.5 col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{t("grading.moisture")}</label>
                  <span className="text-xs font-semibold text-emerald-300">{moisture}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={25}
                  value={moisture}
                  onChange={(e) => setMoisture(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                  aria-label={t("grading.moisture")}
                />
              </div>

              {/* Organic toggle */}
              <div className="col-span-2 flex items-center justify-between rounded-xl border border-emerald-500/10 bg-[rgba(12,15,25,0.5)] px-3 py-2.5">
                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{t("grading.organic")}</label>
                <div className="flex gap-1 rounded-lg bg-[rgba(12,15,25,0.8)] p-0.5">
                  {[true, false].map((val) => (
                    <button
                      key={String(val)}
                      onClick={() => setOrganic(val)}
                      className={`rounded-md px-3 py-1 text-[10px] font-medium transition-all ${
                        organic === val ? "bg-emerald-500/20 text-emerald-300" : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      {val ? "Yes" : "No"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image upload + camera */}
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{t("grading.image")}</label>
                {cameraOn ? (
                  <div className="rounded-xl border border-emerald-500/20 bg-black/60 overflow-hidden">
                    <video ref={videoRef} autoPlay playsInline muted className="mx-auto max-h-56" />
                    <div className="flex gap-2 p-2">
                      <Button size="sm" onClick={capture} className="flex-1 rounded-lg bg-emerald-500 text-white text-[10px] py-2">
                        <Camera className="h-3 w-3" /> {t("grading.capture")}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={stopCamera} className="rounded-lg text-gray-400 text-[10px]">
                        {t("common.cancel")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files?.[0]); }}
                      onDragOver={(e) => e.preventDefault()}
                      className="relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-emerald-500/20 bg-[rgba(12,15,25,0.5)] p-5 text-center hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUpload(e.target.files?.[0])}
                        className="hidden"
                      />
                      {image ? (
                        <div className="relative">
                          <img src={image} alt="Crop preview" className="mx-auto max-h-32 rounded-lg object-cover" />
                          <div className="mt-2 flex items-center justify-center gap-1.5">
                            <RefreshCw className="h-3 w-3 text-emerald-400" />
                            <span className="text-[10px] text-emerald-400">{t("grading.changeImage")}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <ImagePlus className="h-7 w-7 text-emerald-400/50 mx-auto group-hover:text-emerald-400 transition-colors" />
                          <p className="text-xs text-gray-400">
                            <span className="text-emerald-400 font-medium">{t("grading.upload")}</span>
                          </p>
                          <p className="text-[9px] text-gray-600">{t("grading.uploadHint")}</p>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={startCamera}
                      className="w-full rounded-xl border border-emerald-500/12 text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-300 text-[11px] py-2.5"
                    >
                      <Scan className="h-3.5 w-3.5" /> {t("grading.camera")}
                    </Button>
                  </>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={analyzing || !cropType || !weight || !harvestDate || !state || !pin}
                className="col-span-2 w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 gap-2 text-xs py-4 rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-40"
              >
                {analyzing ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("grading.analyzing")}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {t("grading.analyze")}
                  </>
                )}
              </Button>

              {analyzing && (
                <div className="col-span-2 space-y-2 rounded-xl border border-emerald-500/10 bg-[rgba(12,15,25,0.5)] p-3">
                  {ANALYSIS_STEPS.map((s, i) => (
                    <div key={s} className="flex items-center gap-2 text-[11px]">
                      {i < step ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      ) : i === step ? (
                        <span className="h-3.5 w-3.5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                      ) : (
                        <span className="h-3.5 w-3.5 rounded-full border border-gray-600" />
                      )}
                      <span className={i <= step ? "text-gray-300" : "text-gray-600"}>{t(s)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== RESULTS ===== */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {analyzing ? (
              <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <SkeletonBlock className="h-28 w-full" />
                <div className="grid grid-cols-2 gap-3">
                  <SkeletonBlock className="h-20" />
                  <SkeletonBlock className="h-20" />
                </div>
                <SkeletonBlock className="h-24 w-full" />
                <SkeletonBlock className="h-24 w-full" />
              </motion.div>
            ) : result ? (
              <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Grade header */}
                <div className="glass-card p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <ScoreRing value={result.score} size={96} color="#10B981" label={t("grading.qualityScore")} />
                    <div>
                      <Badge className={`${gradeColor} text-sm px-3 py-1 border`}>{result.grade}</Badge>
                      <p className="mt-2 text-[10px] text-gray-500">{t("grading.batch")}: <span className="font-mono text-emerald-300/80">{result.batchId}</span></p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <SimulatedBadge />
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <SimulatedQR seed={result.batchId} size={64} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-card p-3.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Timer className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-[9px] font-medium text-gray-400 uppercase">{t("grading.shelfLife")}</span>
                    </div>
                    <CountUp value={shelfDays} suffix=" Days" className="text-lg font-bold text-white" />
                    <p className="text-[9px] text-gray-500">≈ {shelfText}</p>
                    <div className="mt-2 h-1.5 rounded-full bg-[rgba(12,15,25,0.6)] overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400" style={{ width: `${Math.min(100, (shelfDays / 30) * 100)}%` }} />
                    </div>
                    <p className="mt-1 text-[9px] text-gray-600">{t("grading.daysLeft")}</p>
                  </div>
                  <div className="glass-card p-3.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-[9px] font-medium text-gray-400 uppercase">{t("grading.fairPrice")}</span>
                    </div>
                    <p className="text-lg font-bold text-white">
                      ₹ {priceLow}–{priceHigh}
                    </p>
                    <p className="text-[9px] text-gray-500">{t("grading.perKg")}</p>
                    <div className="mt-1.5 flex items-center justify-between">
                      <Sparkline values={spark} color="#F59E0B" width={90} height={26} />
                      <span className="text-[9px] text-emerald-300">7d trend</span>
                    </div>
                  </div>
                </div>

                {/* Storage conditions */}
                <div className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-[9px] font-medium text-gray-400 uppercase">{t("grading.storage")}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-[rgba(12,15,25,0.5)] p-3 text-center">
                      <Thermometer className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
                      <p className="text-[9px] text-gray-500">{t("grading.temp")}</p>
                      <p className="text-xs font-semibold text-white mt-0.5">{storage.temp}</p>
                    </div>
                    <div className="rounded-xl bg-[rgba(12,15,25,0.5)] p-3 text-center">
                      <Droplets className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                      <p className="text-[9px] text-gray-500">{t("grading.humidity")}</p>
                      <p className="text-xs font-semibold text-white mt-0.5">{storage.humidity}</p>
                    </div>
                    <div className="rounded-xl bg-[rgba(12,15,25,0.5)] p-3 text-center">
                      <Sun className="h-4 w-4 text-amber-400 mx-auto mb-1" />
                      <p className="text-[9px] text-gray-500">{t("grading.light")}</p>
                      <p className="text-xs font-semibold text-white mt-0.5">{storage.light}</p>
                    </div>
                  </div>
                </div>

                {/* AI reasoning */}
                <div className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-[9px] font-medium text-gray-400 uppercase">{t("grading.reasoning")}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {(result.reasoning || result.storageTips).map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-[11px] text-gray-300">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button onClick={handleExport} className="w-full rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-xs py-4 gap-2">
                  <FileDown className="h-4 w-4" /> {t("grading.export")}
                </Button>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-emerald-500/10 bg-[rgba(22,28,46,0.2)]">
                <div className="text-center p-8">
                  <Sprout className="h-10 w-10 text-emerald-500/20 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">{t("grading.emptyTitle")}</p>
                  <p className="text-xs text-gray-600">{t("grading.emptySub")}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Printable certificate (hidden on screen) */}
      {result && (
        <div className="print-certificate" style={{ display: "none" }}>
          <div style={{ padding: 40, fontFamily: "Georgia, serif" }}>
            <h1 style={{ fontSize: 28, color: "#059669" }}>AgriPulse AI — Quality Grade Certificate</h1>
            <p>Batch: {result.batchId} • Crop: {cropType} • Weight: {weight} kg</p>
            <p>Grade: <strong>{result.grade}</strong> • Score: {result.score}/100</p>
            <p>Fair price: ₹ {priceLow}–{priceHigh}/kg • Shelf life: {shelfText}</p>
            <p>Carbon score: {result.carbonScore}/100 • Soil score: {result.soilScore}/100</p>
            <p>Certifications: {result.certifications.join(", ")}</p>
            <p style={{ marginTop: 40, fontSize: 12, color: "#555" }}>Generated by AgriPulse AI — Autonomous Agtech Command Center</p>
          </div>
        </div>
      )}
    </div>
  );
}
