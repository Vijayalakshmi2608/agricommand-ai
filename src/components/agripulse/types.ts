export type AppMode = "farmer" | "consumer";

// ============ CROP GRADING ============
export interface CropGradeInput {
  cropType: string;
  weight: number;
  harvestDate: string;
  zipCode: string;
  imageBase64?: string;
  state?: string;
  district?: string;
  moisture?: number;
  organic?: boolean;
}

export interface CropGradeResult {
  grade: string;
  score: number;
  shelfLifeDays: number;
  pricePerKg: number;
  storageTips: string[];
  carbonScore: number;
  soilScore: number;
  foodMilesSaved: number;
  solarStoragePercent: number;
  certifications: string[];
  batchId: string;
  reasoning?: string[];
}

export type CropCategory = "Fruits" | "Vegetables" | "Grains" | "Pulses" | "Cash Crops";

export interface CropOption {
  name: string;
  category: CropCategory;
  emoji: string;
}

export const CROP_OPTIONS: CropOption[] = [
  { name: "Alphonso Mango", category: "Fruits", emoji: "🥭" },
  { name: "Kesar Mango", category: "Fruits", emoji: "🥭" },
  { name: "Banana", category: "Fruits", emoji: "🍌" },
  { name: "Papaya", category: "Fruits", emoji: "🍈" },
  { name: "Pomegranate", category: "Fruits", emoji: "🍎" },
  { name: "Organic Tomato", category: "Vegetables", emoji: "🍅" },
  { name: "Onion", category: "Vegetables", emoji: "🧅" },
  { name: "Potato", category: "Vegetables", emoji: "🥔" },
  { name: "Cauliflower", category: "Vegetables", emoji: "🥦" },
  { name: "Bitter Gourd", category: "Vegetables", emoji: "🥒" },
  { name: "Green Bell Pepper", category: "Vegetables", emoji: "🫑" },
  { name: "Basmati Rice", category: "Grains", emoji: "🌾" },
  { name: "Wheat", category: "Grains", emoji: "🌾" },
  { name: "Jowar", category: "Grains", emoji: "🌾" },
  { name: "Bajra", category: "Grains", emoji: "🌾" },
  { name: "Maize", category: "Grains", emoji: "🌽" },
  { name: "Chana Dal", category: "Pulses", emoji: "🫘" },
  { name: "Toor Dal", category: "Pulses", emoji: "🫘" },
  { name: "Masoor Dal", category: "Pulses", emoji: "🫘" },
  { name: "Cotton", category: "Cash Crops", emoji: "☁️" },
  { name: "Sugarcane", category: "Cash Crops", emoji: "🎋" },
  { name: "Turmeric", category: "Cash Crops", emoji: "🌱" },
];

export const CROP_TYPES: string[] = CROP_OPTIONS.map((c) => c.name);

export const CROP_IMAGES: Record<string, string> = Object.fromEntries(
  CROP_OPTIONS.map((c) => [c.name, c.emoji]),
);

export const INDIAN_STATES: string[] = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

// ============ GLUT DETECTOR ============
export type GlutLevel = "critical" | "high" | "normal" | "deficit";

export interface StateGlut {
  state: string;
  level: GlutLevel;
  crop: string;
  surplusPct: number;
  priceNow: string;
  priceWas: string;
  timeLeftHrs: number;
}

export interface ReroutePlan {
  origin: string;
  originSurplus: string;
  destination: string;
  destDeficit: string;
  distance: string;
  transit: string;
  capacity: string;
  costFuel: number;
  costToll: number;
  costLoading: number;
  netProfit: number;
  localSale: number;
}

export interface GlutAlert {
  id: string;
  cropType: string;
  zone: string;
  surplusTons: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  demandZone: string;
  demandDeficitTons: number;
  transitTime: string;
  fuelCostOffset: number;
  projectedNetProfit: number;
  routeDistance: string;
}

