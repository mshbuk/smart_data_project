import {
  ArrowLeft,
  ArrowRight,
  Baby,
  Bike,
  BriefcaseBusiness,
  Car,
  Coffee,
  Dumbbell,
  Euro,
  Home,
  Music,
  ShieldCheck,
  Train,
  TreePine,
  Users,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Preferences } from "../types/District";
import { useI18n } from "../i18n";
import { profileDefaults } from "../utils/scoring";

type CustomQuestionnaireProps = {
  preferences: Preferences;
  onBack: () => void;
  onChange: (preferences: Preferences) => void;
  onNext: () => void;
};

type MobilityAnswer = "public" | "bike" | "car" | "remote";
type TransitAnswer = "bus" | "train" | "both";
type HouseholdAnswer = "solo" | "partner" | "family";
type FamilyNeed = "kindergartens" | "schools" | "both" | "notImportant";
type LeisureAnswer = "parks" | "city" | "sport" | "home";
type CityDetail = "cafes" | "bars" | "events";
type SafetyAnswer = "very" | "important" | "neutral" | "low";
type StepId = "rent" | "mobility" | "transit" | "household" | "familyNeed" | "leisure" | "cityDetails" | "safety";

type Answers = {
  rentBudget: number;
  mobility?: MobilityAnswer;
  transit?: TransitAnswer;
  household?: HouseholdAnswer;
  familyNeed?: FamilyNeed;
  leisure: LeisureAnswer[];
  cityDetails: CityDetail[];
  safety?: SafetyAnswer;
};

type Choice<T extends string> = {
  id: T;
  label: string;
  description: string;
  icon: LucideIcon;
};

const mobilityChoices: Choice<MobilityAnswer>[] = [
  {
    id: "public",
    label: "Public transport",
    description: "Bus and train access should shape the ranking.",
    icon: Train,
  },
  {
    id: "bike",
    label: "Bike",
    description: "You are flexible and do not need every trip to depend on transit.",
    icon: Bike,
  },
  {
    id: "car",
    label: "Car",
    description: "Public transport is useful, but less decisive.",
    icon: Car,
  },
  {
    id: "remote",
    label: "Remote work",
    description: "Calm daily surroundings matter more than commuting.",
    icon: Home,
  },
];

const transitChoices: Choice<TransitAnswer>[] = [
  {
    id: "bus",
    label: "Bus",
    description: "Good local bus access is enough.",
    icon: Train,
  },
  {
    id: "train",
    label: "Train",
    description: "U-Bahn and S-Bahn access should be prioritized.",
    icon: Train,
  },
  {
    id: "both",
    label: "Both",
    description: "You want strong bus and train access.",
    icon: Train,
  },
];

const householdChoices: Choice<HouseholdAnswer>[] = [
  {
    id: "solo",
    label: "Moving alone",
    description: "Family infrastructure is not central right now.",
    icon: Home,
  },
  {
    id: "partner",
    label: "Moving with a partner",
    description: "The result can stay flexible unless schools or daycare matter.",
    icon: Users,
  },
  {
    id: "family",
    label: "Family with children",
    description: "Schools, daycare, safety, and calmer streets should matter more.",
    icon: Baby,
  },
];

const familyNeedChoices: Choice<FamilyNeed>[] = [
  {
    id: "kindergartens",
    label: "Daycare",
    description: "Early-childhood options should be nearby.",
    icon: Baby,
  },
  {
    id: "schools",
    label: "Schools",
    description: "School access should strongly influence the result.",
    icon: BriefcaseBusiness,
  },
  {
    id: "both",
    label: "Both",
    description: "Daycare and schools should both be important.",
    icon: Users,
  },
  {
    id: "notImportant",
    label: "Not important for us",
    description: "Schools and daycare should not shape the recommendation.",
    icon: Home,
  },
];

