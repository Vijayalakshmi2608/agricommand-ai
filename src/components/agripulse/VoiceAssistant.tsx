import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Mic, MicOff, Send, Sparkles, MessageSquare, History, Wand2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VoiceCommand } from "./types";
import { parseVoiceCommand } from "./ai";
import { useI18n } from "./i18n";
import { writePrefill } from "./ui-kit";

const INTENT_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  "market-price": { label: "Price Query", emoji: "💰", color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/25" },
  "log-batch": { label: "Crop Logging", emoji: "📋", color: "text-blue-300 bg-blue-500/10 border-blue-500/25" },
  "check-grade": { label: "Quality Check", emoji: "⭐", color: "text-amber-300 bg-amber-500/10 border-amber-500/25" },
  "find-barter": { label: "Barter Search", emoji: "🤝", color: "text-purple-300 bg-purple-500/10 border-purple-500/25" },
  "glut-check": { label: "Surplus Check", emoji: "⚠️", color: "text-red-300 bg-red-500/10 border-red-500/25" },
  unknown: { label: "General Query", emoji: "💬", color: "text-gray-300 bg-gray-500/10 border-gray-500/25" },
};

// Deterministic waveform bar heights
const BAR_HEIGHTS = Array.from({ length: 32 }, (_, i) => 10 + ((i * 37) % 22));

interface HistoryEntry {
  transcript: string;
  intent: string;
  confidence: number;
  at: string;
}

