import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ShoppingCart, Search, MapPin, Leaf, ShieldCheck, Filter, Share2,
  TrendingUp, TrendingDown, Users, Sprout, Heart, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { MOCK_PRODUCTS, MOCK_CONSUMER_IMPACT } from "./data";
import { MarketProduct } from "./types";
import { useI18n } from "./i18n";
import { useDebounce, SimulatedBadge, LiveBadge, CountUp, EmptyState } from "./ui-kit";
import ConsumerPassportModal from "./ConsumerPassport";

export type ConsumerTab = "market" | "impact";

function TooltipBody({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-amber-500/15 bg-[rgba(18,22,36,0.95)] backdrop-blur-xl p-3 text-[11px]">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-gray-200">
          <span style={{ color: p.color }}>{p.name}: </span>
          <span className="font-semibold text-white">{p.value}{p.name.includes("kg") ? "" : p.name === "Carbon" ? " kg CO₂e" : p.name === "Miles" ? " mi" : p.name === "Farmers" ? "" : "%"}</span>
        </p>
      ))}
    </div>
  );
}

export default function Marketplace({
  tab,
  onTabChange,
}: {
  tab: ConsumerTab;
  onTabChange: (t: ConsumerTab) => void;
}) {
  return (
    <div className="space-y-6 pb-8 md:pb-2">
      <div className="hidden md:flex gap-1 rounded-xl bg-[rgba(22,28,46,0.5)] border border-amber-500/10 p-1 w-fit">
        {([
          { id: "market", label: "ctabs.market", icon: ShoppingCart },
          { id: "impact", label: "ctabs.impact", icon: Heart },
        ] as const).map((tb) => {
          const Icon = tb.icon;
          return (
            <button
              key={tb.id}
              onClick={() => onTabChange(tb.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[11px] font-medium transition-all ${
                tab === tb.id ? "bg-amber-500/15 text-amber-300 shadow-sm" : "text-gray-400 hover:text-gray-300 hover:bg-amber-500/5"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tb.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
          {tab === "market" ? <MarketHome /> : <ImpactDashboard />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ===== MARKET HOME =====
function MarketHome() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [filters, setFilters] = useState<Record<string, boolean>>({
    organic: false,
    carbon: false,
    within50: false,
    available: false,
  });
  const [selected, setSelected] = useState<MarketProduct | null>(null);
  const debounced = useDebounce(search, 300);

  const filtered = useMemo(() => {
    return MOCK_PRODUCTS.filter((p) => {
      if (debounced && !p.name.toLowerCase().includes(debounced.toLowerCase()) && !p.farm.toLowerCase().includes(debounced.toLowerCase())) return false;
      if (filters.organic && !p.organic) return false;
      if (filters.carbon && !p.carbonCertified) return false;
      if (filters.within50 && p.distanceKm > 50) return false;
      if (filters.available && p.shelfLifeDays < 5) return false;
      return true;
    });
  }, [debounced, filters]);

  const toggleFilter = (k: string) => setFilters((f) => ({ ...f, [k]: !f[k] }));

  const filterChips = [
    { key: "organic", label: t("market.organicOnly") },
    { key: "carbon", label: t("market.carbonCertified") },
    { key: "within50", label: t("market.within50") },
    { key: "available", label: t("market.availableNow") },
  ];

  return (
    <div className="space-y-5">
      {/* Hero search */}
      <div className="rounded-2xl border border-amber-500/15 bg-gradient-to-br from-amber-500/8 to-amber-600/3 p-5">
        <h2 className="text-lg font-bold text-white">{t("market.heroPlaceholder")}</h2>
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("market.heroPlaceholder")}
              className="w-full rounded-xl border border-amber-500/15 bg-[rgba(12,15,25,0.8)] pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-amber-400/40 focus:outline-none"
            />
          </div>
          <div className="relative sm:w-56">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t("market.location")}
              className="w-full rounded-xl border border-amber-500/15 bg-[rgba(12,15,25,0.8)] pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-amber-400/40 focus:outline-none"
            />
          </div>
        </div>

        {/* Filter chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          {filterChips.map((c) => (
            <button
              key={c.key}
              onClick={() => toggleFilter(c.key)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-medium transition-all ${
                filters[c.key]
                  ? "border-amber-400/50 bg-amber-500/15 text-amber-300"
                  : "border-amber-500/15 text-gray-400 hover:text-gray-300"
              }`}
            >
              <Filter className="h-2.5 w-2.5" /> {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart className="h-12 w-12" />}
          title="No products match your filters"
          sub="Try widening the search or clearing filters to see all verified produce."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card overflow-hidden hover:border-amber-400/25 transition-all duration-300 group"
            >
              {/* Product image (emoji hero) */}
              <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-[rgba(245,158,11,0.12)] to-[rgba(16,185,129,0.06)]">
                <span className="text-6xl drop-shadow-lg group-hover:scale-110 transition-transform">{p.emoji}</span>
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                  {p.carbonCertified && (
                    <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/25 text-[9px]">
                      <ShieldCheck className="h-3 w-3 mr-1" /> {p.carbonScore}/100 {t("market.carbonScore")}
                    </Badge>
                  )}
                  {p.organic && (
                    <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/25 text-[9px]">
                      <Leaf className="h-3 w-3 mr-1" /> Organic
                    </Badge>
                  )}
                </div>
                <div className="absolute top-2.5 right-2.5">
                  <Badge className="bg-white/10 text-white border-white/15 text-[9px]">{t("market.grade")} {p.grade}</Badge>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="h-2.5 w-2.5" /> {p.farm} • {p.distanceKm} km
                </p>

                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="text-lg font-bold text-white">₹ {p.pricePerKg}<span className="text-[10px] text-gray-500">/kg</span></p>
                    <p className="text-[9px] text-emerald-400/80">{t("market.fairTrade")} ✓</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-300">{p.shelfLifeDays} {t("market.shelfLife")}</p>
                    <p className="text-[9px] text-gray-600">{p.carbonCertified ? <LiveBadge /> : <SimulatedBadge />}</p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    onClick={() => toast.success(t("market.addedToast"), { description: `${p.name} • ₹${p.pricePerKg}/kg` })}
                    className="rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] py-2.5 hover:from-amber-400 hover:to-amber-500 gap-1"
                  >
                    <ShoppingCart className="h-3 w-3" /> {t("market.addToCart")}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelected(p)}
                    className="rounded-lg border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/10 text-[10px] py-2.5 gap-1"
                  >
                    <ShieldCheck className="h-3 w-3" /> {t("market.viewPassport")}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <ConsumerPassportModal
            data={{
              passportId: selected.passportId,
              crop: selected.name,
              emoji: selected.emoji,
              farmer: selected.farmer,
              farm: selected.farm,
              location: selected.location,
              distanceKm: selected.distanceKm,
              foodMiles: selected.foodMiles,
              sustainabilityScore: selected.carbonScore,
            }}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ===== IMPACT DASHBOARD =====
function ImpactDashboard() {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const last = MOCK_CONSUMER_IMPACT[MOCK_CONSUMER_IMPACT.length - 1];

  const share = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#0F1117";
    ctx.fillRect(0, 0, 640, 360);
    ctx.fillStyle = "#10B981";
    ctx.beginPath();
    ctx.arc(560, 60, 130, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 34px Inter, sans-serif";
    ctx.fillText("My AgriPulse Impact", 40, 70);
    ctx.font = "18px Inter, sans-serif";
    ctx.fillStyle = "#6B7280";
    ctx.fillText(`July 2026 • ${last.farmersSupported} farms supported`, 40, 105);
    ctx.fillStyle = "#F9FAFB";
    ctx.font = "bold 22px Inter, sans-serif";
    ctx.fillText(`Carbon saved: ${last.carbonSaved} kg CO₂e`, 40, 170);
    ctx.fillText(`Food miles saved: ${last.foodMiles.toLocaleString()} mi`, 40, 210);
    ctx.fillText(`Organic produce: ${last.organicPct}%`, 40, 250);
    ctx.fillText(`Farmers supported: ${last.farmersSupported}`, 40, 290);
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "agripulse-impact.png";
    a.click();
    toast.success(t("market.shared"));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Your Impact Dashboard</h2>
          <p className="text-[11px] text-gray-400">Verified purchases only — last 3 months</p>
        </div>
        <Button onClick={share} className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs gap-2">
          <Share2 className="h-3.5 w-3.5" /> {t("market.shareImpact")}
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Leaf className="h-4 w-4 text-emerald-400" />
            <p className="text-[9px] text-gray-400 uppercase">{t("market.carbonSaved")}</p>
          </div>
          <p className="text-xl font-bold text-white"><CountUp value={last.carbonSaved} suffix=" kg" /></p>
          <p className="text-[9px] text-emerald-300">CO₂e vs supermarket</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <TrendingUp className="h-4 w-4 text-amber-400" />
            <p className="text-[9px] text-gray-400 uppercase">{t("market.foodMilesSaved")}</p>
          </div>
          <p className="text-xl font-bold text-white"><CountUp value={last.foodMiles} suffix=" mi" /></p>
          <p className="text-[9px] text-emerald-300">↑ 24% vs May</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Users className="h-4 w-4 text-blue-400" />
            <p className="text-[9px] text-gray-400 uppercase">{t("market.farmersSupported")}</p>
          </div>
          <p className="text-xl font-bold text-white"><CountUp value={last.farmersSupported} /></p>
          <p className="text-[9px] text-emerald-300">unique farms</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Sprout className="h-4 w-4 text-emerald-400" />
            <p className="text-[9px] text-gray-400 uppercase">{t("market.organicPct")}</p>
          </div>
          <p className="text-xl font-bold text-white"><CountUp value={last.organicPct} suffix="%" /></p>
          <p className="text-[9px] text-emerald-300">of purchases organic</p>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-white">Impact Trends — 3 Months</p>
            <p className="text-[9px] text-gray-500">Carbon saved (kg CO₂e) • food miles (mi)</p>
          </div>
          <LiveBadge />
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_CONSUMER_IMPACT} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="mGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TooltipBody />} />
              <Area type="monotone" dataKey="carbonSaved" name="Carbon" stroke="#10B981" strokeWidth={2.5} fill="url(#cGrad)" dot={{ r: 4, fill: "#10B981" }} />
              <Area type="monotone" dataKey="foodMiles" name="Miles" stroke="#F59E0B" strokeWidth={2.5} fill="url(#mGrad)" dot={{ r: 4, fill: "#F59E0B" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hidden share canvas */}
      <canvas ref={canvasRef} width={640} height={360} className="hidden" />

      {/* Motivation card */}
      <div className="rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/8 to-emerald-600/3 p-5 text-center">
        <p className="text-sm text-gray-300">
          Your purchases this month <span className="text-emerald-300 font-semibold">offset {Math.round(last.carbonSaved * 0.62)} kg of CO₂</span> — equivalent to planting <span className="text-emerald-300 font-semibold">{(last.carbonSaved * 0.62 * 0.05).toFixed(1)} trees</span>. 🌳
        </p>
        <p className="text-[10px] text-gray-500 mt-2">Every order directly supports a smallholder farm family.</p>
      </div>
    </div>
  );
}
