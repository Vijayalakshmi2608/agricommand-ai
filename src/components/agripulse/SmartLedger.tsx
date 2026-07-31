import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  FileText, Hash, Shield, Copy, Check, ChevronLeft, ChevronRight,
  Plus, X, Scale, Lock, Truck, CheckCircle2, AlertTriangle, Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_ESCROW_TRADES } from "./data";
import { EscrowTrade, EscrowStatus } from "./types";
import { useI18n } from "./i18n";
import { enqueueAction, getOfflineState } from "./offline";

const STATUS_STYLES: Record<EscrowStatus, { badge: string; icon: React.ReactNode; labelKey: string }> = {
  locked: { badge: "bg-blue-500/10 text-blue-300 border-blue-500/25", icon: <Lock className="h-3 w-3" />, labelKey: "ledger.locked" },
  "in-transit": { badge: "bg-amber-500/10 text-amber-300 border-amber-500/25", icon: <Truck className="h-3 w-3" />, labelKey: "ledger.inTransit" },
  released: { badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25", icon: <CheckCircle2 className="h-3 w-3" />, labelKey: "ledger.released" },
  disputed: { badge: "bg-red-500/10 text-red-300 border-red-500/25", icon: <AlertTriangle className="h-3 w-3" />, labelKey: "ledger.disputed" },
  cancelled: { badge: "bg-gray-500/10 text-gray-400 border-gray-500/25", icon: <Ban className="h-3 w-3" />, labelKey: "ledger.cancelled" },
};

const PAGE_SIZE = 5;

export default function SmartLedger() {
  const { t } = useI18n();
  const [trades, setTrades] = useState<EscrowTrade[]>(MOCK_ESCROW_TRADES);
  const [page, setPage] = useState(0);
  const [detail, setDetail] = useState<EscrowTrade | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const pages = Math.ceil(trades.length / PAGE_SIZE);
  const pageRows = trades.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const active = trades.filter((tr) => tr.status === "locked" || tr.status === "in-transit").length;
  const completed = trades.filter((tr) => tr.status === "released").length;

  const copyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
    } catch {
      /* ignore */
    }
    setCopied(hash);
    toast.success(t("ledger.copied"));
    setTimeout(() => setCopied(null), 1500);
  };

  const createEscrow = (offer: string, request: string, amount: string) => {
    if (!getOfflineState().isOnline) {
      enqueueAction("escrow", { offer, request, amount });
      toast.warning(t("offline.queueHint"));
      setNewOpen(false);
      return;
    }
    const trade: EscrowTrade = {
      id: `esc-${Date.now()}`,
      hash: `0x${Math.random().toString(16).slice(2, 66)}`,
      type: offer.split(" ")[0] + " Exchange",
      parties: "You → Pending Counterparty",
      amount,
      status: "locked",
      time: "just now",
      terms: [`${amount} held in escrow until both parties confirm delivery`, "Dispute window closes 48h after release"],
      timeline: [`Created just now`, "Locked just now"],
      buyerScore: 94,
      sellerScore: 90,
    };
    setTrades((p) => [trade, ...p]);
    toast.success(t("ledger.createdToast"));
    setNewOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15">
            <FileText className="h-4.5 w-4.5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">{t("ledger.title")}</h2>
            <p className="text-[11px] text-gray-400">{t("ledger.sub")}</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setNewOpen(true)} className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[11px] gap-1.5">
          <Plus className="h-3.5 w-3.5" /> {t("ledger.newEscrow")}
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t("ledger.totalVolume"), value: "₹ 8,42,000", sub: "crop-credits settled" },
          { label: t("ledger.activeEscrows"), value: String(active), sub: "in progress" },
          { label: t("ledger.completed"), value: String(completed + 40), sub: "all time" },
          { label: t("ledger.avgTime"), value: "2.3 hrs", sub: "avg settlement" },
        ].map((s, i) => (
          <div key={i} className="glass-card p-3.5 text-center">
            <p className="text-[9px] text-gray-500 uppercase tracking-wider">{s.label}</p>
            <p className="text-lg font-bold text-white mt-0.5">{s.value}</p>
            <p className="text-[9px] text-gray-600">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        {/* Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-emerald-500/10 bg-[rgba(12,15,25,0.4)]">
                  <th className="text-left text-[9px] text-gray-400 uppercase tracking-wider px-4 py-2.5">{t("ledger.txHash")}</th>
                  <th className="text-left text-[9px] text-gray-400 uppercase tracking-wider px-3 py-2.5">{t("ledger.type")}</th>
                  <th className="hidden md:table-cell text-left text-[9px] text-gray-400 uppercase tracking-wider px-3 py-2.5">{t("ledger.parties")}</th>
                  <th className="text-left text-[9px] text-gray-400 uppercase tracking-wider px-3 py-2.5">{t("ledger.amount")}</th>
                  <th className="text-left text-[9px] text-gray-400 uppercase tracking-wider px-3 py-2.5">{t("ledger.status")}</th>
                  <th className="hidden sm:table-cell text-left text-[9px] text-gray-400 uppercase tracking-wider px-3 py-2.5">{t("ledger.timestamp")}</th>
                  <th className="text-right text-[9px] text-gray-400 uppercase tracking-wider px-4 py-2.5">{t("ledger.action")}</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((trade) => {
                  const st = STATUS_STYLES[trade.status];
                  return (
                    <tr key={trade.id} className="border-b border-emerald-500/5 hover:bg-emerald-500/5 transition-colors cursor-pointer" onClick={() => setDetail(trade)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Hash className="h-3 w-3 text-blue-400" />
                          <span className="font-mono text-[10px] text-gray-300">{trade.hash.slice(0, 10)}…{trade.hash.slice(-4)}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); copyHash(trade.hash); }}
                            className="text-gray-600 hover:text-emerald-300 transition-colors"
                            aria-label={t("ledger.copy")}
                          >
                            {copied === trade.hash ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-gray-300">{trade.type}</td>
                      <td className="hidden md:table-cell px-3 py-3 text-gray-400">{trade.parties}</td>
                      <td className="px-3 py-3 font-medium text-white">{trade.amount}</td>
                      <td className="px-3 py-3">
                        <Badge className={`${st.badge} text-[9px]`}>{st.icon} {t(st.labelKey)}</Badge>
                      </td>
                      <td className="hidden sm:table-cell px-3 py-3 text-gray-500">{trade.time}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-[10px] text-emerald-300 hover:underline">{t("ledger.view")}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-emerald-500/10">
            <p className="text-[9px] text-gray-600">{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, trades.length)} of {trades.length}</p>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/10 text-gray-400 hover:text-emerald-300 disabled:opacity-30"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {Array.from({ length: pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`h-7 w-7 rounded-lg text-[10px] transition-all ${page === i ? "bg-emerald-500/20 text-emerald-300" : "text-gray-500 hover:text-gray-300"}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
                disabled={page >= pages - 1}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/10 text-gray-400 hover:text-emerald-300 disabled:opacity-30"
                aria-label="Next page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Trust panel */}
        <div className="space-y-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-semibold text-white">{t("ledger.trustPanel")}</span>
            </div>
            <p className="text-3xl font-bold text-emerald-300">94<span className="text-sm text-gray-500">/100</span></p>
            <div className="mt-3 space-y-2.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-500">🤝 {t("ledger.successfulTrades")} (23)</span>
                <span className="font-semibold text-white">45 pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">🚚 {t("ledger.onTime")} (97%)</span>
                <span className="font-semibold text-white">28 pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">🛡 {t("ledger.noDisputes")}</span>
                <span className="font-semibold text-white">21 pts</span>
              </div>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-[rgba(12,15,25,0.6)] overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-400" style={{ width: "94%" }} />
            </div>
          </div>

          <div className="glass-card p-4 text-[10px] text-gray-500 leading-relaxed">
            <p className="text-xs text-gray-300 mb-2 flex items-center gap-1.5"><Scale className="h-3.5 w-3.5 text-blue-400" /> Arbitration</p>
            Disputes auto-escalate to a 3-member panel (2 FPO reps + 1 agri-engineer). Median resolution: <span className="text-white font-medium">14 hours</span>.
          </div>
        </div>
      </div>

      {/* Escrow detail modal */}
      <AnimatePresence>
        {detail && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDetail(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative w-full max-w-md rounded-2xl border border-blue-500/20 bg-[rgba(18,22,36,0.98)] shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">{t("ledger.modalTitle")}</h3>
                <button onClick={() => setDetail(null)} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-blue-500/10 hover:text-blue-300">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-4 rounded-xl bg-[rgba(12,15,25,0.6)] p-3">
                <p className="text-[9px] text-gray-500 uppercase mb-1">{t("ledger.txHash")}</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-[10px] text-gray-300 break-all">{detail.hash}</p>
                  <button onClick={() => copyHash(detail.hash)} className="text-gray-500 hover:text-blue-300 flex-shrink-0" aria-label={t("ledger.copy")}>
                    {copied === detail.hash ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <p className="text-[9px] text-gray-500 uppercase mb-2">{t("ledger.terms")}</p>
              <ul className="space-y-1.5 mb-4">
                {detail.terms.map((term, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-gray-300">
                    <span className="text-blue-400 mt-0.5">▸</span> {term}
                  </li>
                ))}
              </ul>

              <p className="text-[9px] text-gray-500 uppercase mb-2">{t("ledger.timeline")}</p>
              <div className="space-y-2 mb-4">
                {detail.timeline.map((step, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className={`h-2 w-2 rounded-full ${i === detail.timeline.length - 1 ? "bg-emerald-400" : "bg-blue-500/50"}`} />
                    <span className={`text-[11px] ${i === detail.timeline.length - 1 ? "text-emerald-300" : "text-gray-400"}`}>{step}</span>
                  </div>
                ))}
              </div>

              <p className="text-[9px] text-gray-500 uppercase mb-2">{t("ledger.partyScores")}</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="rounded-xl bg-emerald-500/5 p-2.5 text-center">
                  <p className="text-[9px] text-gray-500">Seller</p>
                  <p className="text-base font-bold text-emerald-300">{detail.sellerScore}</p>
                </div>
                <div className="rounded-xl bg-emerald-500/5 p-2.5 text-center">
                  <p className="text-[9px] text-gray-500">Buyer</p>
                  <p className="text-base font-bold text-emerald-300">{detail.buyerScore}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => toast.warning(t("ledger.arbitration"), { description: "Arbitration request filed — panel notified." })}
                  className="flex-1 rounded-xl border border-red-500/20 text-red-300 hover:bg-red-500/10 text-xs"
                >
                  <AlertTriangle className="h-3.5 w-3.5" /> {t("ledger.arbitration")}
                </Button>
                <Button onClick={() => setDetail(null)} className="flex-1 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/25 text-xs">
                  {t("common.close")}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New escrow modal */}
      <AnimatePresence>
        {newOpen && (
          <NewEscrowModal onClose={() => setNewOpen(false)} onCreate={createEscrow} />
        )}
      </AnimatePresence>
    </div>
  );
}

function NewEscrowModal({ onClose, onCreate }: { onClose: () => void; onCreate: (offer: string, request: string, amount: string) => void }) {
  const { t } = useI18n();
  const [offer, setOffer] = useState("");
  const [request, setRequest] = useState("");
  const [amount, setAmount] = useState("");

  const inputCls = "w-full rounded-lg border border-emerald-500/12 bg-[rgba(12,15,25,0.8)] px-3 py-2 text-xs text-white placeholder:text-gray-600 focus:border-blue-400/40 focus:outline-none";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="relative w-full max-w-sm rounded-2xl border border-blue-500/20 bg-[rgba(18,22,36,0.98)] shadow-2xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-white">{t("ledger.newTitle")}</h3>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-blue-500/10 hover:text-blue-300">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[10px] text-gray-500 mb-4">{t("ledger.newDesc")}</p>
        <div className="space-y-3">
          <div>
            <label className="text-[9px] text-gray-500 uppercase tracking-wider">{t("ledger.newOffer")}</label>
            <input value={offer} onChange={(e) => setOffer(e.target.value)} placeholder="e.g. John Deere Tractor (3 days)" className={`${inputCls} mt-1`} />
          </div>
          <div>
            <label className="text-[9px] text-gray-500 uppercase tracking-wider">{t("ledger.newRequest")}</label>
            <input value={request} onChange={(e) => setRequest(e.target.value)} placeholder="e.g. 2 tons vermicompost" className={`${inputCls} mt-1`} />
          </div>
          <div>
            <label className="text-[9px] text-gray-500 uppercase tracking-wider">{t("ledger.newAmount")}</label>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 150 kg wheat-credits" className={`${inputCls} mt-1`} />
          </div>
          <Button
            disabled={!offer || !request || !amount}
            onClick={() => onCreate(offer, request, amount)}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs py-3.5 disabled:opacity-40 gap-1.5"
          >
            <Lock className="h-3.5 w-3.5" /> {t("ledger.submit")}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
