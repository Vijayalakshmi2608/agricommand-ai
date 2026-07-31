import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, BarChart3, Sparkles, ArrowUpRight, ArrowUpDown, Wallet, Award, Droplets } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { MOCK_GRADE_HISTORY, MOCK_CROP_MIX } from "./data";
import { DailyGradeData } from "./types";
import { useI18n } from "./i18n";

const PIE_COLORS = ["#10B981", "#F59E0B", "#3B82F6", "#A855F7", "#EF4444", "#6B7280"];

// ===== CUSTOM TOOLTIP =====
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-emerald-500/15 bg-[rgba(18,22,36,0.95)] backdrop-blur-xl shadow-2xl p-3 min-w-[160px]">
      <p className="text-[10px] text-gray-400 mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4 text-[11px]">
          <span className="text-gray-300" style={{ color: entry.color }}>
            {entry.name}
          </span>
          <span className="font-semibold text-white">
            {entry.value}
            {entry.name === "Avg Price" ? "$/kg" : entry.name === "Submissions" ? "" : "%"}
          </span>
        </div>
      ))}
    </div>
  );
}

// ===== STAT CHIP =====
function StatChip({ label, value, trend, color = "emerald" }: {
  label: string;
  value: string;
  trend: "up" | "down" | "stable";
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-emerald-500/10 bg-[rgba(22,28,46,0.4)] p-3.5">
      <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-end justify-between">
        <p className="text-lg font-bold text-white">{value}</p>
        {trend === "up" && <TrendingUp className={`h-4 w-4 text-${color}-400`} />}
        {trend === "down" && <TrendingDown className="h-4 w-4 text-red-400" />}
      </div>
    </div>
  );
}

