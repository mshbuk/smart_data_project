import type { District, Preferences } from "../types/District";

type CriterionKey =
  | "safety"
  | "quietness"
  | "green"
  | "publicTransport"
  | "schools"
  | "kindergartens"
  | "nightlife";

export type CriterionInsight = {
  key: CriterionKey;
  label: string;
  score: number;
  weight: number;
  reason: string;
};

export type DemoListing = {
  id: string;
  title: string;
  rooms: number;
  size: number;
  rent: number;
  tag: string;
};

export const criterionLabels: Record<CriterionKey, string> = {
  safety: "Safety",
  quietness: "Quietness",
  green: "Green areas",
  publicTransport: "Public transport",
  schools: "Schools",
  kindergartens: "Kindergartens",
  nightlife: "Nightlife",
};

export const preferenceKeys: CriterionKey[] = [
  "safety",
  "quietness",
  "green",
  "publicTransport",
  "schools",
  "kindergartens",
  "nightlife",
];

const clampScore = (value: number) => Math.min(Math.max(value, 0), 10);

export function formatScore(value: number) {
  const score = clampScore(value);

  return Number.isInteger(score) ? `${score}` : score.toFixed(1);
}

export function getImportanceLabel(value: number) {
  if (value >= 5) return "very important";
  if (value >= 4) return "important";
  if (value >= 2) return "nice to have";
  if (value >= 1) return "low priority";
  return "not relevant";
}

export function getScoreLabel(value: number) {
  const score = clampScore(value);

  if (score >= 8.5) return "very good";
  if (score >= 7) return "good";
  if (score >= 5.5) return "balanced";
  if (score >= 4) return "limited";
  return "weak";
}

export function getCriterionScore(district: District, key: CriterionKey) {
  const scores: Record<CriterionKey, number> = {
    safety: district.safetyScore,
    quietness: district.quietnessScore,
    green: district.greenScore,
    publicTransport: district.publicTransportScore,
    schools: district.schoolScore,
    kindergartens: district.kindergartenScore,
    nightlife: district.nightlifeScore,
  };

  return clampScore(scores[key]);
}

export function getDistrictTraits(district: District) {
  const traits = [
    district.publicTransportScore >= 7.5 ? "well connected" : null,
    district.greenScore >= 7.5 ? "green" : null,
    district.quietnessScore >= 7.5 ? "calm" : null,
    district.nightlifeScore >= 7 ? "lively" : null,
    district.schoolScore >= 7 || district.kindergartenScore >= 7 ? "family friendly" : null,
    district.populationDensity >= 8000 ? "urban dense" : null,
    district.populationDensity <= 2500 ? "spacious" : null,
  ].filter((trait): trait is string => Boolean(trait));

  return traits.slice(0, 4);
}

export function getKnownFor(district: District) {
  const facts = [
    district.greenScore >= 7 ? "strong green-space access" : null,
    district.publicTransportScore >= 7 ? "everyday mobility by HVV" : null,
    district.nightlifeScore >= 7 ? "restaurants, bars, and evening activity" : null,
    district.quietnessScore >= 7 ? "calmer residential streets" : null,
    district.schoolScore >= 7 ? "school access" : null,
    district.kindergartenScore >= 7 ? "early-childhood infrastructure" : null,
    district.population ? `${district.population.toLocaleString("en-US")} residents` : null,
    district.populationDensity ? `${district.populationDensity.toLocaleString("en-US")} residents/km²` : null,
  ].filter((fact): fact is string => Boolean(fact));

  return facts.slice(0, 5);
}

export function getCriterionInsights(district: District, preferences: Preferences): CriterionInsight[] {
  return preferenceKeys.map((key) => {
    const score = getCriterionScore(district, key);
    const label = criterionLabels[key];
    const scoreLabel = getScoreLabel(score);
    const weight = preferences[key];

    const reasons: Record<CriterionKey, string> = {
      safety:
        typeof district.crimeCases2024 === "number"
          ? `${scoreLabel} because the local PKS 2024 cases are folded into the safety proxy.`
          : `${scoreLabel} in the current demo safety proxy.`,
      quietness: `${scoreLabel} based on the district calmness proxy and urban-density signal.`,
      green: `${scoreLabel} because the green-space proxy ranks this district at ${formatScore(score)}/10.`,
      publicTransport: `${scoreLabel} for everyday HVV access in the current transport proxy.`,
      schools: `${scoreLabel} for school access compared with other Hamburg districts.`,
      kindergartens: `${scoreLabel} for early-childhood infrastructure compared with other districts.`,
      nightlife: `${scoreLabel} for restaurants, bars, and evening activity in the lifestyle proxy.`,
    };

    return {
      key,
      label,
      score,
      weight,
      reason: reasons[key],
    };
  });
}

export function getDemoListings(district: District): DemoListing[] {
  const rentBase = Math.round(district.rentPerSqm);
  const compactRent = Math.round(district.rentPerSqm * 42 + 280);
  const familyRent = Math.round(district.rentPerSqm * 78 + 520);
  const sharedRent = Math.round(district.rentPerSqm * 27 + 180);

  return [
    {
      id: `${district.id}-compact`,
      title: `Compact flat in ${district.name}`,
      rooms: 1.5,
      size: 42,
      rent: compactRent,
      tag: `${rentBase} EUR/sqm estimate`,
    },
    {
      id: `${district.id}-family`,
      title: `Family-sized apartment near daily services`,
      rooms: 3,
      size: 78,
      rent: familyRent,
      tag: district.schoolScore >= 7 ? "family fit" : "larger layout",
    },
    {
      id: `${district.id}-shared`,
      title: `Starter room for a flexible move`,
      rooms: 1,
      size: 27,
      rent: sharedRent,
      tag: district.publicTransportScore >= 7 ? "transit friendly" : "budget preview",
    },
  ];
}
