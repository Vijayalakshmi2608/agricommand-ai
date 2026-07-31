import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Handshake, Search, Star, MapPin, ArrowLeftRight, Calculator,
  Plus, X, ImagePlus, CalendarDays, Wallet, Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_BARTER_LISTINGS, EXCHANGE_RATES } from "./data";
import { BarterListing, ExchangeRate } from "./types";
import { useI18n } from "./i18n";
import { useDebounce, EmptyState } from "./ui-kit";
import { enqueueAction, getOfflineState } from "./offline";

const TYPE_EMOJI: Record<string, string> = {
  equipment: "🔧",
  labor: "👥",
  compost: "🌱",
  seeds: "🌾",
  other: "📦",
};

const LOCAL_KEY = "agripulse-user-listings";

function loadUserListings(): BarterListing[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

export default function BarterNetwork() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [userListings, setUserListings] = useState<BarterListing[]>(loadUserListings);
  const [selected, setSelected] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const debounced = useDebounce(search, 300);

  const all = useMemo(() => [...userListings, ...MOCK_BARTER_LISTINGS], [userListings]);
  const filtered = all.filter((l) => {
    if (filter !== "all" && l.type !== filter) return false;
    if (debounced && !l.title.toLowerCase().includes(debounced.toLowerCase()) &&
        !l.farmerName.toLowerCase().includes(debounced.toLowerCase()) &&
        !l.location.toLowerCase().includes(debounced.toLowerCase())) return false;
    return true;
  });

  const handleTrade = (listing: BarterListing) => {
    if (!getOfflineState().isOnline) {
      enqueueAction("barter-trade", { listingId: listing.id, title: listing.title });
      toast.warning(t("offline.queueHint"));
      return;
    }
    toast.success(t("barter.requestTrade"), {
      description: `${listing.title} • ${listing.creditPerDay || `${listing.creditValue} credits`}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15">
            <Handshake className="h-4.5 w-4.5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">{t("barter.title")}</h2>
            <p className="text-[11px] text-gray-400">{t("barter.sub")}</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setListOpen(true)} className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[11px] gap-1.5">
          <Plus className="h-3.5 w-3.5" /> {t("barter.listResource")}
        </Button>
      </div>

      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("barter.search")}
            className="w-full rounded-xl border border-emerald-500/12 bg-[rgba(12,15,25,0.8)] pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-gray-600 focus:border-emerald-400/40 focus:outline-none"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border border-emerald-500/12 bg-[rgba(12,15,25,0.8)] px-3 py-2.5 text-xs text-white focus:border-emerald-400/40 focus:outline-none"
          aria-label={t("barter.allTypes")}
        >
          <option value="all" className="bg-[#0f1117]">{t("barter.allTypes")}</option>
          {(["equipment", "labor", "compost", "seeds", "other"] as const).map((ty) => (
            <option key={ty} value={ty} className="bg-[#0f1117]">{TYPE_EMOJI[ty]} {t(`barter.${ty}`)}</option>
          ))}
        </select>
      </div>

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Listings */}
        <div>
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Handshake className="h-12 w-12" />}
              title={t("barter.emptyTitle")}
              sub={t("barter.emptySub")}
              cta={t("barter.listResource")}
              onCta={() => setListOpen(true)}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((listing) => (
                <motion.div
                  key={listing.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`glass-card p-4 transition-all cursor-pointer ${
                    selected === listing.id ? "border-amber-400/40 shadow-lg shadow-amber-500/5" : "hover:border-emerald-500/25"
                  }`}
                  onClick={() => setSelected(selected === listing.id ? null : listing.id)}
                >
                  <div className="flex items-start gap-3 mb-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-lg">
                      {TYPE_EMOJI[listing.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{listing.title}</p>
                      <p className="text-[10px] text-gray-400 truncate">{listing.farmerName} • {listing.location}</p>
                    </div>
                    <Badge className={`text-[9px] ${listing.available ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" : "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
                      {listing.available ? t("barter.available") : t("barter.rented")}
                    </Badge>
                  </div>

                  <p className="text-[10px] text-gray-400 leading-relaxed mb-3 line-clamp-2">{listing.description}</p>

                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-3 w-3 text-amber-400" />
                      <span className="text-[10px] text-gray-400">{listing.rating}</span>
                      <span className="text-[9px] text-gray-600">({listing.tradesCompleted} {t("barter.trades")})</span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-gray-500">
                      <MapPin className="h-2.5 w-2.5" />
                      {listing.distanceKm ?? 12} {t("barter.kmAway")}
                    </div>
                  </div>

                  {/* Price in two formats */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="rounded-lg bg-[rgba(12,15,25,0.5)] p-2">
                      <p className="text-[8px] text-gray-500 uppercase">₹</p>
                      <p className="text-[11px] font-semibold text-white">{listing.pricePerDay || `₹ ${(listing.creditValue * 20).toLocaleString("en-IN")}/day`}</p>
                    </div>
                    <div className="rounded-lg bg-amber-500/5 border border-amber-500/15 p-2">
                      <p className="text-[8px] text-gray-500 uppercase flex items-center gap-0.5"><Wallet className="h-2 w-2" /> Credits</p>
                      <p className="text-[11px] font-semibold text-amber-300">{listing.creditPerDay || `${listing.creditValue} credits/day`}</p>
                    </div>
                  </div>

                  {listing.dates && (
                    <div className="flex items-center gap-1.5 text-[9px] text-gray-500 mb-3">
                      <CalendarDays className="h-2.5 w-2.5" /> {listing.dates}
                    </div>
                  )}

                  {selected === listing.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden">
                      <Button
                        size="sm"
                        disabled={!listing.available}
                        onClick={(e) => { e.stopPropagation(); handleTrade(listing); }}
                        className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] py-2.5 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 gap-1.5"
                      >
                        <ArrowLeftRight className="h-3 w-3" />
                        {t("barter.requestTrade")}
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Exchange calculator */}
        <div className="space-y-4">
          <ExchangeCalculator />
        </div>
      </div>

      <AnimatePresence>{listOpen && <ListResourceModal onClose={() => setListOpen(false)} onCreated={(l) => { setUserListings((p) => [l, ...p]); }} />}</AnimatePresence>
    </div>
  );
}

// ===== EXCHANGE CALCULATOR =====
function ExchangeCalculator() {
  const { t } = useI18n();
  const [crop, setCrop] = useState<ExchangeRate>(EXCHANGE_RATES[0]);
  const [qty, setQty] = useState("50");

  const credits = (parseFloat(qty) || 0) * crop.creditsPerKg;

  return (
    <div className="glass-card p-4 sticky top-20">
      <div className="flex items-center gap-2 mb-3">
        <Calculator className="h-3.5 w-3.5 text-emerald-400" />
        <span className="text-xs font-semibold text-white">{t("barter.calculator")}</span>
      </div>

      <div className="space-y-2.5">
        <div>
          <p className="text-[9px] text-gray-500 uppercase mb-1">{t("barter.have")}</p>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="w-20 rounded-lg border border-emerald-500/12 bg-[rgba(12,15,25,0.8)] px-2.5 py-2 text-xs text-white focus:border-emerald-400/40 focus:outline-none"
              aria-label="Quantity (kg)"
            />
            <select
              value={crop.crop}
              onChange={(e) => setCrop(EXCHANGE_RATES.find((r) => r.crop === e.target.value) || EXCHANGE_RATES[0])}
              className="flex-1 rounded-lg border border-emerald-500/12 bg-[rgba(12,15,25,0.8)] px-2 py-2 text-xs text-white focus:border-emerald-400/40 focus:outline-none"
              aria-label={t("grading.cropType")}
            >
              {EXCHANGE_RATES.map((r) => (
                <option key={r.crop} value={r.crop} className="bg-[#0f1117]">{r.emoji} {r.crop}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/20 p-3 text-center">
          <p className="text-[9px] text-gray-500 uppercase">Crop Credits</p>
          <p className="text-2xl font-bold text-emerald-300">{Math.round(credits * 10) / 10}</p>
          <p className="text-[9px] text-gray-500">≈ {crop.creditsPerKg} credits/kg</p>
        </div>

        <Button
          onClick={() => toast.success(t("barter.convertTrade"), { description: `${qty || 0} kg ${crop.crop} → ${Math.round(credits)} crop-credits` })}
          className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs py-3 gap-1.5"
        >
          <ArrowLeftRight className="h-3.5 w-3.5" /> {t("barter.convertTrade")}
        </Button>

        <div className="border-t border-emerald-500/10 pt-3">
          <p className="text-[9px] text-gray-500 uppercase mb-2 flex items-center gap-1"><Filter className="h-2.5 w-2.5" /> Rates</p>
          <div className="space-y-1">
            {EXCHANGE_RATES.map((r) => (
              <div key={r.crop} className="flex items-center justify-between text-[10px]">
                <span className="text-gray-400">{r.emoji} {r.crop}</span>
                <span className="text-gray-300">{r.creditsPerKg} credits/kg</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== LIST MY RESOURCE =====
function ListResourceModal({ onClose, onCreated }: { onClose: () => void; onCreated: (l: BarterListing) => void }) {
  const { t } = useI18n();
  const [type, setType] = useState<BarterListing["type"]>("equipment");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [credits, setCredits] = useState("");
  const [location, setLocation] = useState("");
  const [dates, setDates] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  const submit = () => {
    if (!title || !location) {
      toast.error("Please add a title and location");
      return;
    }
    const listing: BarterListing = {
      id: `user-${Date.now()}`,
      farmerName: "You (field agent)",
      location,
      type,
      title,
      description: desc || "Listed via AgriPulse barter network",
      creditValue: parseFloat(credits) || 40,
      creditUnit: "kg crop credits/day",
      available: true,
      rating: 5,
      tradesCompleted: 0,
      distanceKm: 0,
      pricePerDay: price ? `₹ ${price}/day` : undefined,
      creditPerDay: credits ? `${credits} kg crop-credits/day` : undefined,
      dates: dates || "Flexible",
      imageUrl: photo || undefined,
    };
    const existing = loadUserListings();
    localStorage.setItem(LOCAL_KEY, JSON.stringify([listing, ...existing]));
    onCreated(listing);
    toast.success(t("barter.submitted"));
    onClose();
  };

  const inputCls = "w-full rounded-lg border border-emerald-500/12 bg-[rgba(12,15,25,0.8)] px-3 py-2 text-xs text-white placeholder:text-gray-600 focus:border-emerald-400/40 focus:outline-none";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="relative w-full max-w-md rounded-2xl border border-emerald-500/15 bg-[rgba(18,22,36,0.98)] shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-white">{t("barter.listResource")}</h3>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-300">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[9px] text-gray-500 uppercase tracking-wider">{t("barter.listTitle")}</label>
            <div className="mt-1 flex gap-1.5">
              {(["equipment", "labor", "compost", "seeds", "other"] as const).map((ty) => (
                <button
                  key={ty}
                  onClick={() => setType(ty)}
                  className={`flex-1 rounded-lg border px-1 py-1.5 text-center text-base transition-all ${
                    type === ty ? "border-amber-400/40 bg-amber-500/10" : "border-emerald-500/10 bg-[rgba(12,15,25,0.5)]"
                  }`}
                  aria-label={t(`barter.${ty}`)}
                >
                  {TYPE_EMOJI[ty]}
                </button>
              ))}
            </div>
          </div>

          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Rotavator (2m width)" className={inputCls} />
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={t("barter.listDesc")} rows={2} className={inputCls} />

          <div className="grid grid-cols-2 gap-2">
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder={t("barter.listPrice")} className={inputCls} inputMode="numeric" />
            <input value={credits} onChange={(e) => setCredits(e.target.value)} placeholder={t("barter.listCredits")} className={inputCls} inputMode="numeric" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input value={dates} onChange={(e) => setDates(e.target.value)} placeholder={t("barter.listDates")} className={inputCls} />
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t("barter.listLocation")} className={inputCls} />
          </div>

          <label className="block cursor-pointer rounded-xl border-2 border-dashed border-emerald-500/20 bg-[rgba(12,15,25,0.5)] p-4 text-center hover:border-emerald-500/40 transition-all">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const r = new FileReader();
                r.onload = () => setPhoto(r.result as string);
                r.readAsDataURL(f);
              }}
            />
            {photo ? (
              <img src={photo} alt="Listing" className="mx-auto max-h-24 rounded-lg" />
            ) : (
              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500">
                <ImagePlus className="h-4 w-4" /> {t("barter.listPhoto")}
              </div>
            )}
          </label>

          <Button onClick={submit} className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs py-3.5">
            {t("barter.submit")}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
