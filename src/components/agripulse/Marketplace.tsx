import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ShoppingCart,
  Warehouse,
  Users,
  ArrowLeftRight,
  Handshake,
  Shield,
  CheckCircle2,
  Clock,
  Loader2,
  Tractor,
  Sprout,
  Search,
  Star,
  MapPin,
  Hash,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_BARTER_LISTINGS, MOCK_CROP_TRADES } from "./data";
import { BarterListing, CropCreditTrade } from "./types";

// ============================================================
// BARTER MARKETPLACE
// ============================================================
function BarterMarketplace() {
  const [listings] = useState<BarterListing[]>(MOCK_BARTER_LISTINGS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [tradeModal, setTradeModal] = useState<BarterListing | null>(null);

  const filtered = listings.filter((l) => {
    if (filter !== "all" && l.type !== filter) return false;
    if (search && !l.title.toLowerCase().includes(search.toLowerCase()) &&
        !l.farmerName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleOfferTrade = (listing: BarterListing) => {
    toast.success("Trade offer sent!", {
      description: `Offering ${listing.creditValue} ${listing.creditUnit} for "${listing.title}"`,
    });
    setTradeModal(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15">
          <Handshake className="h-4.5 w-4.5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Farmer Barter & Tool-Share Network</h2>
          <p className="text-[11px] text-gray-400">Trade equipment, labor, and supplies using crop credits</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listings..."
            className="w-full rounded-xl border border-emerald-500/12 bg-[rgba(12,15,25,0.8)] pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-gray-600 focus:border-emerald-400/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border border-emerald-500/12 bg-[rgba(12,15,25,0.8)] px-3 py-2.5 text-xs text-white focus:border-emerald-400/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
        >
          <option value="all" className="bg-[#0f1117]">All Types</option>
          <option value="equipment" className="bg-[#0f1117]">Equipment</option>
          <option value="labor" className="bg-[#0f1117]">Labor</option>
          <option value="compost" className="bg-[#0f1117]">Compost</option>
          <option value="seeds" className="bg-[#0f1117]">Seeds</option>
        </select>
      </div>

      {/* Listings Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((listing) => (
          <motion.div
            key={listing.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-4 transition-all cursor-pointer ${
              selectedListing === listing.id
                ? "border-emerald-400/30 bg-emerald-500/8 shadow-lg shadow-emerald-500/5"
                : "border-emerald-500/10 bg-[rgba(22,28,46,0.4)] hover:border-emerald-500/25 hover:bg-[rgba(22,28,46,0.6)]"
            }`}
            onClick={() => setSelectedListing(selectedListing === listing.id ? null : listing.id)}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-lg">
                {listing.type === "equipment" ? "🔧" : listing.type === "labor" ? "👥" : listing.type === "compost" ? "🌱" : "🌾"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{listing.title}</p>
                <p className="text-[10px] text-gray-400 truncate">{listing.farmerName}</p>
              </div>
              <Badge className={`text-[9px] ${
                listing.available
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                  : "bg-gray-500/10 text-gray-400 border-gray-500/20"
              }`}>
                {listing.available ? "Available" : "Rented"}
              </Badge>
            </div>

            <p className="text-[10px] text-gray-400 leading-relaxed mb-3 line-clamp-2">
              {listing.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Star className="h-3 w-3 text-amber-400" />
                <span className="text-[10px] text-gray-400">{listing.rating}</span>
                <span className="text-[9px] text-gray-600">({listing.tradesCompleted} trades)</span>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold text-emerald-300">
                  {listing.creditValue} credits
                </p>
                <p className="text-[8px] text-gray-500">per {listing.creditUnit.slice(0, 15)}...</p>
              </div>
            </div>

            {selectedListing === listing.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="mt-3 pt-3 border-t border-emerald-500/10"
              >
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-3 w-3 text-gray-500" />
                  <span className="text-[10px] text-gray-400">{listing.location}</span>
                </div>
                <Button
                  size="sm"
                  disabled={!listing.available}
                  onClick={(e) => { e.stopPropagation(); setTradeModal(listing); }}
                  className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] py-3 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40"
                >
                  <ArrowLeftRight className="h-3 w-3" />
                  Offer Trade (Crop Credits)
                </Button>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Trade Modal */}
      <AnimatePresence>
        {tradeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTradeModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-2xl border border-emerald-500/15 bg-[rgba(18,22,36,0.98)] shadow-2xl p-6"
            >
              <div className="text-center mb-5">
                <div className="text-3xl mb-2">🤝</div>
                <h3 className="text-sm font-semibold text-white">Crop-Credit Trade Offer</h3>
                <p className="text-[10px] text-gray-400 mt-1">{tradeModal.title}</p>
              </div>

              <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] text-gray-400">You offer:</span>
                  <span className="text-xs font-semibold text-emerald-300">
                    {tradeModal.creditValue} Crop Credits
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-400">You receive:</span>
                  <span className="text-xs font-semibold text-white">
                    {tradeModal.title} (2 days)
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-emerald-500/10">
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>Exchange rate:</span>
                    <span className="text-amber-300">
                      1 credit ≈ {Math.round(tradeModal.creditUnit.includes("kg") ? parseFloat(tradeModal.creditUnit) : 1)} kg crops
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setTradeModal(null)}
                  className="flex-1 rounded-xl border border-emerald-500/10 text-xs text-gray-400 hover:bg-emerald-500/5"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleOfferTrade(tradeModal)}
                  className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs py-4"
                >
                  <Handshake className="h-3.5 w-3.5" />
                  Confirm Trade
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// CROP-CREDIT LEDGER
// ============================================================
function CropCreditLedger() {
  const [trades] = useState<CropCreditTrade[]>(MOCK_CROP_TRADES);

  const statusIcon = (status: string) => {
    switch (status) {
      case "locked": return <LockIcon />;
      case "in-transit": return <TruckIcon />;
      case "released": return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      locked: "bg-blue-500/10 text-blue-300 border-blue-500/20",
      "in-transit": "bg-amber-500/10 text-amber-300 border-amber-500/20",
      released: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    };
    const labels: Record<string, string> = {
      locked: "🔒 Locked",
      "in-transit": "🚚 In-Transit",
      released: "✅ Released",
    };
    return (
      <Badge className={`${styles[status] || ""} text-[9px]`}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15">
          <FileText className="h-4.5 w-4.5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Smart-Contract Escrow & Crop-Credit Ledger</h2>
          <p className="text-[11px] text-gray-400">Transparent P2P barter trade settlement on simulated blockchain</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-emerald-500/10 bg-[rgba(22,28,46,0.4)] p-3.5 text-center">
          <p className="text-lg font-bold text-white">{trades.length}</p>
          <p className="text-[9px] text-gray-400">Total Trades</p>
        </div>
        <div className="rounded-xl border border-emerald-500/10 bg-[rgba(22,28,46,0.4)] p-3.5 text-center">
          <p className="text-lg font-bold text-emerald-300">
            {trades.filter(t => t.status === "released").length}
          </p>
          <p className="text-[9px] text-gray-400">Completed</p>
        </div>
        <div className="rounded-xl border border-emerald-500/10 bg-[rgba(22,28,46,0.4)] p-3.5 text-center">
          <p className="text-lg font-bold text-amber-300">
            {trades.reduce((s, t) => s + t.trustScore, 0) / trades.length}%
          </p>
          <p className="text-[9px] text-gray-400">Avg Trust</p>
        </div>
      </div>

      {/* Trades Table */}
      <div className="space-y-3">
        {trades.map((trade) => (
          <motion.div
            key={trade.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-emerald-500/10 bg-[rgba(22,28,46,0.4)] p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                  <Hash className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-white">
                    {trade.fromFarmer} → {trade.toFarmer}
                  </p>
                  <p className="text-[9px] text-gray-500 font-mono mt-0.5">
                    TX: {trade.txHash}
                  </p>
                </div>
              </div>
              {statusBadge(trade.status)}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="rounded-lg bg-emerald-500/5 p-2.5">
                <p className="text-[9px] text-gray-400 uppercase">Offering</p>
                <p className="text-xs text-white mt-0.5">{trade.offering}</p>
              </div>
              <div className="rounded-lg bg-amber-500/5 p-2.5">
                <p className="text-[9px] text-gray-400 uppercase">Requesting</p>
                <p className="text-xs text-white mt-0.5">{trade.requesting}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3 text-emerald-400" />
                <span className="text-[10px] text-gray-400">Trust Score: </span>
                <span className="text-[10px] font-semibold text-emerald-300">{trade.trustScore}%</span>
              </div>
              <span className="text-[9px] text-gray-500">
                {new Date(trade.timestamp).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg className="h-4 w-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 3h15v13H1z" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

// ============================================================
// EXPORT: MAIN MARKETPLACE CONTAINER
// ============================================================
export default function Marketplace() {
  const [activeTab, setActiveTab] = useState("barter");

  const tabs = [
    { id: "barter", label: "Barter Network", icon: Handshake },
    { id: "ledger", label: "Crop-Credit Ledger", icon: FileText },
  ];

  return (
    <div className="space-y-6 pb-8">
      <div className="flex gap-1 rounded-xl bg-[rgba(22,28,46,0.5)] border border-emerald-500/10 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[11px] font-medium transition-all ${
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

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === "barter" && <BarterMarketplace />}
          {activeTab === "ledger" && <CropCreditLedger />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
