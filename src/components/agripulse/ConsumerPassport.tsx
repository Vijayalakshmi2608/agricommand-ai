import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { X, ShieldCheck, Leaf, Sun, Truck, CheckCircle2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SimulatedQR } from "./ui-kit";
import { useI18n } from "./i18n";

export interface ConsumerPassportData {
  passportId: string;
  crop: string;
  emoji: string;
  farmer: string;
  farm: string;
  location: string;
  distanceKm: number;
  foodMiles: number;
  sustainabilityScore: number;
  organicSince?: string;
}

export default function ConsumerPassportModal({
  data,
  onClose,
}: {
  data: ConsumerPassportData;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [verified, setVerified] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-amber-500/20 bg-[rgba(18,22,36,0.98)] shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-500/15 to-amber-600/5 px-6 pt-6 pb-4 border-b border-amber-500/10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[9px] text-amber-300/80 uppercase tracking-widest">{t("market.passportTitle")}</p>
              <h3 className="mt-1 text-lg font-bold text-white">
                {data.emoji} {data.crop}
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">{data.farm} • {data.location}</p>
            </div>
            <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-amber-500/10 hover:text-amber-300">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <SimulatedQR seed={data.passportId} size={64} className="rounded-lg" />
            <div className="flex-1">
              <p className="text-3xl font-bold text-emerald-300">{data.sustainabilityScore}<span className="text-sm text-gray-500">/100</span></p>
              <p className="text-[9px] text-gray-500 uppercase">{t("market.sustainabilityScore")}</p>
            </div>
            <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/25 text-[9px]">
              <Leaf className="h-3 w-3 mr-1" /> {t("carbon.verified")}
            </Badge>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/15 p-4">
            <p className="text-[12px] text-gray-200 leading-relaxed">
              💚 {t("market.travelLine", { crop: data.crop, km: data.distanceKm, miles: data.foodMiles })}
            </p>
          </div>

          <div className="space-y-2.5 text-[11px] text-gray-300">
            <div className="flex items-start gap-2.5">
              <Sun className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <p>{t("market.grownBy", { farmer: data.farmer })}</p>
            </div>
            <div className="flex items-start gap-2.5">
              <Truck className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <p>{t("market.solarLine")}</p>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <p>
                <span className="font-mono text-[10px] text-gray-500">{data.passportId}</span> — {data.crop.toLowerCase()} • full lifecycle on record
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setVerified(true);
              toast.success(t("market.verifyBlockchain"), { description: `0x${data.passportId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 18)}… verified on AgriChain` });
            }}
            className="w-full rounded-xl border border-emerald-500/25 bg-emerald-500/10 py-3 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t("market.verifyBlockchain")}
          </button>

          {verified && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 py-3"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300">{t("market.authentic")} ✓</span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
