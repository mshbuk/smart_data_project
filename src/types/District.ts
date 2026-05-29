export interface District {
  id: string;
  name: string;
  population?: number;
  crimeCases2024?: number;
  rentPerSqm: number;
  safetyScore: number;
  quietnessScore: number;
  greenScore: number;
  publicTransportScore: number;
  schoolScore: number;
  kindergartenScore: number;
  nightlifeScore: number;
  populationDensity: number;
  shortDescription: string;
  imageUrl?: string;
  dataQuality?: "sourced" | "partially-sourced" | "placeholder";
  missingSources?: string[];
  sourceSummary?: string;
  latitude: number;
  longitude: number;
}

export type UserProfile = "tourist" | "family" | "longTerm" | "custom";

export interface Preferences {
  maxRentPerSqm: number;
  safety: number;
  quietness: number;
  green: number;
  publicTransport: number;
  schools: number;
  kindergartens: number;
  nightlife: number;
}

export interface DistrictMatch {
  district: District;
  score: number;
  explanation: string;
  highlights: string[];
  strengths: string[];
  tradeoffs: string[];
}
