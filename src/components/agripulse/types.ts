export type AppMode = "farmer" | "consumer";

export interface CropGradeInput {
  cropType: string;
  weight: number;
  harvestDate: string;
  zipCode: string;
  imageBase64?: string;
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
}

export interface VoiceCommand {
  transcript: string;
  intent: "market-price" | "log-batch" | "check-grade" | "find-barter" | "glut-check" | "unknown";
  confidence: number;
  parsedData?: Record<string, string>;
}

export interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      content: string;
    };
  }[];
}

export type CropType =
  | "Alphonso Mangoes"
  | "Organic Tomatoes"
  | "Basmati Rice"
  | "Red Potatoes"
  | "Green Bell Peppers"
  | "Fresh Turmeric"
  | "Sugar Cane"
  | "Cotton";

export const CROP_TYPES: CropType[] = [
  "Alphonso Mangoes",
  "Organic Tomatoes",
  "Basmati Rice",
  "Red Potatoes",
  "Green Bell Peppers",
  "Fresh Turmeric",
  "Sugar Cane",
  "Cotton",
];

export const CROP_IMAGES: Record<string, string> = {
  "Alphonso Mangoes": "🥭",
  "Organic Tomatoes": "🍅",
  "Basmati Rice": "🌾",
  "Red Potatoes": "🥔",
  "Green Bell Peppers": "🫑",
  "Fresh Turmeric": "🌱",
  "Sugar Cane": "🎋",
  "Cotton": "☁️",
};

export const ZONES = [
  "North-1", "North-2", "North-3", "North-4",
  "South-1", "South-2", "South-3",
  "East-1", "East-2",
  "West-1", "West-2", "West-3",
];

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
}
