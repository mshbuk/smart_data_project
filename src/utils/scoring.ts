import type { District, DistrictMatch, Preferences, UserProfile } from "../types/District";

type WeightedMetric = {
  label: string;
  score: number;
  weight: number;
};

export const profileDefaults: Record<UserProfile, Preferences> = {
  tourist: {
    maxRentPerSqm: 20,
    safety: 3,
    quietness: 1,
    green: 2,
    publicTransport: 5,
    schools: 0,
    kindergartens: 0,
    nightlife: 5,
  },
  family: {
    maxRentPerSqm: 17,
    safety: 5,
    quietness: 4,
    green: 5,
    publicTransport: 3,
    schools: 5,
    kindergartens: 5,
    nightlife: 1,
  },
  longTerm: {
    maxRentPerSqm: 16,
    safety: 4,
    quietness: 3,
    green: 3,
    publicTransport: 5,
    schools: 2,
    kindergartens: 2,
    nightlife: 3,
  },
};

const profileLabels: Record<UserProfile, string> = {
  tourist: "short stays",
  family: "family relocation",
  longTerm: "long-term living",
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const formatPercent = (value: number) => `${Math.round(value)}%`;

function rentScore(district: District, maxRentPerSqm: number) {
  if (district.rentPerSqm <= maxRentPerSqm) {
    const savings = Math.min(maxRentPerSqm - district.rentPerSqm, 6);
    return 85 + savings * 2.5;
  }

  const overBudget = district.rentPerSqm - maxRentPerSqm;
  return clamp(80 - overBudget * 12, 0, 80);
}

function getMetrics(district: District, preferences: Preferences): WeightedMetric[] {
  return [
    { label: "Safety", score: district.safetyScore * 10, weight: preferences.safety },
    { label: "Quietness", score: district.quietnessScore * 10, weight: preferences.quietness },
    { label: "Green areas", score: district.greenScore * 10, weight: preferences.green },
    { label: "Public transport", score: district.publicTransportScore * 10, weight: preferences.publicTransport },
    { label: "Schools", score: district.schoolScore * 10, weight: preferences.schools },
    { label: "Kindergartens", score: district.kindergartenScore * 10, weight: preferences.kindergartens },
    { label: "Nightlife", score: district.nightlifeScore * 10, weight: preferences.nightlife },
    { label: "Rent fit", score: rentScore(district, preferences.maxRentPerSqm), weight: 5 },
  ];
}

function explainMatch(district: District, preferences: Preferences, profile: UserProfile, metrics: WeightedMetric[]) {
  const positiveHighlights = metrics
    .filter((metric) => metric.weight > 0 && metric.label !== "Rent fit")
    .sort((a, b) => b.score * b.weight - a.score * a.weight)
    .slice(0, 2)
    .map((metric) => metric.label.toLowerCase());

  const rentText =
    district.rentPerSqm <= preferences.maxRentPerSqm
      ? `Rent is within your EUR ${preferences.maxRentPerSqm}/sqm budget.`
      : `Rent is above your EUR ${preferences.maxRentPerSqm}/sqm budget, so the score is reduced.`;

  const highlightsText = positiveHighlights.length
    ? `Strong fit for ${positiveHighlights.join(" and ")}.`
    : "Balanced fit across your selected priorities.";

  return `${highlightsText} ${rentText} Tuned for ${profileLabels[profile]}.`;
}

export function calculateDistrictMatches(
  districts: District[],
  preferences: Preferences,
  profile: UserProfile,
): DistrictMatch[] {
  return districts
    .map((district) => {
      const metrics = getMetrics(district, preferences);
      const totalWeight = metrics.reduce((sum, metric) => sum + metric.weight, 0);

      // District indicators use a 0-10 scale. They are converted to 0-100, weighted by
      // the user's preferences, then adjusted by a transparent rent-fit penalty.
      const weightedScore =
        totalWeight === 0
          ? 0
          : metrics.reduce((sum, metric) => sum + metric.score * metric.weight, 0) / totalWeight;

      const score = clamp(weightedScore, 0, 100);
      const highlights = metrics
        .filter((metric) => metric.weight > 0)
        .sort((a, b) => b.score * b.weight - a.score * a.weight)
        .slice(0, 3)
        .map((metric) => `${metric.label}: ${formatPercent(metric.score)}`);

      return {
        district,
        score: Math.round(score),
        explanation: explainMatch(district, preferences, profile, metrics),
        highlights,
      };
    })
    .sort((a, b) => b.score - a.score);
}
