# 🌾 AgriPulse AI: Autonomous Agtech Command Center

**Hackathon Submission — Next-Gen Autonomous Agriculture, Decentralized Barter & Consumer Trust Infrastructure**

![Status](https://img.shields.io/badge/status-live--demo--ready-10B981?style=flat-square)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20Tailwind-059669?style=flat-square)
![Backend](https://img.shields.io/badge/backend-zero--cost%20client--side-1a1a1a?style=flat-square)

---

## 🚀 Executive Summary

Agriculture today runs on a broken feedback loop: surplus produce rots in one region while a neighboring city pays inflated prices for the same crop. Farmers set prices blind, with no real-time market intelligence. Urban buyers who want sustainably grown food have no way to verify what "sustainable" even means for the item in their cart.

**AgriPulse AI** is a single, zero-backend command center that closes all three gaps at once — combining AI-powered crop grading, predictive glut detection with automatic rerouting, a decentralized barter economy for rural resources, and a fully verifiable soil-to-shelf carbon passport. It runs entirely client-side, so it demos flawlessly with no server to crash mid-judging.

---

## 🌟 Architecture at a Glance

```
[ 🌾 Farmer Operations Mode ]                    [ 🛒 Consumer Marketplace Mode ]
  ├── AI Crop Intake & Grading                     ├── Soil-to-Shelf Carbon Passport
  ├── Voice-First Agri-Dialect Assistant           ├── Live Urban Produce Marketplace
  ├── Predictive Glut Detector & Rerouter          ├── QR-Code Supply Chain Auditing
  └── P2P Barter & Crop-Credit Ledger              └── Smart-Contract Escrow Tracking
```

Every module shares one design language — deep charcoal/slate dark mode with emerald-green accents, glassmorphism panels, and smooth state transitions — so switching between the two modes feels like one coherent product, not two bolted-together demos.

---

## 🧩 Core Modules

### 1. AI Crop Intake & Grading Portal
Farmers enter crop type, weight, harvest date, and zip code, then upload a photo. The app calls an AI vision model (via OpenRouter, `openai/gpt-4o-mini`) to return:
- Auto-graded quality score (e.g. **Grade A+ — 98%**)
- Estimated shelf-life countdown (e.g. **14 days**)
- Recommended fair-market price per kg
- Optimal storage condition tips

If no API key is set, an intelligent mock-response engine generates realistic results instantly — the demo never breaks.

### 2. Predictive Regional Glut Detector & Smart Rerouter
A live dashboard simulates regional harvest volumes across zones. When a crop crosses an oversupply threshold, the app raises a pulsing **"⚠️ Price Crash Risk"** alert and automatically computes a rerouting plan to the nearest deficit city — including transit time, fuel-cost offset, and projected profit recovery.

### 3. Farmer-to-Farmer Barter & Tool-Share Net
A peer-to-peer board where farmers list idle tractors, tillers, seasonal labor, or surplus compost. Trades settle in **crop-credit notes** instead of cash (e.g. 50 kg of wheat credit ⇄ 2 days of tractor use), with a live exchange-rate calculator.

### 4. Soil-to-Shelf Carbon Passport
Every validated batch gets a digital passport with verified metrics:
- Regenerative Soil Score (e.g. 92/100, no-till verified)
- Solar-powered cold storage utilization
- Food miles saved vs. commercial baseline

A QR-code simulation lets Marketplace-mode buyers scan and trace a batch's full journey — building trust with eco-conscious consumers.

### 5. Voice-First "Agri-Dialect" Field Assistant
A hands-free voice widget with a live audio waveform visualizer. Farmers speak or type in regional vernacular — *"What's the tomato price in Mumbai?"* or *"Log 20 bags of potatoes"* — and the assistant parses intent and auto-fills the relevant form. Built for low-literacy, hands-busy field use.

### 6. Smart-Contract Escrow & Crop-Credit Ledger
A transparent ledger visualizing barter settlements through simulated smart contracts — transaction hashes, escrow states (**Locked → In-Transit → Released**), and trust metrics for rural micro-economies.

---

## 🛠️ Tech Stack

| Layer | Choice |
|---|---|
| Framework | React / Next.js component architecture |
| Styling | Tailwind CSS, glassmorphism, Lucide icons |
| AI Engine | OpenRouter API (`openai/gpt-4o-mini`), vision + text |
| State/Storage | Client-side only — `localStorage` for API key & session data |
| Hosting | Vercel / Netlify / GitHub Pages — zero backend, zero DB |

Everything runs in the browser. There is no server to provision, no database to seed, and no risk of a live-judging outage.

---

## 🏃 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-username/agripulse-ai.git

# 2. Move into the project
cd agripulse-ai

# 3. Install dependencies
npm install

# 4. Run the dev server
npm run dev
```

Open `http://localhost:3000`, click the ⚙️ **API Settings** icon in the header, and paste a free OpenRouter API key — or skip it entirely and the app runs on its built-in intelligent mock mode.


---

## 📌 Roadmap (Post-Hackathon)

- Real satellite/weather data feed for the Glut Detector
- Actual blockchain settlement layer for the Crop-Credit Ledger (currently simulated)
- Native mobile app for offline field use
- Multi-language voice model fine-tuned on regional dialects

---

*Built for hackathon judging — designed to run instantly, demo flawlessly, and scale honestly beyond the stage.*