// ============ BARTER ============
export interface BarterListing {
  id: string;
  farmerName: string;
  location: string;
  type: "equipment" | "labor" | "compost" | "seeds" | "other";
  title: string;
  description: string;
  creditValue: number;
  creditUnit: string;
  imageUrl?: string;
  available: boolean;
  rating: number;
  tradesCompleted: number;
  distanceKm?: number;
  pricePerDay?: string;
  creditPerDay?: string;
  dates?: string;
}

export interface ExchangeRate {
  crop: string;
  creditsPerKg: number;
  emoji: string;
}

// ============ CARBON PASSPORT ============
export interface CarbonPassport {
  batchId: string;
  cropType: string;
  farmer: string;
  location: string;
  harvestDate: string;
  soilScore: number;
  solarStoragePercent: number;
  foodMilesSaved: number;
  certifications: string[];
  co2Sequestered: number;
  waterSaved: number;
  biodiversityScore: number;
  waterEfficiency?: number;
  carbonFootprint?: number;
  carbonBaseline?: number;
  route?: string[];
}

// ============ VOICE ============
export interface VoiceCommand {
  transcript: string;
  intent: "market-price" | "log-batch" | "check-grade" | "find-barter" | "glut-check" | "unknown";
  confidence: number;
  parsedData?: Record<string, string>;
}

// ============ LEDGER ============
export type EscrowStatus = "locked" | "in-transit" | "released" | "disputed" | "cancelled";

export interface EscrowTrade {
  id: string;
  hash: string;
  type: string;
  parties: string;
  amount: string;
  status: EscrowStatus;
  time: string;
  terms: string[];
  timeline: string[];
  buyerScore: number;
  sellerScore: number;
}

export interface CropCreditTrade {
  id: string;
  fromFarmer: string;
  toFarmer: string;
  offering: string;
  requesting: string;
  creditAmount: number;
  status: "locked" | "in-transit" | "released";
  txHash: string;
  timestamp: string;
  trustScore: number;
}

// ============ MARKETPLACE ============
export interface MarketProduct {
  id: string;
  name: string;
  emoji: string;
  farm: string;
  farmer: string;
  location: string;
  distanceKm: number;
  pricePerKg: number;
  grade: string;
  carbonScore: number;
  shelfLifeDays: number;
  organic: boolean;
  carbonCertified: boolean;
  passportId: string;
  foodMiles: number;
}

export interface ConsumerImpactPoint {
  month: string;
  carbonSaved: number;
  foodMiles: number;
  farmersSupported: number;
  organicPct: number;
}

// ============ SDG ============
export interface SDGTarget {
  id: string;
  number: number;
  name: string;
  color: string;
  target: string;
  how: string;
  metric: string;
}

// ============ WEATHER ============
export interface WeatherData {
  source: "live" | "mock";
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  soilTemp: number;
  forecast: { day: string; tMax: number; tMin: number; condition: string }[];
  recommendation: string;
}

// ============ ANALYTICS ============
export interface DailyGradeData {
  date: string;
  label: string;
  avgScore: number;
  avgPrice: number;
  avgCarbonScore: number;
  avgSoilScore: number;
  submissions: number;
  avgShelfLife: number;
  topGrade: string;
  waterEfficiency?: number;
}

export interface CropMixSlice {
  name: string;
  value: number;
}

// ============ IMPACT ============
export interface PilotStat {
  labelKey: string;
  value: string;
  prefix?: string;
  suffix?: string;
}

export interface BeforeAfterRow {
  labelKey: string;
  before: string;
  after: string;
  change: string;
}

export interface Testimonial {
  name: string;
  village: string;
  crop: string;
  quote: string;
}

// ============ OPENROUTER ============
export interface OpenRouterResponse {
  id: string;
  choices: { message: { content: string } }[];
}

export const ZONES = [
  "North-1", "North-2", "North-3", "North-4",
  "South-1", "South-2", "South-3",
  "East-1", "East-2",
  "West-1", "West-2", "West-3",
];
