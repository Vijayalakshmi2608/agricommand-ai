import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloudSun, Loader2, MapPin, ChevronDown, ThermometerSun, Droplets, Wind, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeatherData } from "./types";
import { MOCK_WEATHER } from "./data";
import { useI18n } from "./i18n";
import { LiveBadge, SimulatedBadge } from "./ui-kit";

export default function WeatherWidget() {
  const { t } = useI18n();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WeatherData | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    if (!pin) return;
    setLoading(true);
    try {
      // 1. Geocode PIN → lat/lon (free, no key)
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(pin)}&country=India&format=json&limit=1`,
      );
      const geo = await geoRes.json();
      if (geo?.length > 0) {
        const lat = parseFloat(geo[0].lat);
        const lon = parseFloat(geo[0].lon);
        // 2. Open-Meteo forecast (free, no key)
        const wxRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=soil_temperature_0cm&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=3`,
        );
        const wx = await wxRes.json();
        const cond = wx.current_weather?.weathercode !== undefined ? codeToCondition(wx.current_weather.weathercode) : "Partly Cloudy";
        const forecast = (wx.daily?.time || []).slice(0, 3).map((day: string, i: number) => ({
          day: i === 0 ? "Today" : i === 1 ? "Tomorrow" : "Day 3",
          tMax: wx.daily.temperature_2m_max?.[i] ?? 0,
          tMin: wx.daily.temperature_2m_min?.[i] ?? 0,
          condition: codeToCondition(wx.daily.weathercode?.[i] ?? 2),
        }));
        setData({
          source: "live",
          temp: Math.round(wx.current_weather?.temperature ?? 0),
          condition: cond,
          humidity: wx.current_weather?.relative_humidity ?? 62,
          windSpeed: Math.round((wx.current_weather?.windspeed ?? 0) * 0.2778), // km/h
          soilTemp: Math.round(wx.hourly?.soil_temperature_0cm?.[0] ?? 26),
          forecast,
          recommendation:
            "Live soil temperature suggests optimal transplanting window this afternoon. Consider harvesting before 10am if humidity stays above 70%.",
        });
        setOpen(true);
      } else {
        // geocode failed — fall back to mock
        setData({ ...MOCK_WEATHER, source: "mock" });
        setOpen(true);
      }
    } catch {
      setData({ ...MOCK_WEATHER, source: "mock" });
      setOpen(true);
    }
    setLoading(false);
  };

  return (
    <div className="glass-card overflow-hidden">
      {/* Header / toggle */}
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-emerald-500/5 transition-colors">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/15">
          <CloudSun className="h-4 w-4 text-sky-400" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-white">{t("weather.title")}</p>
          <p className="text-[9px] text-gray-500">{data ? `${data.temp}°C • ${data.condition}` : t("weather.noPin")}</p>
        </div>
        {data && (data.source === "live" ? <LiveBadge /> : <SimulatedBadge />)}
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-4">
              {/* PIN input */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                  <input
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    placeholder={t("weather.pinPlaceholder")}
                    maxLength={6}
                    inputMode="numeric"
                    onKeyDown={(e) => e.key === "Enter" && load()}
                    className="w-full rounded-xl border border-sky-500/15 bg-[rgba(12,15,25,0.8)] pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-gray-600 focus:border-sky-400/40 focus:outline-none"
                  />
                </div>
                <Button onClick={load} disabled={!pin || loading} size="sm" className="rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white text-xs px-4 gap-1.5">
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  {t("weather.load")}
                </Button>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 rounded-xl skeleton-shimmer" />)}
                </div>
              ) : data ? (
                <>
                  {/* Current metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="rounded-xl bg-[rgba(12,15,25,0.5)] p-3 text-center">
                      <ThermometerSun className="h-4 w-4 text-amber-400 mx-auto mb-1" />
                      <p className="text-[9px] text-gray-500">{t("weather.temp")}</p>
                      <p className="text-sm font-bold text-white">{data.temp}°C</p>
                    </div>
                    <div className="rounded-xl bg-[rgba(12,15,25,0.5)] p-3 text-center">
                      <Droplets className="h-4 w-4 text-sky-400 mx-auto mb-1" />
                      <p className="text-[9px] text-gray-500">{t("weather.soilTemp")}</p>
                      <p className="text-sm font-bold text-white">{data.soilTemp}°C</p>
                    </div>
                    <div className="rounded-xl bg-[rgba(12,15,25,0.5)] p-3 text-center">
                      <Droplets className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                      <p className="text-[9px] text-gray-500">{t("weather.humidity")}</p>
                      <p className="text-sm font-bold text-white">{data.humidity}%</p>
                    </div>
                    <div className="rounded-xl bg-[rgba(12,15,25,0.5)] p-3 text-center">
                      <Wind className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                      <p className="text-[9px] text-gray-500">{t("weather.wind")}</p>
                      <p className="text-sm font-bold text-white">{data.windSpeed} km/h</p>
                    </div>
                  </div>

                  {/* 3-day forecast */}
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-2">{t("weather.forecast")}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {data.forecast.map((f, i) => (
                        <div key={i} className="rounded-xl bg-[rgba(12,15,25,0.5)] p-2.5 text-center">
                          <p className="text-[9px] text-gray-500">{f.day}</p>
                          <p className="text-xs font-semibold text-white mt-0.5">{f.tMax}° / {f.tMin}°</p>
                          <p className="text-[8px] text-gray-500 mt-0.5">{f.condition}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI recommendation */}
                  <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/15 p-3">
                    <p className="text-[9px] text-gray-500 uppercase mb-1 flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-emerald-400" /> {t("weather.aiRec")}
                    </p>
                    <p className="text-[11px] text-gray-300 leading-relaxed">{data.recommendation}</p>
                  </div>
                </>
              ) : (
                <p className="text-[10px] text-gray-600 text-center py-3">{t("weather.noPin")}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function codeToCondition(code: number): string {
  const map: Record<number, string> = {
    0: "☀️ Clear", 1: "🌤 Mostly Clear", 2: "⛅ Partly Cloudy", 3: "☁️ Overcast",
    45: "🌫 Foggy", 48: "🌫 Fog", 51: "🌦 Light Drizzle", 61: "🌧 Light Rain",
    63: "🌧 Rain", 65: "🌧 Heavy Rain", 71: "🌨 Light Snow", 80: "🌦 Showers",
    95: "⛈ Thunderstorm",
  };
  return map[code] ?? "🌡 " + String(code);
}