export default function VoiceAssistant() {
  const { t } = useI18n();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState<VoiceCommand | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [pressHeld, setPressHeld] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.error("Speech recognition not supported in this browser");
      setPressHeld(false);
      return;
    }
    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = "hi-IN";
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (event: any) => {
      const last = event.results.length - 1;
      setTranscript(event.results[last][0].transcript);
    };
    rec.onend = () => {
      setListening(false);
      setPressHeld(false);
    };
    rec.start();
    setListening(true);
  }, []);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    setListening(false);
    setPressHeld(false);
  }, []);

  const process = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setLoading(true);
    const result = await parseVoiceCommand(trimmed);
    setResponse(result);
    setLoading(false);
    setHistory((h) =>
      [
        { transcript: trimmed, intent: result.intent, confidence: result.confidence, at: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) },
        ...h,
      ].slice(0, 10),
    );
    toast.success(t("voice.processed"), {
      description: `${INTENT_LABELS[result.intent]?.label} (${Math.round(result.confidence * 100)}% ${t("voice.confidence")})`,
    });

    // Auto-fill the grading form for log-batch intent
    if (result.intent === "log-batch" && result.parsedData) {
      writePrefill({
        crop: result.parsedData.crop || "",
        quantity: result.parsedData.quantity || "",
        date: result.parsedData.date || "",
      });
      toast.info(t("voice.formFilled"), { description: result.parsedData.crop ? `${result.parsedData.crop} • ${result.parsedData.quantity}` : undefined });
    }
  };

  // On release, process what was heard
  useEffect(() => {
    if (!pressHeld && transcript && !listening) {
      process(transcript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pressHeld, listening]);

  const handleTextSubmit = () => {
    if (!inputText.trim()) return;
    setTranscript(inputText);
    process(inputText);
    setInputText("");
  };

  const examples = [
    "voice.example1",
    "voice.example2",
    "voice.example3",
    "voice.example4",
    "voice.example5",
  ];

  const chips = [
    "What is today's tomato price in Mumbai?",
    "Log 20 bags of potato harvest",
    "How to treat yellow leaf disease in rice?",
    "मेरे टमाटर का सही भाव क्या है?",
    "என் தக்காளிக்கு நல்ல விலை என்ன?",
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15">
          <Mic className="h-4.5 w-4.5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">{t("voice.title")}</h2>
          <p className="text-[11px] text-gray-400">{t("voice.sub")}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="glass-card p-5">
          {/* Waveform visualizer */}
          <div className={`flex h-24 items-center justify-center rounded-xl mb-4 transition-colors ${
            listening ? "bg-emerald-500/8 border border-emerald-500/15" : "bg-[rgba(12,15,25,0.5)]"
          }`}>
            {loading ? (
              <div className="flex items-center gap-1">
                {BAR_HEIGHTS.map((h, i) => (
                  <div key={i} className="w-1.5 rounded-full bg-amber-400 waveform-bar" style={{ animationDelay: `${i * 0.06}s`, height: `${h * 0.6}px` }} />
                ))}
              </div>
            ) : listening ? (
              <div className="flex items-center gap-1">
                {BAR_HEIGHTS.map((h, i) => (
                  <div key={i} className="w-1.5 rounded-full bg-gradient-to-t from-emerald-600 to-emerald-300 waveform-bar" style={{ animationDelay: `${i * 0.05}s`, height: `${h}px` }} />
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1 opacity-40">
                {BAR_HEIGHTS.slice(0, 24).map((h, i) => (
                  <div key={i} className="w-1.5 rounded-full bg-gray-500" style={{ height: `${h * 0.4}px` }} />
                ))}
              </div>
            )}
          </div>

          {/* Hold to speak */}
          <div className="flex flex-col items-center mb-4">
            <button
              onPointerDown={(e) => { e.preventDefault(); setPressHeld(true); setTranscript(""); startListening(); }}
              onPointerUp={() => { setPressHeld(true); stopListening(); }}
              onPointerLeave={() => { if (pressHeld) stopListening(); }}
              className={`relative h-20 w-20 rounded-full transition-all duration-300 select-none touch-none ${
                listening
                  ? "bg-gradient-to-r from-red-500 to-purple-600 shadow-lg shadow-red-500/30 scale-110"
                  : "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25 hover:scale-105"
              }`}
              aria-label={t("voice.hold")}
            >
              {listening ? <Mic className="h-7 w-7 text-white mx-auto" /> : <MicOff className="h-7 w-7 text-white mx-auto" />}
              {listening && (
                <span className="absolute -top-1 -right-1 h-4 w-4">
                  <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-60" />
                  <span className="absolute inset-0 rounded-full bg-red-400" />
                </span>
              )}
            </button>
            <p className="mt-2.5 text-[11px] text-gray-400">
              {listening ? t("voice.recording") : `🎤 ${t("voice.hold")}`}
            </p>
          </div>

          {/* Text input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
              placeholder={t("voice.placeholder")}
              className="flex-1 rounded-xl border border-emerald-500/12 bg-[rgba(12,15,25,0.8)] px-4 py-2.5 text-xs text-white placeholder:text-gray-600 focus:border-emerald-400/40 focus:outline-none"
            />
            <Button onClick={handleTextSubmit} disabled={!inputText.trim() || loading} size="sm" className="rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/20">
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Example chips */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {examples.map((k, i) => (
              <button
                key={k}
                onClick={() => { setInputText(chips[i]); }}
                className="rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1 text-[10px] text-gray-400 hover:text-purple-300 hover:border-purple-500/40 transition-all"
              >
                {t(k)}
              </button>
            ))}
          </div>

          {/* Transcript */}
          <AnimatePresence>
            {transcript && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 rounded-xl bg-purple-500/5 border border-purple-500/10 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-purple-400" />
                  <span className="text-[10px] font-medium text-gray-400 uppercase">Transcript</span>
                </div>
                <p className="text-xs text-gray-300">"{transcript}"</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Response */}
          <AnimatePresence>
            {response && !loading && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-3.5">
                <div className="flex items-center justify-between mb-2.5">
                  <Badge className={`${INTENT_LABELS[response.intent]?.color || ""} text-[9px]`}>
                    {INTENT_LABELS[response.intent]?.emoji} {INTENT_LABELS[response.intent]?.label}
                  </Badge>
                  <span className="text-[9px] text-gray-500">{Math.round(response.confidence * 100)}% {t("voice.confidence")}</span>
                </div>

                {response.intent === "market-price" && response.parsedData ? (
                  <div className="rounded-xl bg-[rgba(12,15,25,0.6)] p-3">
                    <p className="text-[9px] text-gray-500 uppercase mb-1.5 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-emerald-400" /> {t("voice.priceCard")}
                    </p>
                    <div className="space-y-1 text-[11px]">
                      {Object.entries(response.parsedData).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-gray-500 capitalize">{k.replace(/([A-Z])/g, " $1")}</span>
                          <span className="text-gray-200 font-medium">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <pre className="text-[11px] text-gray-300 font-sans whitespace-pre-wrap">
                    {JSON.stringify(response.parsedData, null, 2)}
                  </pre>
                )}

                {response.intent === "log-batch" && (
                  <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-2 text-[10px] text-blue-300">
                    <Wand2 className="h-3 w-3" /> {t("voice.formFilled")}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Conversation history */}
        <div className="glass-card p-4 h-fit max-h-[480px] overflow-y-auto">
          <div className="flex items-center gap-2 mb-3">
            <History className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-semibold text-white">{t("voice.history")}</span>
          </div>
          {history.length === 0 ? (
            <p className="text-[10px] text-gray-600 text-center py-8">—</p>
          ) : (
            <div className="space-y-2.5">
              {history.map((h, i) => (
                <div key={i} className="rounded-xl bg-[rgba(12,15,25,0.5)] p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-gray-500">{h.at}</span>
                    <Badge className={`${INTENT_LABELS[h.intent]?.color || ""} text-[8px]`}>{INTENT_LABELS[h.intent]?.label}</Badge>
                  </div>
                  <p className="text-[10px] text-gray-300 line-clamp-2">{h.transcript}</p>
                </div>
              ))}
            </div>
          )}
          {history.length > 0 && (
            <p className="mt-3 flex items-center justify-center gap-1 text-[9px] text-emerald-400/70">
              <CheckCircle2 className="h-2.5 w-2.5" /> Last 10 exchanges stored locally
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
