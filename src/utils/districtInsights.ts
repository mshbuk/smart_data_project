import type { District, Preferences } from "../types/District";
import type { Language } from "../i18n";

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

const criterionLabelsByLanguage: Record<Language, Record<CriterionKey, string>> = {
  en: {
    safety: "Safety",
    quietness: "Quietness",
    green: "Green areas",
    publicTransport: "Public transport",
    schools: "Schools",
    kindergartens: "Kindergartens",
    nightlife: "Nightlife",
  },
  de: {
    safety: "Sicherheit",
    quietness: "Ruhe",
    green: "Gruenflaechen",
    publicTransport: "OePNV",
    schools: "Schulen",
    kindergartens: "Kitas",
    nightlife: "Nachtleben",
  },
};

export const criterionLabels = criterionLabelsByLanguage.en;

export function getCriterionLabels(language: Language) {
  return criterionLabelsByLanguage[language];
}

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

export function getImportanceLabel(value: number, language: Language = "en") {
  if (language === "de") {
    if (value >= 5) return "sehr wichtig";
    if (value >= 4) return "wichtig";
    if (value >= 2) return "nice to have";
    if (value >= 1) return "geringe Prioritaet";
    return "nicht relevant";
  }

  if (value >= 5) return "very important";
  if (value >= 4) return "important";
  if (value >= 2) return "nice to have";
  if (value >= 1) return "low priority";
  return "not relevant";
}