const leisureChoices: Choice<LeisureAnswer>[] = [
  {
    id: "parks",
    label: "Parks and green areas",
    description: "Nature and outdoor space should be visible in the ranking.",
    icon: TreePine,
  },
  {
    id: "city",
    label: "Cafés, bars, events",
    description: "Central lifestyle and activity should score higher.",
    icon: Coffee,
  },
  {
    id: "sport",
    label: "Sports club or gym",
    description: "Active everyday life and neighborhood amenities matter.",
    icon: Dumbbell,
  },
  {
    id: "home",
    label: "Relaxing at home",
    description: "Quiet surroundings should count more than nightlife.",
    icon: Volume2,
  },
];

const cityDetailChoices: Choice<CityDetail>[] = [
  {
    id: "cafes",
    label: "Cafés",
    description: "You want everyday cafe and coffee options nearby.",
    icon: Coffee,
  },
  {
    id: "bars",
    label: "Bars",
    description: "Evening activity and social places should matter.",
    icon: Music,
  },
  {
    id: "events",
    label: "Events",
    description: "Culture, concerts, and things to do should matter.",
    icon: BriefcaseBusiness,
  },
];

const safetyChoices: Choice<SafetyAnswer>[] = [
  {
    id: "very",
    label: "Very important",
    description: "Safety should strongly influence every recommendation.",
    icon: ShieldCheck,
  },
  {
    id: "important",
    label: "Important",
    description: "Safety should matter, but not dominate everything.",
    icon: ShieldCheck,
  },
  {
    id: "neutral",
    label: "Rather neutral",
    description: "Safety should be considered with a moderate weight.",
    icon: ShieldCheck,
  },
  {
    id: "low",
    label: "Not important",
    description: "Other lifestyle criteria should matter more.",
    icon: ShieldCheck,
  },
];

