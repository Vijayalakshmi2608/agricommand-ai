import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router";
import {
  Sprout,
  Tractor,
  ShoppingCart,
  ArrowRight,
  Shield,
  Leaf,
  BarChart3,
  Mic,
  Handshake,
  FileText,
  CheckCircle2,
  Star,
  MapPin,
  ChevronRight,
  Sparkles,
  Globe,
  TrendingUp,
  Users,
  Warehouse,
  Sun,
  Droplets,
  Scan,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function Landing() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-400/3 rounded-full blur-[100px]" />

        <motion.div
          style={{ opacity }}
          className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[10px] font-medium text-emerald-300 tracking-wider uppercase">
              Now Live • Autonomous Agtech Platform
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]"
          >
            <span className="bg-gradient-to-r from-white via-white to-emerald-200 bg-clip-text text-transparent">
              AgriPulse AI
            </span>
            <br />
            <span className="text-emerald-400">Autonomous Agtech</span>
            <br />
            <span className="text-emerald-400">Command Center</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-base sm:text-lg text-gray-400 max-w-2xl leading-relaxed"
          >
            AI-powered platform for regenerative farming, real-time market intelligence,
            peer-to-peer barter networks, and verifiable carbon credit tracking.
            <span className="block mt-2 text-emerald-300/70 text-sm">
              Empowering 150M+ Indian farmers with autonomous agtech.
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          >
            <Button
              onClick={() => navigate("/dashboard")}
              className="group relative h-12 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 shadow-2xl shadow-emerald-500/25 text-sm font-semibold"
            >
              Launch Command Center
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="h-12 px-8 rounded-2xl border-emerald-500/20 text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-300 text-sm"
            >
              <Sprout className="mr-2 h-4 w-4" />
              Explore Farmer Ops
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 w-full max-w-2xl"
          >
            {[
              { value: "150M+", label: "Farmers Empowered" },
              { value: "12K+", label: "Daily Trades" },
              { value: "98%", label: "Grading Accuracy" },
              { value: "340M", label: "kg CO₂ Tracked" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <div className="flex flex-col items-center gap-2 text-gray-600">
              <span className="text-[9px] uppercase tracking-widest">Scroll</span>
              <div className="h-8 w-[1px] bg-gradient-to-b from-emerald-500/50 to-transparent" />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="relative px-4 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white">
            <span className="text-emerald-400">Seven Integrated</span> Capabilities
          </h2>
          <p className="mt-3 text-sm text-gray-400 max-w-xl mx-auto">
            From AI crop grading to blockchain-verified carbon passports — everything in one command center.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Leaf,
              label: "AI Crop Grading",
              desc: "Vision-powered quality assessment with OpenRouter AI. Grades A+ through B with shelf-life predictions and fair pricing.",
              gradient: "from-emerald-500/20 to-emerald-600/5",
              border: "border-emerald-500/15",
              color: "text-emerald-400",
            },
            {
              icon: BarChart3,
              label: "Glut Detection & Rerouting",
              desc: "Predictive oversupply alerts with smart rerouting. Calculates optimal shipping routes, fuel costs, and profit recovery.",
              gradient: "from-amber-500/20 to-amber-600/5",
              border: "border-amber-500/15",
              color: "text-amber-400",
            },
            {
              icon: Handshake,
              label: "Barter & Tool-Share Network",
              desc: "P2P marketplace for equipment, labor, and compost. Trade using crop-credit notes instead of cash.",
              gradient: "from-blue-500/20 to-blue-600/5",
              border: "border-blue-500/15",
              color: "text-blue-400",
            },
            {
              icon: Shield,
              label: "Carbon Passport",
              desc: "Soil-to-shelf sustainability tracking with QR verification. Soil score, solar storage %, and food miles saved.",
              gradient: "from-emerald-500/20 to-teal-600/5",
              border: "border-teal-500/15",
              color: "text-teal-400",
            },
            {
              icon: Mic,
              label: "Voice Field Assistant",
              desc: "Multilingual voice commands in Hindi, Marathi, Tamil & English. Real-time speech-to-intent parsing.",
              gradient: "from-purple-500/20 to-purple-600/5",
              border: "border-purple-500/15",
              color: "text-purple-400",
            },
            {
              icon: FileText,
              label: "Smart-Contract Ledger",
              desc: "Transparent escrow with simulated blockchain hashes. Lock → In-Transit → Released via crop-credit verification.",
              gradient: "from-cyan-500/20 to-cyan-600/5",
              border: "border-cyan-500/15",
              color: "text-cyan-400",
            },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl border ${feature.border} bg-gradient-to-br ${feature.gradient} p-6 hover:scale-[1.02] transition-all duration-300`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${feature.border} bg-[rgba(12,15,25,0.5)] mb-4`}>
                  <Icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{feature.label}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ===== MODES SECTION ===== */}
      <section className="relative px-4 py-24 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Farmer Mode */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-8 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/20 mb-5">
              <Tractor className="h-7 w-7 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              <span className="text-emerald-400">🌾</span> Farmer Operations
            </h3>
            <ul className="space-y-3 mb-6">
              {[
                "AI crop grading & quality assessment",
                "Predictive glut detection & smart rerouting",
                "Soil-to-shelf carbon passport generation",
                "Voice field assistant in 6 languages",
                "P2P barter & tool-sharing network",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Button
              onClick={() => navigate("/dashboard")}
              className="w-full rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/30 text-xs py-5"
            >
              Open Farmer Command Center
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </motion.div>

          {/* Consumer Mode */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-amber-500/15 bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-8 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/20 mb-5">
              <ShoppingCart className="h-7 w-7 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              <span className="text-amber-400">🛒</span> Consumer Marketplace
            </h3>
            <ul className="space-y-3 mb-6">
              {[
                "Verified sustainable produce sourcing",
                "Full lifecycle transparency via QR codes",
                "Crop-credit barter exchange rates",
                "Smart-contract escrow trade settlement",
                "Build trust metrics for rural micro-economies",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Button
              onClick={() => navigate("/dashboard")}
              className="w-full rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/20 hover:bg-amber-500/30 text-xs py-5"
            >
              Open Consumer Marketplace
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="relative px-4 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-emerald-500/10 bg-gradient-to-br from-[rgba(16,185,129,0.08)] to-[rgba(5,150,105,0.03)] p-12"
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Sprout className="h-12 w-12 text-emerald-400" />
                <span className="absolute -top-1 -right-1 h-4 w-4">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-50" />
                  <span className="absolute inset-0 rounded-full bg-emerald-400" />
                </span>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to Transform Indian Agriculture?
            </h2>
            <p className="text-sm text-gray-400 mb-8 max-w-lg mx-auto">
              No sign-up required. Launch the command center instantly and experience
              the future of autonomous agtech.
            </p>
            <Button
              onClick={() => navigate("/dashboard")}
              className="h-14 px-10 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 shadow-2xl shadow-emerald-500/25 text-base font-semibold"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Launch AgriPulse AI Now
            </Button>
            <p className="mt-4 text-[10px] text-gray-600">
              Free • No registration • Works instantly with intelligent mock AI
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-emerald-500/10 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sprout className="h-4 w-4 text-emerald-400" />
            <span className="text-xs text-gray-500">AgriPulse AI v1.0</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-[10px] text-gray-600">Autonomous Agtech Command Center</span>
            <span className="text-[10px] text-gray-600">Powered by OpenRouter AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function LandingPage() {
  return <Landing />;
}