export function getScoreLabel(value: number, language: Language = "en") {
  const score = clampScore(value);

  if (language === "de") {
    if (score >= 8.5) return "sehr gut";
    if (score >= 7) return "gut";
    if (score >= 5.5) return "ausgewogen";
    if (score >= 4) return "begrenzt";
    return "schwach";
  }

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

export function getDistrictTraits(district: District, language: Language = "en") {
  const traits = [
    district.publicTransportScore >= 7.5 ? (language === "de" ? "gut angebunden" : "well connected") : null,
    district.greenScore >= 7.5 ? (language === "de" ? "gruen" : "green") : null,
    district.quietnessScore >= 7.5 ? (language === "de" ? "ruhig" : "calm") : null,
    district.nightlifeScore >= 7 ? (language === "de" ? "lebendig" : "lively") : null,
    district.schoolScore >= 7 || district.kindergartenScore >= 7
      ? language === "de"
        ? "familienfreundlich"
        : "family friendly"
      : null,
    district.populationDensity >= 8000 ? (language === "de" ? "urban dicht" : "urban dense") : null,
    district.populationDensity <= 2500 ? (language === "de" ? "weitlaeufig" : "spacious") : null,
  ].filter((trait): trait is string => Boolean(trait));

  return traits.slice(0, 4);
}

export function getKnownFor(district: District, language: Language = "en") {
  const facts = [
    district.greenScore >= 7 ? (language === "de" ? "guter Zugang zu Gruenflaechen" : "strong green-space access") : null,
    district.publicTransportScore >= 7 ? (language === "de" ? "Alltagsmobilitaet mit HVV" : "everyday mobility by HVV") : null,
    district.nightlifeScore >= 7
      ? language === "de"
        ? "Restaurants, Bars und Abendleben"
        : "restaurants, bars, and evening activity"
      : null,
    district.quietnessScore >= 7 ? (language === "de" ? "ruhigere Wohnstrassen" : "calmer residential streets") : null,
    district.schoolScore >= 7 ? (language === "de" ? "Schulzugang" : "school access") : null,
    district.kindergartenScore >= 7 ? (language === "de" ? "Kita-Infrastruktur" : "early-childhood infrastructure") : null,
    district.population
      ? `${district.population.toLocaleString(language === "de" ? "de-DE" : "en-US")} ${
          language === "de" ? "Einwohner" : "residents"
        }`
      : null,
    district.populationDensity
      ? `${district.populationDensity.toLocaleString(language === "de" ? "de-DE" : "en-US")} ${
          language === "de" ? "Einwohner/km²" : "residents/km²"
        }`
      : null,
  ].filter((fact): fact is string => Boolean(fact));

  return facts.slice(0, 5);
}

export function getCriterionInsights(district: District, preferences: Preferences, language: Language = "en"): CriterionInsight[] {
  const labels = getCriterionLabels(language);

  return preferenceKeys.map((key) => {
    const score = getCriterionScore(district, key);
    const label = labels[key];
    const scoreLabel = getScoreLabel(score, language);
    const weight = preferences[key];

    const reasons: Record<CriterionKey, string> = {
      safety:
        typeof district.crimeCases2024 === "number"
          ? language === "de"
            ? `${scoreLabel}, weil die PKS-Faelle 2024 in den Sicherheits-Proxy einfliessen.`
            : `${scoreLabel} because the local PKS 2024 cases are folded into the safety proxy.`
          : language === "de"
            ? `${scoreLabel} im aktuellen Demo-Sicherheitsproxy.`
            : `${scoreLabel} in the current demo safety proxy.`,
      quietness:
        language === "de"
          ? `${scoreLabel} basierend auf Ruhe-Proxy und urbaner Dichte.`
          : `${scoreLabel} based on the district calmness proxy and urban-density signal.`,
      green:
        language === "de"
          ? `${scoreLabel}, weil der Gruenflaechen-Proxy diesen Stadtteil mit ${formatScore(score)}/10 bewertet.`
          : `${scoreLabel} because the green-space proxy ranks this district at ${formatScore(score)}/10.`,
      publicTransport:
        language === "de"
          ? `${scoreLabel} fuer alltaegliche HVV-Erreichbarkeit im aktuellen Verkehrsproxy.`
          : `${scoreLabel} for everyday HVV access in the current transport proxy.`,
      schools:
        language === "de"
          ? `${scoreLabel} fuer Schulzugang im Vergleich zu anderen Hamburger Stadtteilen.`
          : `${scoreLabel} for school access compared with other Hamburg districts.`,
      kindergartens:
        language === "de"
          ? `${scoreLabel} fuer Kita-Infrastruktur im Vergleich zu anderen Stadtteilen.`
          : `${scoreLabel} for early-childhood infrastructure compared with other districts.`,
      nightlife:
        language === "de"
          ? `${scoreLabel} fuer Restaurants, Bars und Abendaktivitaet im Lifestyle-Proxy.`
          : `${scoreLabel} for restaurants, bars, and evening activity in the lifestyle proxy.`,
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

export function getDemoListings(district: District, language: Language = "en"): DemoListing[] {
  const rentBase = Math.round(district.rentPerSqm);
  const compactRent = Math.round(district.rentPerSqm * 42 + 280);
  const familyRent = Math.round(district.rentPerSqm * 78 + 520);
  const sharedRent = Math.round(district.rentPerSqm * 27 + 180);

  return [
    {
      id: `${district.id}-compact`,
      title: language === "de" ? `Kompakte Wohnung in ${district.name}` : `Compact flat in ${district.name}`,
      rooms: 1.5,
      size: 42,
      rent: compactRent,
      tag: language === "de" ? `ca. ${rentBase} EUR/qm` : `${rentBase} EUR/sqm estimate`,
    },
    {
      id: `${district.id}-family`,
      title: language === "de" ? "Familienwohnung nahe Alltagsangeboten" : "Family-sized apartment near daily services",
      rooms: 3,
      size: 78,
      rent: familyRent,
      tag: district.schoolScore >= 7 ? (language === "de" ? "familientauglich" : "family fit") : language === "de" ? "groesserer Schnitt" : "larger layout",
    },
    {
      id: `${district.id}-shared`,
      title: language === "de" ? "Starter-Zimmer fuer einen flexiblen Umzug" : "Starter room for a flexible move",
      rooms: 1,
      size: 27,
      rent: sharedRent,
      tag: district.publicTransportScore >= 7
        ? language === "de"
          ? "OePNV-nah"
          : "transit friendly"
        : language === "de"
          ? "Budget-Vorschau"
          : "budget preview",
    },
  ];
}
