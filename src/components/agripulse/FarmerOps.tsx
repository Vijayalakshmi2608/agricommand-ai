import { lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf, BarChart3, AlertTriangle, Handshake, Shield, Mic, FileText,
} from "lucide-react";
import { useI18n } from "./i18n";
import { SkeletonCard } from "./ui-kit";

const CropGradingPortal = lazy(() => import("./CropGradingPortal"));
const Analytics = lazy(() => import("./Analytics"));
const GlutDetector = lazy(() => import("./GlutDetector"));
const BarterNetwork = lazy(() => import("./BarterNetwork"));
const CarbonPassportModule = lazy(() => import("./CarbonPassport"));
const VoiceAssistant = lazy(() => import("./VoiceAssistant"));
const SmartLedger = lazy(() => import("./SmartLedger"));

export type FarmerTab = "grading" | "analytics" | "glut" | "barter" | "carbon" | "voice" | "ledger";

export const FARMER_TABS: { id: FarmerTab; icon: typeof Leaf; labelKey: string }[] = [
  { id: "grading", icon: Leaf, labelKey: "tabs.grading" },
  { id: "analytics", icon: BarChart3, labelKey: "tabs.analytics" },
  { id: "glut", icon: AlertTriangle, labelKey: "tabs.glut" },
  { id: "barter", icon: Handshake, labelKey: "tabs.barter" },
  { id: "carbon", icon: Shield, labelKey: "tabs.carbon" },
  { id: "voice", icon: Mic, labelKey: "tabs.voice" },
  { id: "ledger", icon: FileText, labelKey: "tabs.ledger" },
];

const COMPONENTS: Record<FarmerTab, React.LazyExoticComponent<() => React.ReactElement | null>> = {
  grading: CropGradingPortal,
  analytics: Analytics,
  glut: GlutDetector,
  barter: BarterNetwork,
  carbon: CarbonPassportModule,
  voice: VoiceAssistant,
  ledger: SmartLedger,
};

export default function FarmerOps({
  tab,
  onTabChange,
}: {
  tab: FarmerTab;
  onTabChange: (t: FarmerTab) => void;
}) {
  const { t } = useI18n();
  const Active = COMPONENTS[tab];

  return (
    <div className="space-y-6 pb-8 md:pb-2">
      {/* Desktop tab navigation */}
      <div className="hidden md:flex gap-1 rounded-xl bg-[rgba(22,28,46,0.5)] border border-emerald-500/10 p-1 overflow-x-auto">
        {FARMER_TABS.map((tb) => {
          const Icon = tb.icon;
          return (
            <button
              key={tb.id}
              onClick={() => onTabChange(tb.id)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-[11px] font-medium whitespace-nowrap transition-all ${
                tab === tb.id ? "bg-emerald-500/15 text-emerald-300 shadow-sm" : "text-gray-400 hover:text-gray-300 hover:bg-emerald-500/5"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t(tb.labelKey)}
            </button>
          );
        })}
      </div>

      {/* Tab content (lazy) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          <Suspense fallback={<TabSkeleton />}>
            <Active />
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function TabSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SkeletonCard lines={5} />
      <SkeletonCard lines={4} />
    </div>
  );
}
