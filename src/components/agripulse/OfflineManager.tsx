import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { useI18n } from "./i18n";
import { subscribeOffline, getOfflineState, setOnline, flushQueue } from "./offline";

export default function OfflineManager() {
  const { t } = useI18n();
  const [state, setState] = useState(getOfflineState());

  useEffect(() => {
    const unsub = subscribeOffline(() => setState(getOfflineState()));
    const onOffline = () => setOnline(false);
    const onOnline = () => setOnline(true);
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      unsub();
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  const [syncedFlash, setSyncedFlash] = useState(false);

  useEffect(() => {
    if (state.syncing && state.pending === 0) {
      setSyncedFlash(true);
      const id = setTimeout(() => setSyncedFlash(false), 3000);
      return () => clearTimeout(id);
    }
  }, [state.syncing, state.pending]);

  return (
    <AnimatePresence>
      {(!state.isOnline || state.syncing || syncedFlash) && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className={`sticky top-16 z-30 w-full ${state.isOnline ? "bg-emerald-500/15 border-emerald-500/30" : "bg-red-500/15 border-red-500/30"} border-b backdrop-blur-xl`}
          role="status"
          aria-live="polite"
        >
          <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-center gap-2 text-[11px]">
            {!state.isOnline ? (
              <>
                <WifiOff className="h-3.5 w-3.5 text-red-300" />
                <span className="text-red-200">{t("offline.banner")}</span>
              </>
            ) : syncedFlash ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                <span className="text-emerald-200">{t("offline.synced")}</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5 text-emerald-300 animate-spin" />
                <span className="text-emerald-200">{t("offline.syncing", { n: state.pending })}</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { flushQueue };
