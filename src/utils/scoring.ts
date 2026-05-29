import type { District, DistrictMatch, Preferences, UserProfile } from "../types/District";
import type { Language } from "../i18n";

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
  custom: {
    maxRentPerSqm: 16,
    safety: 3,
    quietness: 3,
    green: 3,
    publicTransport: 3,
    schools: 0,
    kindergartens: 0,
    nightlife: 3,
  },
};

const profileLabels: Record<Language, Record<UserProfile, string>> = {
  en: {
    tourist: "short stays",
    family: "family relocation",
    longTerm: "long-term living",
    custom: "your custom setup",
  },
  de: {
    tourist: "Kurzaufenthalte",
    family: "Familienumzug",
    longTerm: "langfristiges Wohnen",
    custom: "dein individuelles Setup",
  },
};

const metricLabels: Record<Language, Record<string, string>> = {
  en: {
    safety: "Safety",
    quietness: "Quietness",
    green: "Green areas",
    publicTransport: "Public transport",
    schools: "Schools",
    kindergartens: "Kindergartens",
    nightlife: "Nightlife",
    rent: "Rent fit",
  },
  de: {
    safety: "Sicherheit",
    quietness: "Ruhe",
    green: "Gruenflaechen",
    publicTransport: "OePNV",
    schools: "Schulen",
    kindergartens: "Kitas",
    nightlife: "Nachtleben",
    rent: "Mietpassung",
  },
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

function getMetrics(district: District, preferences: Preferences, language: Language): WeightedMetric[] {
  const labels = metricLabels[language];

  return [
    { label: labels.safety, score: district.safetyScore * 10, weight: preferences.safety },
    { label: labels.quietness, score: district.quietnessScore * 10, weight: preferences.quietness },
    { label: labels.green, score: district.greenScore * 10, weight: preferences.green },
    { label: labels.publicTransport, score: district.publicTransportScore * 10, weight: preferences.publicTransport },
    { label: labels.schools, score: district.schoolScore * 10, weight: preferences.schools },
    { label: labels.kindergartens, score: district.kindergartenScore * 10, weight: preferences.kindergartens },
    { label: labels.nightlife, score: district.nightlifeScore * 10, weight: preferences.nightlife },
    { label: labels.rent, score: rentScore(district, preferences.maxRentPerSqm), weight: 5 },
  ];
}

function explainMatch(
  district: District,
  preferences: Preferences,
  profile: UserProfile,
  metrics: WeightedMetric[],
  language: Language,
) {
  const rentLabel = metricLabels[language].rent;
  const positiveHighlights = metrics
    .filter((metric) => metric.weight > 0 && metric.label !== rentLabel)
    .sort((a, b) => b.score * b.weight - a.score * a.weight)
    .slice(0, 2)
    .map((metric) => metric.label.toLowerCase());

  if (language === "de") {
    const rentText =
      district.rentPerSqm <= preferences.maxRentPerSqm
        ? `Die Miete liegt innerhalb deines Budgets von EUR ${preferences.maxRentPerSqm}/qm.`
        : `Die Miete liegt ueber deinem Budget von EUR ${preferences.maxRentPerSqm}/qm, daher wird die Bewertung reduziert.`;
    const highlightsText = positiveHighlights.length
      ? `Starke Passung bei ${positiveHighlights.join(" und ")}.`
      : "Ausgewogene Passung ueber deine ausgewaehlten Prioritaeten.";

    return `${highlightsText} ${rentText} Abgestimmt auf ${profileLabels.de[profile]}.`;
  }

  const rentText =
    district.rentPerSqm <= preferences.maxRentPerSqm
      ? `Rent is within your EUR ${preferences.maxRentPerSqm}/sqm budget.`
      : `Rent is above your EUR ${preferences.maxRentPerSqm}/sqm budget, so the score is reduced.`;

  const highlightsText = positiveHighlights.length
    ? `Strong fit for ${positiveHighlights.join(" and ")}.`
    : "Balanced fit across your selected priorities.";

  return `${highlightsText} ${rentText} Tuned for ${profileLabels.en[profile]}.`;
}

function getStrengths(district: District, preferences: Preferences, metrics: WeightedMetric[], language: Language) {
  const rentLabel = metricLabels[language].rent;
  const metricStrengths = metrics
    .filter((metric) => metric.weight > 0 && metric.label !== rentLabel && metric.score >= 72)
    .sort((a, b) => b.score * b.weight - a.score * a.weight)
    .slice(0, 3)
    .map((metric) => metric.label);

  const rentStrength =
    district.rentPerSqm <= preferences.maxRentPerSqm
      ? [language === "de" ? "Miete im Budget" : "Rent within budget"]
      : [];
  const strengths = [...rentStrength, ...metricStrengths].slice(0, 4);

  return strengths.length ? strengths : [language === "de" ? "Ausgewogen ueber Prioritaeten" : "Balanced across priorities"];
}

function getTradeoffs(district: District, preferences: Preferences, metrics: WeightedMetric[], language: Language) {
  const rentLabel = metricLabels[language].rent;
  const metricTradeoffs = metrics
    .filter((metric) => metric.weight >= 3 && metric.label !== rentLabel && metric.score < 62)
    .sort((a, b) => a.score * a.weight - b.score * b.weight)
    .slice(0, 2)
    .map((metric) => (language === "de" ? `${metric.label} ist niedriger` : `${metric.label} is lower`));

  const rentTradeoff =
    district.rentPerSqm > preferences.maxRentPerSqm
      ? [
          language === "de"
            ? `EUR ${(district.rentPerSqm - preferences.maxRentPerSqm).toFixed(1)}/qm ueber Budget`
            : `EUR ${(district.rentPerSqm - preferences.maxRentPerSqm).toFixed(1)}/sqm over budget`,
        ]
      : [];

  return [...rentTradeoff, ...metricTradeoffs].slice(0, 3);
}

export function calculateDistrictMatches(
  districts: District[],
  preferences: Preferences,
  profile: UserProfile,
  language: Language = "en",
): DistrictMatch[] {
  return districts
    .map((district) => {
      const metrics = getMetrics(district, preferences, language);
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
        explanation: explainMatch(district, preferences, profile, metrics, language),
        highlights,
        strengths: getStrengths(district, preferences, metrics, language),
        tradeoffs: getTradeoffs(district, preferences, metrics, language),
      };
    })
    .sort((a, b) => b.score - a.score);
}
