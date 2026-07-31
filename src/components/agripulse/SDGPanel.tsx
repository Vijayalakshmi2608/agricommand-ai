import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, X } from "lucide-react";
import { MOCK_SDGS } from "./data";
import { useI18n } from "./i18n";

export default function SDGPanel() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.6, type: "spring", bounce: 0.4 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 flex items-center gap-2 rounded-full border border-emerald-500/30 bg-[rgba(18,22,36,0.9)] backdrop-blur-xl px-4 py-3 shadow-2xl shadow-emerald-500/10 hover:bg-emerald-500/15 transition-all group"
        aria-label={t("sdg.button")}
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <span className="text-[10px] font-semibold text-emerald-300">SDG Impact</span>
        <span className="text-sm">🌍</span>
      </motion.button>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[110]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-emerald-500/15 bg-[rgba(15,17,23,0.98)] p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-base font-semibold text-white">🌍 {t("sdg.title")}</h2>
                  <p className="text-[10px] text-gray-500 mt-0.5 max-w-xs">{t("sdg.sub")}</p>
                </div>
                <button onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-300">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {MOCK_SDGS.map((sdg) => (
                  <motion.div
                    key={sdg.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * sdg.number }}
                    className="rounded-2xl border border-emerald-500/10 bg-[rgba(22,28,46,0.4)] p-4"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white font-bold text-sm"
                        style={{ background: sdg.color }}
                      >
                        {sdg.number}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">SDG {sdg.number} — {sdg.name}</p>
                        <p className="text-[9px] text-emerald-400/80 uppercase tracking-wider mt-0.5">{t("sdg.target")}: {sdg.target}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Target className="h-3 w-3 text-emerald-400" /> {t("sdg.how")}
                    </p>
                    <p className="text-[11px] text-gray-300 leading-relaxed mb-3">{sdg.how}</p>
                    <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/15 px-3 py-2">
                      <p className="text-[9px] text-gray-500 uppercase tracking-wider">{t("sdg.metric")}</p>
                      <p className="text-[11px] font-medium text-emerald-300 mt-0.5">📊 {sdg.metric}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