const choiceTranslations: Record<string, string> = {
  "Public transport": "Öffentliche Verkehrsmittel",
  "Bus and train access should shape the ranking.": "Bus- und Bahnzugang sollen das Ranking prägen.",
  Bike: "Fahrrad",
  "You are flexible and do not need every trip to depend on transit.":
    "Du bist flexibel und nicht jeder Weg hängt vom ÖPNV ab.",
  Car: "Auto",
  "Public transport is useful, but less decisive.": "ÖPNV ist nützlich, aber weniger entscheidend.",
  "Remote work": "Ich arbeite von zu Hause / remote",
  "Calm daily surroundings matter more than commuting.": "Ruhige Alltagsumgebung ist wichtiger als Pendeln.",
  Bus: "Bus",
  "Good local bus access is enough.": "Guter lokaler Buszugang reicht aus.",
  Train: "Bahn",
  "U-Bahn and S-Bahn access should be prioritized.": "U-Bahn und S-Bahn sollen Priorität haben.",
  Both: "Beides",
  "You want strong bus and train access.": "Bus und Bahn sollen beide stark berücksichtigt werden.",
  "Moving alone": "Ich ziehe alleine ein",
  "Family infrastructure is not central right now.": "Familieninfrastruktur ist aktuell nicht zentral.",
  "Moving with a partner": "Ich ziehe mit Partner/in ein",
  "The result can stay flexible unless schools or daycare matter.":
    "Das Ergebnis bleibt flexibel, außer Schulen oder Kitas sind wichtig.",
  "Family with children": "Wir sind eine Familie mit Kindern",
  "Schools, daycare, safety, and calmer streets should matter more.":
    "Schulen, Kitas, Sicherheit und ruhigere Straßen sollen stärker zählen.",
  Daycare: "Kitas",
  "Early-childhood options should be nearby.": "Kita-Angebote sollen in der Nähe sein.",
  Schools: "Schulen",
  "School access should strongly influence the result.": "Schulzugang soll das Ergebnis stark beeinflussen.",
  "Daycare and schools should both be important.": "Kitas und Schulen sollen beide wichtig sein.",
  "Not important for us": "Nicht wichtig",
  "Schools and daycare should not shape the recommendation.":
    "Schulen und Kitas sollen die Empfehlung nicht beeinflussen.",
  "Parks and green areas": "Parks und Grünflächen",
  "Nature and outdoor space should be visible in the ranking.":
    "Natur und Außenraum sollen im Ranking sichtbar sein.",
  "Cafés, bars, events": "Cafés, Bars, Events",
  "Central lifestyle and activity should score higher.": "Zentraler Lebensstil und Aktivität sollen höher zählen.",
  "Sports club or gym": "Sport im Verein oder Fitnessstudio",
  "Active everyday life and neighborhood amenities matter.":
    "Aktiver Alltag und Angebote im Viertel sollen zählen.",
  "Relaxing at home": "Zu Hause entspannen, Ruhe genießen",
  "Quiet surroundings should count more than nightlife.": "Ruhige Umgebung soll stärker zählen als Nachtleben.",
  Cafés: "Cafés",
  "You want everyday cafe and coffee options nearby.":
    "Cafés und Kaffeeoptionen im Alltag sollen in der Nähe sein.",
  Bars: "Bars",
  "Evening activity and social places should matter.": "Abendleben und soziale Orte sollen zählen.",
  Events: "Events",
  "Culture, concerts, and things to do should matter.": "Kultur, Konzerte und Aktivitäten sollen zählen.",
  "Very important": "Sehr wichtig",
  "Safety should strongly influence every recommendation.":
    "Sicherheit soll jede Empfehlung stark beeinflussen.",
  Important: "Wichtig",
  "Safety should matter, but not dominate everything.":
    "Sicherheit soll wichtig sein, aber nicht alles dominieren.",
  "Rather neutral": "Eher neutral",
  "Safety should be considered with a moderate weight.":
    "Sicherheit soll mit moderater Gewichtung einfließen.",
  "Not important": "Unwichtig",
  "Other lifestyle criteria should matter more.": "Andere Lebensstil-Kriterien sollen wichtiger sein.",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function deriveRentPerSqm(rentBudget: number) {
  if (!Number.isFinite(rentBudget) || rentBudget <= 0) return profileDefaults.custom.maxRentPerSqm;

  // The scoring model compares district rent per square meter. If the user enters
  // a realistic monthly apartment budget, convert it with a compact 55 sqm demo flat.
  if (rentBudget > 40) return clamp(Math.round((rentBudget / 55) * 10) / 10, 8, 30);

  return clamp(rentBudget, 8, 30);
}

function toggleArrayValue<T extends string>(values: T[], value: T) {
  return values.includes(value) ? values.filter((currentValue) => currentValue !== value) : [...values, value];
}

function getAnswerPreferences(answers: Answers): Preferences {
  const nextPreferences: Preferences = {
    ...profileDefaults.custom,
    maxRentPerSqm: deriveRentPerSqm(answers.rentBudget),
  };

  if (answers.mobility === "public") {
    nextPreferences.publicTransport = answers.transit === "both" ? 5 : 4;
  }

  if (answers.mobility === "bike") {
    nextPreferences.publicTransport = 2;
    nextPreferences.green = Math.max(nextPreferences.green, 4);
  }

  if (answers.mobility === "car") {
    nextPreferences.publicTransport = 1;
  }

  if (answers.mobility === "remote") {
    nextPreferences.publicTransport = 1;
    nextPreferences.quietness = Math.max(nextPreferences.quietness, 5);
  }

  if (answers.household === "solo") {
    nextPreferences.schools = 0;
    nextPreferences.kindergartens = 0;
  }

  if (answers.household === "partner") {
    nextPreferences.quietness = Math.max(nextPreferences.quietness, 3);
  }

  if (answers.household === "family") {
    nextPreferences.safety = Math.max(nextPreferences.safety, 4);
    nextPreferences.quietness = Math.max(nextPreferences.quietness, 4);
    nextPreferences.green = Math.max(nextPreferences.green, 4);
  }

  if (answers.household === "partner" || answers.household === "family") {
    if (answers.familyNeed === "kindergartens") {
      nextPreferences.kindergartens = 5;
      nextPreferences.schools = 2;
    }

    if (answers.familyNeed === "schools") {
      nextPreferences.schools = 5;
      nextPreferences.kindergartens = 2;
    }

    if (answers.familyNeed === "both") {
      nextPreferences.schools = 5;
      nextPreferences.kindergartens = 5;
    }

    if (answers.familyNeed === "notImportant") {
      nextPreferences.schools = 0;
      nextPreferences.kindergartens = 0;
    }
  }

  if (answers.leisure.includes("parks")) {
    nextPreferences.green = 5;
    nextPreferences.quietness = Math.max(nextPreferences.quietness, 3);
  }

  if (answers.leisure.includes("sport")) {
    nextPreferences.green = Math.max(nextPreferences.green, 4);
    nextPreferences.publicTransport = Math.max(nextPreferences.publicTransport, 3);
  }

  if (answers.leisure.includes("home")) {
    nextPreferences.quietness = 5;
    nextPreferences.nightlife = Math.min(nextPreferences.nightlife, 1);
  }

  if (answers.leisure.includes("city")) {
    const cityWeight = answers.cityDetails.length >= 2 ? 5 : 4;
    nextPreferences.nightlife = Math.max(nextPreferences.nightlife, cityWeight);
    nextPreferences.publicTransport = Math.max(nextPreferences.publicTransport, 4);
  }

  if (answers.safety === "very") nextPreferences.safety = 5;
  if (answers.safety === "important") nextPreferences.safety = Math.max(nextPreferences.safety, 4);
  if (answers.safety === "neutral") nextPreferences.safety = Math.max(nextPreferences.safety, 2);
  if (answers.safety === "low") nextPreferences.safety = 0;

  return nextPreferences;
}

function getQuestionnaireSteps(answers: Answers): StepId[] {
  const steps: StepId[] = ["rent", "mobility"];

  if (answers.mobility === "public") steps.push("transit");

  steps.push("household");

  if (answers.household === "partner" || answers.household === "family") steps.push("familyNeed");

  steps.push("leisure");

  if (answers.leisure.includes("city")) steps.push("cityDetails");

  steps.push("safety");

  return steps;
}

function isStepComplete(stepId: StepId, answers: Answers) {
  if (stepId === "rent") return answers.rentBudget > 0;
  if (stepId === "mobility") return Boolean(answers.mobility);
  if (stepId === "transit") return Boolean(answers.transit);
  if (stepId === "household") return Boolean(answers.household);
  if (stepId === "familyNeed") return Boolean(answers.familyNeed);
  if (stepId === "leisure") return answers.leisure.length > 0;
  if (stepId === "cityDetails") return answers.cityDetails.length > 0;
  return Boolean(answers.safety);
}

function getStepMeta(stepId: StepId): { eyebrow: string; eyebrowDe: string; icon: LucideIcon; title: string; titleDe: string } {
  const meta: Record<StepId, { eyebrow: string; eyebrowDe: string; icon: LucideIcon; title: string; titleDe: string }> = {
    rent: {
      eyebrow: "Rent",
      eyebrowDe: "Miete",
      icon: Euro,
      title: "How much do you want to spend at most on your apartment?",
      titleDe: "Wie viel möchtest du maximal für deine Wohnung ausgeben?",
    },
    mobility: {
      eyebrow: "Mobility",
      eyebrowDe: "Mobilität",
      icon: Train,
      title: "How do you prefer to get to work or university?",
      titleDe: "Wie kommst du am liebsten zur Arbeit oder Uni?",
    },
    transit: {
      eyebrow: "Public transport",
      eyebrowDe: "ÖPNV",
      icon: Train,
      title: "Which public transport connection matters most?",
      titleDe: "Welche ÖPNV-Anbindung ist dir am wichtigsten?",
    },
    household: {
      eyebrow: "Household",
      eyebrowDe: "Familie",
      icon: Users,
      title: "What does your household look like?",
      titleDe: "Wie sieht dein Haushalt aus?",
    },
    familyNeed: {
      eyebrow: "Family needs",
      eyebrowDe: "Familienbedarf",
      icon: Baby,
      title: "Are schools or daycare important for you?",
      titleDe: "Sind Schulen oder Kitas für euch wichtig?",
    },
    leisure: {
      eyebrow: "Free time",
      eyebrowDe: "Freizeit",
      icon: TreePine,
      title: "How and where do you like to spend your free time?",
      titleDe: "Wie und wo verbringst du gerne deine Freizeit?",
    },
    cityDetails: {
      eyebrow: "City life",
      eyebrowDe: "Stadtleben",
      icon: Coffee,
      title: "Which city-life options should matter?",
      titleDe: "Was davon ist dir wichtig?",
    },
    safety: {
      eyebrow: "Safety",
      eyebrowDe: "Sicherheit",
      icon: ShieldCheck,
      title: "How important is safety?",
      titleDe: "Wie wichtig ist die Sicherheit?",
    },
  };

  return meta[stepId];
}

function OptionButton<T extends string>({
  choice,
  isSelected,
  onClick,
}: {
  choice: Choice<T>;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { tx } = useI18n();
  const Icon = choice.icon;

  return (
    <button
      aria-pressed={isSelected}
      className={[
        "min-h-[112px] rounded-2xl border p-3 text-left transition-all",
        isSelected
          ? "border-indigo-300 bg-indigo-50 ring-4 ring-indigo-100"
          : "border-slate-100 bg-slate-50 hover:border-indigo-200 hover:bg-white",
      ].join(" ")}
      onClick={onClick}
      type="button"
    >
      <span className="flex items-center gap-2">
        <Icon aria-hidden="true" className="h-4 w-4 text-indigo-600" />
        <span className="text-sm font-black text-slate-950">
          {tx(choice.label, choiceTranslations[choice.label] ?? choice.label)}
        </span>
      </span>
      <span className="mt-2 block text-sm leading-5 text-slate-600">
        {tx(choice.description, choiceTranslations[choice.description] ?? choice.description)}
      </span>
    </button>
  );
}

export function CustomQuestionnaire({ preferences, onBack, onChange, onNext }: CustomQuestionnaireProps) {
  const { tx } = useI18n();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    rentBudget: preferences.maxRentPerSqm,
    leisure: [],
    cityDetails: [],
  });
  const steps = useMemo(() => getQuestionnaireSteps(answers), [answers]);
  const currentStepId = steps[Math.min(currentStepIndex, steps.length - 1)];
  const currentStepMeta = getStepMeta(currentStepId);
  const completedSteps = steps.filter((stepId) => isStepComplete(stepId, answers)).length;
  const isCurrentStepComplete = isStepComplete(currentStepId, answers);
  const isLastStep = currentStepIndex >= steps.length - 1;
  const isComplete = completedSteps === steps.length;
  const progressPercent = ((currentStepIndex + 1) / steps.length) * 100;
  const derivedPreferences = useMemo(() => getAnswerPreferences(answers), [answers]);

  useEffect(() => {
    setCurrentStepIndex((index) => Math.min(index, steps.length - 1));
  }, [steps.length]);

  const updateAnswers = (updater: (currentAnswers: Answers) => Answers) => {
    setAnswers((currentAnswers) => {
      const nextAnswers = updater(currentAnswers);
      onChange(getAnswerPreferences(nextAnswers));
      return nextAnswers;
    });
  };

  const updateSingleAnswer = <Key extends keyof Answers>(key: Key, value: Answers[Key]) => {
    updateAnswers((currentAnswers) => ({ ...currentAnswers, [key]: value }));
  };

  const goBack = () => {
    if (currentStepIndex === 0) {
      onBack();
      return;
    }

    setCurrentStepIndex((index) => Math.max(index - 1, 0));
  };

  const goForward = () => {
    if (!isCurrentStepComplete) return;

    if (isLastStep) {
      if (isComplete) onNext();
      return;
    }

    setCurrentStepIndex((index) => Math.min(index + 1, steps.length - 1));
  };

  const renderStepContent = (): ReactNode => {
    if (currentStepId === "rent") {
      return (
        <>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {tx(
              "Enter a monthly budget, or enter a direct EUR/sqm value if you already know it.",
              "Gib ein monatliches Budget ein oder direkt einen EUR/qm-Wert, wenn du ihn schon kennst.",
            )}
          </p>
          <label className="mt-6 flex min-h-14 max-w-md items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100">
            <span className="text-xs font-black text-slate-500">EUR</span>
            <input
              className="min-w-0 flex-1 border-0 bg-transparent text-xl font-black text-slate-950 outline-none"
              inputMode="decimal"
              min="0"
              onChange={(event) => updateSingleAnswer("rentBudget", Number(event.target.value))}
              placeholder="1200"
              type="number"
              value={answers.rentBudget || ""}
            />
          </label>
          <p className="mt-3 text-xs font-bold text-slate-500">
            {tx(
              `Used for scoring as EUR ${derivedPreferences.maxRentPerSqm}/sqm.`,
              `Für das Matching genutzt als EUR ${derivedPreferences.maxRentPerSqm}/qm.`,
            )}
          </p>
        </>
      );
    }

    if (currentStepId === "mobility") {
      return (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {mobilityChoices.map((choice) => (
            <OptionButton
              choice={choice}
              isSelected={answers.mobility === choice.id}
              key={choice.id}
              onClick={() =>
                updateAnswers((currentAnswers) => ({
                  ...currentAnswers,
                  mobility: choice.id,
                  transit: choice.id === "public" ? currentAnswers.transit : undefined,
                }))
              }
            />
          ))}
        </div>
      );
    }

    if (currentStepId === "transit") {
      return (
        <>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {tx("This follow-up appears because you selected public transport.", "Diese Nachfrage erscheint, weil du ÖPNV gewählt hast.")}
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {transitChoices.map((choice) => (
              <OptionButton
                choice={choice}
                isSelected={answers.transit === choice.id}
                key={choice.id}
                onClick={() => updateSingleAnswer("transit", choice.id)}
              />
            ))}
          </div>
        </>
      );
    }

    if (currentStepId === "household") {
      return (
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {householdChoices.map((choice) => (
            <OptionButton
              choice={choice}
              isSelected={answers.household === choice.id}
              key={choice.id}
              onClick={() =>
                updateAnswers((currentAnswers) => ({
                  ...currentAnswers,
                  household: choice.id,
                  familyNeed: choice.id === "solo" ? undefined : currentAnswers.familyNeed,
                }))
              }
            />
          ))}
        </div>
      );
    }

    if (currentStepId === "familyNeed") {
      return (
        <>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {tx("This follow-up appears because your household may need family infrastructure.", "Diese Nachfrage erscheint, weil euer Haushalt Familieninfrastruktur brauchen könnte.")}
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {familyNeedChoices.map((choice) => (
              <OptionButton
                choice={choice}
                isSelected={answers.familyNeed === choice.id}
                key={choice.id}
                onClick={() => updateSingleAnswer("familyNeed", choice.id)}
              />
            ))}
          </div>
        </>
      );
    }

    if (currentStepId === "leisure") {
      return (
        <>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {tx("You can select more than one.", "Du kannst mehrere Antworten auswählen.")}
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {leisureChoices.map((choice) => (
              <OptionButton
                choice={choice}
                isSelected={answers.leisure.includes(choice.id)}
                key={choice.id}
                onClick={() =>
                  updateAnswers((currentAnswers) => {
                    const leisure = toggleArrayValue(currentAnswers.leisure, choice.id);
                    return {
                      ...currentAnswers,
                      leisure,
                      cityDetails: leisure.includes("city") ? currentAnswers.cityDetails : [],
                    };
                  })
                }
              />
            ))}
          </div>
        </>
      );
    }

    if (currentStepId === "cityDetails") {
      return (
        <>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {tx("Select one to three options.", "Wähle eine bis drei Optionen.")}
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {cityDetailChoices.map((choice) => (
              <OptionButton
                choice={choice}
                isSelected={answers.cityDetails.includes(choice.id)}
                key={choice.id}
                onClick={() =>
                  updateAnswers((currentAnswers) => ({
                    ...currentAnswers,
                    cityDetails: toggleArrayValue(currentAnswers.cityDetails, choice.id),
                  }))
                }
              />
            ))}
          </div>
        </>
      );
    }

    return (
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {safetyChoices.map((choice) => (
          <OptionButton
            choice={choice}
            isSelected={answers.safety === choice.id}
            key={choice.id}
            onClick={() => updateSingleAnswer("safety", choice.id)}
          />
        ))}
      </div>
    );
  };

  const CurrentStepIcon = currentStepMeta.icon;

  return (
    <section className="grid gap-4">
      <div className="rounded-[1.6rem] border border-white/80 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] md:p-6">
        <p className="text-xs font-black uppercase tracking-wide text-indigo-600">{tx("Custom setup", "Eigene Auswahl")}</p>
        <h2 className="mt-1 text-3xl font-black leading-tight text-slate-950">{tx("Tell us how you live", "Erzähl uns, wie du lebst")}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          {tx(
            "Your answers update the criteria automatically. You will review the final weights before seeing recommendations.",
            "Deine Antworten aktualisieren die Kriterien automatisch. Danach prüfst du die Gewichtung vor den Empfehlungen.",
          )}
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-black text-slate-500">
          <span>{tx(`Question ${currentStepIndex + 1} of ${steps.length}`, `Frage ${currentStepIndex + 1} von ${steps.length}`)}</span>
          <span>{tx(`${completedSteps} answered`, `${completedSteps} beantwortet`)}</span>
        </div>
      </div>

      <article className="rounded-[1.45rem] border border-white/80 bg-white/90 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.07)]">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white">
            <CurrentStepIcon aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-indigo-600">
              {tx(currentStepMeta.eyebrow, currentStepMeta.eyebrowDe)}
            </p>
            <h3 className="mt-1 text-xl font-black text-slate-950">{tx(currentStepMeta.title, currentStepMeta.titleDe)}</h3>
          </div>
        </div>
        {renderStepContent()}
      </article>

      <div className="sticky bottom-4 z-20 grid gap-2 rounded-[1.35rem] border border-white/80 bg-white/95 p-3 shadow-[0_18px_50px_rgba(15,23,42,0.16)] backdrop-blur md:grid-cols-[auto_1fr_auto] md:items-center">
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 text-sm font-black text-slate-700 transition-colors hover:bg-slate-200"
          onClick={goBack}
          type="button"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          {currentStepIndex === 0 ? tx("Back to profiles", "Zurück zu Profilen") : tx("Previous", "Zurück")}
        </button>
        <p className="text-center text-sm font-bold text-slate-600">
          {isCurrentStepComplete
            ? tx("Answer saved. You can continue.", "Antwort gespeichert. Du kannst weitergehen.")
            : tx("Choose an answer to continue.", "Wähle eine Antwort, um weiterzugehen.")}
        </p>
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 text-sm font-black text-white shadow-lg shadow-indigo-600/20 transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-45"
          disabled={!isCurrentStepComplete || (isLastStep && !isComplete)}
          onClick={goForward}
          type="button"
        >
          {isLastStep ? tx("Review criteria", "Kriterien prüfen") : tx("Next question", "Nächste Frage")}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
