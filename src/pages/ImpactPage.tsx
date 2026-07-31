import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Sprout, TrendingUp, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOCK_PILOT_STATS, MOCK_BEFORE_AFTER, MOCK_TESTIMONIALS } from "@/components/agripulse/data";
import { CountUp } from "@/components/agripulse/ui-kit";
import { useI18n, I18nProvider } from "@/components/agripulse/i18n";

function ImpactInner() {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground bg-dot-grid">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 pb-16">
        {/* Back + header */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-4 py-2 text-xs text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-300 transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {t("common.back")}
        </button>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[10px] font-medium text-emerald-300 tracking-wider uppercase">Field-verified</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            {t("impact.title")}
          </h1>
          <p className="mt-2 text-sm text-emerald-300/90 font-medium">{t("impact.sub")}</p>
          <p className="mt-3 text-xs text-gray-500 max-w-xl mx-auto leading-relaxed">
            A 47-farmer pilot run across Nashik district (Maharashtra) — India's tomato belt.
            Results measured over 30 days with FPO-partnered logistics.
          </p>
        </div>

        {/* Pilot stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-12">
          {MOCK_PILOT_STATS.map((stat, i) => (
            <motion.div
              key={stat.labelKey}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-4 text-center"
            >
              <p className="text-xl font-bold text-emerald-300">
                <CountUp value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </p>
              <p className="text-[9px] text-gray-500 mt-1 uppercase tracking-wider">{t(stat.labelKey)}</p>
            </motion.div>
          ))}
        </div>

        {/* Before / After */}
        <div className="glass-card overflow-hidden mb-12">
          <div className="px-5 py-4 border-b border-emerald-500/10">
            <p className="text-sm font-semibold text-white">{t("impact.beforeAfter")}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-emerald-500/10 bg-[rgba(12,15,25,0.4)]">
                  <th className="text-left text-[9px] text-gray-400 uppercase tracking-wider px-5 py-3">Metric</th>
                  <th className="text-left text-[9px] text-gray-400 uppercase tracking-wider px-4 py-3">{t("impact.before")}</th>
                  <th className="text-left text-[9px] text-gray-400 uppercase tracking-wider px-4 py-3">{t("impact.after")}</th>
                  <th className="text-right text-[9px] text-gray-400 uppercase tracking-wider px-5 py-3">{t("impact.change")}</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_BEFORE_AFTER.map((row, i) => {
                  const positive = row.change.startsWith("+");
                  return (
                    <tr key={i} className="border-b border-emerald-500/5 hover:bg-emerald-500/5 transition-colors">
                      <td className="px-5 py-3 text-gray-300">{t(row.labelKey)}</td>
                      <td className="px-4 py-3 text-gray-500 line-through">{row.before}</td>
                      <td className="px-4 py-3 font-semibold text-white">{row.after}</td>
                      <td className={`px-5 py-3 text-right font-bold ${positive ? "text-emerald-300" : "text-red-300"}`}>
                        {row.change}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Testimonials */}
        <div>
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-400" /> {t("impact.testimonials")}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {MOCK_TESTIMONIALS.map((tm, i) => (
              <motion.div
                key={tm.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-600/10 border border-emerald-500/25 text-xs font-bold text-emerald-300">
                    {tm.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{tm.name}</p>
                    <p className="text-[9px] text-gray-500">{tm.village} • {tm.crop}</p>
                  </div>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">"{tm.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button
            onClick={() => navigate("/dashboard")}
            className="h-12 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 shadow-2xl shadow-emerald-500/25 text-sm font-semibold gap-2"
          >
            <Sprout className="h-4 w-4" /> Launch Command Center
          </Button>
          <p className="mt-3 text-[10px] text-gray-600 flex items-center justify-center gap-1">
            <TrendingUp className="h-3 w-3" /> Methodology: FPO records + mandi receipts + farmer interviews (n=47)
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ImpactPage() {
  return (
    <I18nProvider>
      <ImpactInner />
    </I18nProvider>
  );
}
