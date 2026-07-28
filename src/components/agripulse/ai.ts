import { CropGradeInput, CropGradeResult, GlutAlert, VoiceCommand } from "./types";
import { MOCK_GLUT_ALERTS } from "./data";

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

const MODELS = {
  primary: "openai/gpt-4o-mini",
  fallback: "openai/gpt-4o-mini",
};

export function getOpenRouterKey(): string | null {
  try {
    return localStorage.getItem("agripulse-openrouter-key");
  } catch {
    return null;
  }
}

export function setOpenRouterKey(key: string): void {
  try {
    localStorage.setItem("agripulse-openrouter-key", key);
  } catch {
    // silently fail
  }
}

function generateBatchId(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AGP-${date}-${rand}`;
}

// ===== INTELLIGENT MOCK SYSTEM =====

function getMockGrade(cropType: string, _weight: number): CropGradeResult {
  const score = 85 + Math.floor(Math.random() * 15);
  const grade =
    score >= 96 ? "A+" :
    score >= 90 ? "A" :
    score >= 85 ? "A-" :
    score >= 80 ? "B+" : "B";

  const shelfLife: Record<string, number> = {
    "Alphonso Mangoes": 7, "Organic Tomatoes": 14, "Basmati Rice": 365,
    "Red Potatoes": 21, "Green Bell Peppers": 10, "Fresh Turmeric": 180,
    "Sugar Cane": 7, "Cotton": 730,
  };

  const price: Record<string, number> = {
    "Alphonso Mangoes": 4.50, "Organic Tomatoes": 2.80, "Basmati Rice": 3.20,
    "Red Potatoes": 1.50, "Green Bell Peppers": 3.00, "Fresh Turmeric": 5.50,
    "Sugar Cane": 0.40, "Cotton": 2.10,
  };

  const shelfDays = (shelfLife[cropType] || 14) * (score / 100);
  const basePrice = price[cropType] || 2.50;
  const pricePremium = basePrice * (score / 85);

  const tips: Record<string, string[]> = {
    "Alphonso Mangoes": ["Store at 12-14°C with 85-90% humidity", "Keep away from ethylene-producing fruits", "Layer with paper to prevent bruising", "Use ventilated crates for transport"],
    "Organic Tomatoes": ["Maintain 10-12°C storage temperature", "Store stem-end up to prevent moisture loss", "Avoid refrigeration below 8°C", "Use breathable packaging with ventilation"],
    "Basmati Rice": ["Store in airtight containers", "Keep below 25°C for optimal aging", "Add neem leaves for natural pest prevention", "Maintain relative humidity below 65%"],
    "Red Potatoes": ["Store in dark, cool place at 7-10°C", "Keep away from onions (they cause sprouting)", "Use paper bags for air circulation", "Remove sprouts before storage"],
    "Green Bell Peppers": ["Refrigerate at 7-10°C in perforated bags", "Keep dry - moisture causes decay", "Use within 5-7 days for best quality", "Store away from ripe fruits"],
    "Fresh Turmeric": ["Store in cool, dark place at 12-15°C", "Wrap in dry newspaper to absorb moisture", "Can be frozen for up to 6 months", "Dry in sun for extended shelf life"],
    "Sugar Cane": ["Stand upright in cool shaded area", "Keep cut ends in shallow water", "Use within 5-7 days of harvest", "Refrigerate peeled pieces in water"],
    "Cotton": ["Store in dry warehouse below 12% moisture", "Maintain temperature below 35°C", "Use bale covers to prevent contamination", "Keep away from chemical storage"],
  };

  return {
    grade,
    score,
    shelfLifeDays: Math.round(shelfDays),
    pricePerKg: Math.round(pricePremium * 100) / 100,
    storageTips: tips[cropType] || ["Store in cool, dry place"],
    carbonScore: 70 + Math.floor(Math.random() * 25),
    soilScore: 65 + Math.floor(Math.random() * 30),
    foodMilesSaved: 200 + Math.floor(Math.random() * 300),
    solarStoragePercent: 80 + Math.floor(Math.random() * 20),
    certifications: ["Quality Verified", "AI-Graded"],
    batchId: generateBatchId(),
  };
}

function getMockGlutResponse(): string {
  const alerts = MOCK_GLUT_ALERTS;
  return JSON.stringify(alerts.map(a => ({
    crop: a.cropType,
    zone: a.zone,
    surplusTons: a.surplusTons,
    risk: a.riskLevel,
    rerouteTo: a.demandZone,
    profitRecovery: `₹${a.projectedNetProfit.toLocaleString()}`,
  })));
}

function getMockVoiceResponse(intent: string): string {
  switch (intent) {
    case "market-price":
      return JSON.stringify({
        crop: "Organic Tomatoes",
        market: "Mumbai APMC",
        pricePerKg: "₹42-48",
        trend: "↑ 5% from last week",
        volume: "2,400 quintals",
      });
    case "log-batch":
      return JSON.stringify({
        action: "logged",
        crop: "Potatoes",
        quantity: "20 bags (50kg each)",
        batchId: generateBatchId(),
        timestamp: new Date().toISOString(),
      });
    case "check-grade":
      return JSON.stringify({
        grade: "A-",
        score: "87%",
        recommendation: "Ready for premium market sale",
      });
    default:
      return JSON.stringify({
        message: "I understood your request. Please provide more details.",
        confidence: 0.45,
      });
  }
}

// ===== OPENROUTER API CALL =====

async function callOpenRouter(
  messages: { role: string; content: any }[],
  apiKey: string,
): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(OPENROUTER_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "AgriPulse AI",
      },
      body: JSON.stringify({
        model: MODELS.primary,
        messages,
        max_tokens: 800,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn("OpenRouter API error:", response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.warn("OpenRouter call failed:", err);
    return null;
  }
}

// ===== PUBLIC API FUNCTIONS =====

export async function gradeCrop(input: CropGradeInput): Promise<CropGradeResult> {
  const apiKey = getOpenRouterKey();
  const mockResult = getMockGrade(input.cropType, input.weight);

  if (!apiKey || !input.imageBase64) {
    return mockResult;
  }

  const prompt = `You are an expert agricultural quality inspector. Grade this ${input.cropType} crop based on the image provided.

Crop: ${input.cropType}
Weight: ${input.weight} kg
Harvest Date: ${input.harvestDate}
Location ZIP: ${input.zipCode}

Return a JSON object with these fields:
- grade: overall quality grade (A+, A, A-, B+, B)
- score: numeric score out of 100
- shelfLifeDays: estimated shelf life in days
- pricePerKg: recommended fair market price per kg in USD
- carbonScore: estimated carbon footprint score out of 100
- soilScore: estimated soil health score out of 100
- foodMilesSaved: estimated food miles saved vs conventional supply chain
- solarStoragePercent: estimated % of renewable energy used in storage
- certifications: array of relevant quality certifications
- storageTips: array of 3-4 storage optimization tips`;

  const aiResponse = await callOpenRouter([
    {
      role: "user",
      content: [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: input.imageBase64 } },
      ],
    },
  ], apiKey);

  if (aiResponse) {
    try {
      const parsed = JSON.parse(aiResponse);
      return {
        grade: parsed.grade || mockResult.grade,
        score: parsed.score || mockResult.score,
        shelfLifeDays: parsed.shelfLifeDays || mockResult.shelfLifeDays,
        pricePerKg: parsed.pricePerKg || mockResult.pricePerKg,
        storageTips: parsed.storageTips || mockResult.storageTips,
        carbonScore: parsed.carbonScore || mockResult.carbonScore,
        soilScore: parsed.soilScore || mockResult.soilScore,
        foodMilesSaved: parsed.foodMilesSaved || mockResult.foodMilesSaved,
        solarStoragePercent: parsed.solarStoragePercent || mockResult.solarStoragePercent,
        certifications: parsed.certifications || mockResult.certifications,
        batchId: mockResult.batchId,
      };
    } catch {
      return mockResult;
    }
  }

  return mockResult;
}

export async function getGlutAlerts(): Promise<GlutAlert[]> {
  const apiKey = getOpenRouterKey();

  if (!apiKey) {
    return MOCK_GLUT_ALERTS;
  }

  const prompt = `You are an agricultural supply chain analyst. Based on current market data, generate 4 simulated regional oversupply (glut) alerts for different crops across Indian agricultural zones.

Return a JSON array where each object has:
- cropType: crop name
- zone: zone name like "North-1", "South-2", etc.
- surplusTons: surplus amount in tons
- riskLevel: "low", "medium", "high", or "critical"
- demandZone: where there is deficit demand
- demandDeficitTons: deficit amount in tons
- transitTime: transit time estimate like "2 days"
- fuelCostOffset: fuel cost offset in INR
- projectedNetProfit: projected net profit recovery in INR
- routeDistance: distance string`;

  const aiResponse = await callOpenRouter([
    { role: "user", content: prompt },
  ], apiKey);

  if (aiResponse) {
    try {
      const parsed = JSON.parse(aiResponse);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((a: any, i: number) => ({
          id: `glut-${i + 1}`,
          cropType: a.cropType || "Unknown",
          zone: a.zone || "Unknown",
          surplusTons: a.surplusTons || 0,
          riskLevel: a.riskLevel || "medium",
          demandZone: a.demandZone || "Unknown",
          demandDeficitTons: a.demandDeficitTons || 0,
          transitTime: a.transitTime || "N/A",
          fuelCostOffset: a.fuelCostOffset || 0,
          projectedNetProfit: a.projectedNetProfit || 0,
          routeDistance: a.routeDistance || "N/A",
        }));
      }
    } catch {
      return MOCK_GLUT_ALERTS;
    }
  }

  return MOCK_GLUT_ALERTS;
}

export async function parseVoiceCommand(transcript: string): Promise<VoiceCommand> {
  const apiKey = getOpenRouterKey();

  // Detect intent from transcript
  const lower = transcript.toLowerCase();
  let intent: VoiceCommand["intent"] = "unknown";
  if (lower.includes("price") || lower.includes("rate") || lower.includes("market")) {
    intent = "market-price";
  } else if (lower.includes("log") || lower.includes("record") || lower.includes("bag") || lower.includes("batch")) {
    intent = "log-batch";
  } else if (lower.includes("grade") || lower.includes("quality") || lower.includes("inspect")) {
    intent = "check-grade";
  } else if (lower.includes("barter") || lower.includes("trade") || lower.includes("exchange") || lower.includes("rent")) {
    intent = "find-barter";
  } else if (lower.includes("glut") || lower.includes("surplus") || lower.includes("oversupply")) {
    intent = "glut-check";
  }

  if (!apiKey) {
    return {
      transcript,
      intent,
      confidence: 0.85,
      parsedData: JSON.parse(getMockVoiceResponse(intent)),
    };
  }

  const prompt = `You are a multilingual agricultural voice assistant supporting Indian regional languages. Parse the following farmer's voice command and return ONLY a JSON object:

Command: "${transcript}"

Detect the intent and extract data. Return JSON with:
- "intent": one of ["market-price", "log-batch", "check-grade", "find-barter", "glut-check", "unknown"]
- "confidence": number 0-1
- "parsedData": object with relevant extracted fields

For regional language terms, translate to English equivalents.`;

  const aiResponse = await callOpenRouter([
    { role: "user", content: prompt },
  ], apiKey);

  if (aiResponse) {
    try {
      const parsed = JSON.parse(aiResponse);
      return {
        transcript,
        intent: parsed.intent || intent,
        confidence: parsed.confidence || 0.7,
        parsedData: parsed.parsedData || {},
      };
    } catch {
      // fall through to mock
    }
  }

  return {
    transcript,
    intent,
    confidence: 0.85,
    parsedData: JSON.parse(getMockVoiceResponse(intent)),
  };
}

export async function generateSustainabilityReport(passport: any): Promise<string> {
  const apiKey = getOpenRouterKey();

  if (!apiKey) {
    return JSON.stringify({
      summary: "Excellent sustainable farming practices verified.",
      impact: "This batch demonstrates regenerative agriculture principles with high soil health and minimal carbon footprint. The 100% solar cold storage utilization is exceptional.",
      recommendations: [
        "Consider incorporating cover cropping to further improve soil biodiversity",
        "Expand solar storage capacity for neighboring farms",
        "Apply for premium carbon credit certification",
      ],
    });
  }

  const prompt = `Generate a sustainability assessment report for this agricultural batch:
${JSON.stringify(passport, null, 2)}

Return a JSON with:
- summary: 2-3 sentence assessment
- impact: detailed environmental impact analysis
- recommendations: 3 actionable improvement suggestions`;

  const aiResponse = await callOpenRouter([
    { role: "user", content: prompt },
  ], apiKey);

  if (aiResponse) return aiResponse;

  return JSON.stringify({
    summary: "Sustainable practices detected. Detailed AI analysis pending.",
    impact: "Mock assessment based on provided metrics.",
    recommendations: ["Continue current soil management practices"],
  });
}