// ===== MAIN ANALYTICS COMPONENT =====
export default function Analytics() {
  const data: DailyGradeData[] = MOCK_GRADE_HISTORY;
  const [chartView, setChartView] = useState<"line" | "area" | "bar">("line");
  const [sortKey, setSortKey] = useState<keyof DailyGradeData | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const arr = [...data];
    arr.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (typeof va === "number" && typeof vb === "number") return sortDir === "asc" ? va - vb : vb - va;
      return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return arr;
  }, [data, sortKey, sortDir]);

  const toggleSort = (key: keyof DailyGradeData) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  // Calculate trends
  const firstDay = data[0];
  const lastDay = data[data.length - 1];
  const scoreTrend = lastDay.avgScore - firstDay.avgScore;
  const priceTrend = lastDay.avgPrice - firstDay.avgPrice;
  const submissionTrend = lastDay.submissions - firstDay.submissions;
  const avgScore = Math.round(data.reduce((s, d) => s + d.avgScore, 0) / data.length);
  const avgPrice = (data.reduce((s, d) => s + d.avgPrice, 0) / data.length).toFixed(2);
  const totalSubmissions = data.reduce((s, d) => s + d.submissions, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15">
          <BarChart3 className="h-4.5 w-4.5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">7-Day Grade Trends & Analytics</h2>
          <p className="text-[11px] text-gray-400">Real-time quality metrics and market intelligence</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-emerald-500/10 bg-[rgba(22,28,46,0.4)] p-3.5">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <p className="text-[9px] text-gray-400 uppercase tracking-wider">Avg Quality Score</p>
          </div>
          <p className="text-lg font-bold text-white">91.4%</p>
          <p className="text-[9px] text-emerald-300">↑ 2.3% this week</p>
        </div>
        <div className="rounded-xl border border-emerald-500/10 bg-[rgba(22,28,46,0.4)] p-3.5">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="h-3.5 w-3.5 text-amber-400" />
            <p className="text-[9px] text-gray-400 uppercase tracking-wider">Revenue (month)</p>
          </div>
          <p className="text-lg font-bold text-white">₹ 2,84,000</p>
          <p className="text-[9px] text-emerald-300">↑ 18%</p>
        </div>
        <div className="rounded-xl border border-emerald-500/10 bg-[rgba(22,28,46,0.4)] p-3.5">
          <div className="flex items-center gap-2 mb-1">
            <Award className="h-3.5 w-3.5 text-blue-400" />
            <p className="text-[9px] text-gray-400 uppercase tracking-wider">Batches graded</p>
          </div>
          <p className="text-lg font-bold text-white">23</p>
          <p className="text-[9px] text-emerald-300">↑ 5 vs last week</p>
        </div>
        <div className="rounded-xl border border-emerald-500/10 bg-[rgba(22,28,46,0.4)] p-3.5">
          <div className="flex items-center gap-2 mb-1">
            <Droplets className="h-3.5 w-3.5 text-emerald-400" />
            <p className="text-[9px] text-gray-400 uppercase tracking-wider">Carbon credits</p>
          </div>
          <p className="text-lg font-bold text-emerald-300">142</p>
          <p className="text-[9px] text-gray-500">new feature</p>
        </div>
      </div>

      {/* Top-level Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatChip
          label="Avg Quality Score"
          value={`${avgScore}%`}
          trend={scoreTrend >= 0 ? "up" : "down"}
        />
        <StatChip
          label="Avg Price / kg"
          value={`$${avgPrice}`}
          trend={priceTrend >= 0 ? "up" : "down"}
        />
        <StatChip
          label="Submissions (7d)"
          value={totalSubmissions.toString()}
          trend={submissionTrend >= 0 ? "up" : "down"}
        />
        <div className="rounded-xl border border-emerald-500/10 bg-[rgba(22,28,46,0.4)] p-3.5">
          <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-1">Best Grade</p>
          <div className="flex items-end justify-between">
            <p className="text-lg font-bold text-emerald-400">{lastDay.topGrade}</p>
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Chart Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-lg bg-[rgba(22,28,46,0.5)] border border-emerald-500/10 p-0.5">
          {(["line", "area", "bar"] as const).map((view) => (
            <button
              key={view}
              onClick={() => setChartView(view)}
              className={`rounded-md px-3 py-1.5 text-[10px] font-medium transition-all ${
                chartView === view
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-[9px]">
          {scoreTrend > 0 ? "+" : ""}{scoreTrend}% this week
        </Badge>
      </div>

      {/* Main Chart — Quality Score Trend */}
      <motion.div
        key={chartView}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border border-emerald-500/10 bg-[rgba(22,28,46,0.4)] p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-white">Quality Score & Price Trends</p>
            <p className="text-[9px] text-gray-500">Daily average across all submissions</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-[9px] text-gray-400">Score</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="text-[9px] text-gray-400">Price</span>
            </div>
          </div>
        </div>

        <div className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === "line" ? (
              <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[70, 100]}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[2, 4]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="avgScore"
                  name="Quality Score"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ fill: "#10B981", r: 4, strokeWidth: 2, stroke: "#0f1117" }}
                  activeDot={{ r: 6, fill: "#10B981" }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgPrice"
                  name="Avg Price"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  dot={{ fill: "#F59E0B", r: 4, strokeWidth: 2, stroke: "#0f1117" }}
                  activeDot={{ r: 6, fill: "#F59E0B" }}
                />
              </LineChart>
            ) : chartView === "area" ? (
              <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[65, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="avgScore"
                  name="Quality Score"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fill="url(#scoreGrad)"
                  dot={{ fill: "#10B981", r: 4, strokeWidth: 2, stroke: "#0f1117" }}
                />
              </AreaChart>
            ) : (
              <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="avgScore"
                  name="Quality Score"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                  opacity={0.8}
                />
                <Bar
                  dataKey="avgCarbonScore"
                  name="Carbon Score"
                  fill="#34D399"
                  radius={[4, 4, 0, 0]}
                  opacity={0.6}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {chartView === "bar" && (
          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-400 opacity-80" />
              <span className="text-[9px] text-gray-400">Quality Score</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-300 opacity-60" />
              <span className="text-[9px] text-gray-400">Carbon Score</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Secondary Row — Soil & Carbon Trends + Submissions Volume */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Soil & Carbon Scores */}
        <div className="rounded-xl border border-emerald-500/10 bg-[rgba(22,28,46,0.4)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-white">Soil & Carbon Health</p>
              <p className="text-[9px] text-gray-500">Sustainability metrics trend</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-[8px] text-gray-400">Soil</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-emerald-200" />
                <span className="text-[8px] text-gray-400">Carbon</span>
              </div>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 9 }} axisLine={false} tickLine={false} domain={[60, 95]} />
                <Tooltip content={<CustomTooltip />} />
                <defs>
                  <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="carbonGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6EE7B7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6EE7B7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="avgSoilScore" name="Soil Score" stroke="#10B981" strokeWidth={2} fill="url(#soilGrad)" dot={{ r: 3, fill: "#10B981" }} />
                <Area type="monotone" dataKey="avgCarbonScore" name="Carbon Score" stroke="#6EE7B7" strokeWidth={2} fill="url(#carbonGrad2)" dot={{ r: 3, fill: "#6EE7B7" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Submissions Volume */}
        <div className="rounded-xl border border-emerald-500/10 bg-[rgba(22,28,46,0.4)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-white">Daily Submission Volume</p>
              <p className="text-[9px] text-gray-500">Number of crops graded per day</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-medium">
              <ArrowUpRight className="h-3 w-3" />
              {submissionTrend > 0 ? "+" : ""}{submissionTrend} trend
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="submissions" name="Submissions" fill="#10B981" radius={[3, 3, 0, 0]} opacity={0.7}>
                  {data.map((entry, index) => (
                    <rect key={index} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Crop Mix Pie */}
      <div className="rounded-xl border border-emerald-500/10 bg-[rgba(22,28,46,0.4)] p-5">
        <div className="mb-4">
          <p className="text-xs font-semibold text-white">Crop Mix — This Month</p>
          <p className="text-[9px] text-gray-500">Distribution of crops graded by type</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="h-52 w-52 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={MOCK_CROP_MIX} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} strokeWidth={0}>
                  {MOCK_CROP_MIX.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 w-full space-y-2">
            {MOCK_CROP_MIX.map((slice, i) => (
              <div key={slice.name} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-gray-300">{slice.name}</span>
                </div>
                <span className="font-semibold text-white">{slice.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Breakdown Table */}
      <div className="rounded-xl border border-emerald-500/10 bg-[rgba(22,28,46,0.4)] p-5">
        <p className="text-xs font-semibold text-white mb-4">Daily Grade Breakdown</p>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-emerald-500/10">
                {([
                  { key: "label", label: "Date", align: "left" },
                  { key: "avgScore", label: "Avg Score", align: "left" },
                  { key: "topGrade", label: "Top Grade", align: "left" },
                  { key: "avgPrice", label: "Price", align: "left" },
                  { key: "avgShelfLife", label: "Shelf Life", align: "left" },
                  { key: "submissions", label: "Submissions", align: "right" },
                ] as { key: keyof DailyGradeData; label: string; align: "left" | "right" }[]).map((col) => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className={`${col.align === "right" ? "text-right" : "text-left"} text-[9px] text-gray-400 uppercase tracking-wider pb-2 pr-4 cursor-pointer hover:text-emerald-300 select-none transition-colors`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      <ArrowUpDown className={`h-2.5 w-2.5 ${sortKey === col.key ? "text-emerald-400" : "text-gray-600"}`} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, i) => (
                <tr
                  key={row.date}
                  className={`border-b border-emerald-500/5 hover:bg-emerald-500/5 transition-colors ${
                    i === data.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  <td className="py-2.5 pr-4 text-gray-300">{row.label}</td>
                  <td className="py-2.5 pr-4">
                    <span className={`font-medium ${row.avgScore >= 90 ? "text-emerald-300" : row.avgScore >= 85 ? "text-amber-300" : "text-orange-300"}`}>
                      {row.avgScore}%
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className={`font-medium ${
                      row.topGrade === "A+" ? "text-emerald-300" :
                      row.topGrade === "A" ? "text-emerald-400" :
                      "text-amber-300"
                    }`}>
                      {row.topGrade}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-gray-300">${row.avgPrice.toFixed(2)}</td>
                  <td className="py-2.5 pr-4 text-gray-300">{row.avgShelfLife}d</td>
                  <td className="py-2.5 text-right text-gray-300">{row.submissions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
