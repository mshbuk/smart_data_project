import { ArrowLeft, ArrowRight, Baby, Car, Euro, Music, Train, TreePine, Volume2, type LucideIcon } from "lucide-react";
import { useState } from "react";
import type { Preferences } from "../types/District";
import { useI18n } from "../i18n";

type CustomQuestionnaireProps = {
  preferences: Preferences;
  onBack: () => void;
  onChange: (preferences: Preferences) => void;
  onNext: () => void;
};

type QuestionOption = {
  id: string;
  label: string;
  description: string;
  adjustments: Partial<Preferences>;
};

type Question = {
  id: string;
  eyebrow: string;
  title: string;
  icon: LucideIcon;
  options: QuestionOption[];
};

const questions: Question[] = [
  {
    id: "mobility",
    eyebrow: "Mobility",
    title: "How do you usually move around the city?",
    icon: Train,
    options: [
      {
        id: "transit",
        label: "Mostly HVV",
        description: "Fast public transport is essential.",
        adjustments: { publicTransport: 5 },
      },
      {
        id: "car",
        label: "Mostly car or bike",
        description: "Transit can be useful, but it is not the main filter.",
        adjustments: { publicTransport: 2 },
      },
      {
        id: "mixed",
        label: "A flexible mix",
        description: "Good connections matter, but not at any cost.",
        adjustments: { publicTransport: 4 },
      },
    ],
  },
  {
    id: "household",
    eyebrow: "Household",
    title: "Do schools or kindergartens matter for you?",
    icon: Baby,
    options: [
      {
        id: "none",
        label: "Not relevant",
        description: "No family infrastructure needed right now.",
        adjustments: { schools: 0, kindergartens: 0 },
      },
      {
        id: "kindergarten",
        label: "Kindergarten matters",
        description: "Early-childhood options should be nearby.",
        adjustments: { schools: 2, kindergartens: 5 },
      },
      {
        id: "school",
        label: "Schools matter",
        description: "School access should strongly influence the result.",
        adjustments: { schools: 5, kindergartens: 2 },
      },
      {
        id: "both",
        label: "Both matter",
        description: "Family infrastructure should be a key part of the score.",
        adjustments: { schools: 5, kindergartens: 5 },
      },
    ],
  },
  {
    id: "free-time",
    eyebrow: "Free time",
    title: "Where do you like to spend your free time?",
    icon: TreePine,
    options: [
      {
        id: "parks",
        label: "Parks and green areas",
        description: "Nature access should be visible in the ranking.",
        adjustments: { green: 5, quietness: 4, nightlife: 2 },
      },
      {
        id: "city",
        label: "Cafes, bars, events",
        description: "Central lifestyle and activity should score higher.",
        adjustments: { green: 2, nightlife: 5 },
      },
      {
        id: "home",
        label: "Quiet time at home",
        description: "Calm surroundings matter more than nightlife.",
        adjustments: { quietness: 5, safety: 4, nightlife: 1 },
      },
    ],
  },
  {
    id: "budget",
    eyebrow: "Budget",
    title: "How strict is your rent budget?",
    icon: Euro,
    options: [
      {
        id: "strict",
        label: "Strict",
        description: "Keep the rent ceiling conservative.",
        adjustments: { maxRentPerSqm: 14 },
      },
      {
        id: "balanced",
        label: "Balanced",
        description: "I want a practical middle ground.",
        adjustments: { maxRentPerSqm: 16 },
      },
      {
        id: "flexible",
        label: "Flexible",
        description: "I can pay more for a better lifestyle fit.",
        adjustments: { maxRentPerSqm: 20 },
      },
    ],
  },
  {
    id: "energy",
    eyebrow: "Street energy",
    title: "What kind of neighborhood energy feels right?",
    icon: Volume2,
    options: [
      {
        id: "calm",
        label: "Calm and predictable",
        description: "Quietness and safety should be weighted strongly.",
        adjustments: { quietness: 5, safety: 4, nightlife: 1 },
      },
      {
        id: "lively",
        label: "Lively and social",
        description: "Nightlife and activity should get more weight.",
        adjustments: { quietness: 1, nightlife: 5 },
      },
      {
        id: "balanced",
        label: "Somewhere in between",
        description: "Keep calmness and activity balanced.",
        adjustments: { quietness: 3, nightlife: 3 },
      },
    ],
  },
];

const optionIcons: Record<string, LucideIcon> = {
  car: Car,
  city: Music,
  transit: Train,
};

export function CustomQuestionnaire({ preferences, onBack, onChange, onNext }: CustomQuestionnaireProps) {
  const { tx } = useI18n();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === questions.length;
  const localizedQuestions = questions.map((question) => ({
    ...question,
    eyebrow: tx(question.eyebrow, {
      Mobility: "Mobilitaet",
      Household: "Haushalt",
      "Free time": "Freizeit",
      Budget: "Budget",
      "Street energy": "Atmosphaere",
    }[question.eyebrow] ?? question.eyebrow),
    title: tx(question.title, {
      "How do you usually move around the city?": "Wie bewegst du dich meistens durch die Stadt?",
      "Do schools or kindergartens matter for you?": "Sind Schulen oder Kitas fuer dich wichtig?",
      "Where do you like to spend your free time?": "Wo verbringst du gerne deine Freizeit?",
      "How strict is your rent budget?": "Wie strikt ist dein Mietbudget?",
      "What kind of neighborhood energy feels right?": "Welche Nachbarschaftsatmosphaere passt zu dir?",
    }[question.title] ?? question.title),
    options: question.options.map((option) => ({
      ...option,
      label: tx(option.label, {
        "Mostly HVV": "Meistens HVV",
        "Mostly car or bike": "Meistens Auto oder Fahrrad",
        "A flexible mix": "Flexibler Mix",
        "Not relevant": "Nicht relevant",
        "Kindergarten matters": "Kita ist wichtig",
        "Schools matter": "Schulen sind wichtig",
        "Both matter": "Beides ist wichtig",
        "Parks and green areas": "Parks und Gruenflaechen",
        "Cafes, bars, events": "Cafes, Bars, Events",
        "Quiet time at home": "Ruhige Zeit zu Hause",
        Strict: "Strikt",
        Balanced: "Ausgewogen",
        Flexible: "Flexibel",
        "Calm and predictable": "Ruhig und berechenbar",
        "Lively and social": "Lebendig und sozial",
        "Somewhere in between": "Dazwischen",
      }[option.label] ?? option.label),
      description: tx(option.description, {
        "Fast public transport is essential.": "Schneller OePNV ist zentral.",
        "Transit can be useful, but it is not the main filter.": "OePNV ist praktisch, aber nicht der Hauptfilter.",
        "Good connections matter, but not at any cost.": "Gute Verbindungen zaehlen, aber nicht um jeden Preis.",
        "No family infrastructure needed right now.": "Familieninfrastruktur ist aktuell nicht wichtig.",
        "Early-childhood options should be nearby.": "Kita-Angebote sollten in der Naehe sein.",
        "School access should strongly influence the result.": "Schulzugang soll das Ergebnis stark beeinflussen.",
        "Family infrastructure should be a key part of the score.": "Familieninfrastruktur soll ein wichtiger Teil der Bewertung sein.",
        "Nature access should be visible in the ranking.": "Naturzugang soll im Ranking sichtbar sein.",
        "Central lifestyle and activity should score higher.": "Zentraler Lebensstil und Aktivitaet sollen hoeher zaehlen.",
        "Calm surroundings matter more than nightlife.": "Ruhige Umgebung ist wichtiger als Nachtleben.",
        "Keep the rent ceiling conservative.": "Die Mietgrenze soll konservativ bleiben.",
        "I want a practical middle ground.": "Ich moechte einen praktischen Mittelweg.",
        "I can pay more for a better lifestyle fit.": "Ich kann fuer bessere Passung mehr zahlen.",
        "Quietness and safety should be weighted strongly.": "Ruhe und Sicherheit sollen stark gewichtet werden.",
        "Nightlife and activity should get more weight.": "Nachtleben und Aktivitaet sollen staerker zaehlen.",
        "Keep calmness and activity balanced.": "Ruhe und Aktivitaet sollen ausgewogen bleiben.",
      }[option.description] ?? option.description),
    })),
  }));

  const handleAnswer = (question: Question, option: QuestionOption) => {
    setAnswers((currentAnswers) => ({ ...currentAnswers, [question.id]: option.id }));
    onChange({ ...preferences, ...option.adjustments });
  };

  return (
    <section className="grid gap-4">
      <div className="rounded-[1.6rem] border border-white/80 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] md:p-6">
        <p className="text-xs font-black uppercase tracking-wide text-indigo-600">{tx("Custom setup", "Eigene Auswahl")}</p>
        <h2 className="mt-1 text-3xl font-black leading-tight text-slate-950">{tx("Tell us how you live", "Erzaehle uns, wie du lebst")}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          {tx(
            "Your answers update the criteria automatically. You will review the final weights before seeing recommendations.",
            "Deine Antworten aktualisieren die Kriterien automatisch. Danach pruefst du die Gewichtung vor den Empfehlungen.",
          )}
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-indigo-600" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
        </div>
        <p className="mt-2 text-xs font-black text-slate-500">
          {tx(`${answeredCount} of ${questions.length} answered`, `${answeredCount} von ${questions.length} beantwortet`)}
        </p>
      </div>

      <div className="grid gap-4">
        {localizedQuestions.map((question) => {
          const QuestionIcon = question.icon;

          return (
            <article
              className="rounded-[1.45rem] border border-white/80 bg-white/90 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.07)]"
              key={question.id}
            >
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white">
                  <QuestionIcon aria-hidden="true" className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-indigo-600">{question.eyebrow}</p>
                  <h3 className="mt-1 text-xl font-black text-slate-950">{question.title}</h3>
                </div>
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-3">
                {question.options.map((option) => {
                  const isSelected = answers[question.id] === option.id;
                  const OptionIcon = optionIcons[option.id];

                  return (
                    <button
                      aria-pressed={isSelected}
                      className={[
                        "min-h-[112px] rounded-2xl border p-3 text-left transition-all",
                        isSelected
                          ? "border-indigo-300 bg-indigo-50 ring-4 ring-indigo-100"
                          : "border-slate-100 bg-slate-50 hover:border-indigo-200 hover:bg-white",
                      ].join(" ")}
                      key={option.id}
                      onClick={() => handleAnswer(question, option)}
                      type="button"
                    >
                      <span className="flex items-center gap-2">
                        {OptionIcon && <OptionIcon aria-hidden="true" className="h-4 w-4 text-indigo-600" />}
                        <span className="text-sm font-black text-slate-950">{option.label}</span>
                      </span>
                      <span className="mt-2 block text-sm leading-5 text-slate-600">{option.description}</span>
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>

      <div className="sticky bottom-4 z-20 grid gap-2 rounded-[1.35rem] border border-white/80 bg-white/95 p-3 shadow-[0_18px_50px_rgba(15,23,42,0.16)] backdrop-blur md:grid-cols-[auto_1fr_auto] md:items-center">
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 text-sm font-black text-slate-700 transition-colors hover:bg-slate-200"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          {tx("Back", "Zurueck")}
        </button>
        <p className="text-center text-sm font-bold text-slate-600">
          {isComplete
            ? tx("Ready to review your criteria.", "Bereit, deine Kriterien zu pruefen.")
            : tx("Answer all questions to continue.", "Beantworte alle Fragen, um fortzufahren.")}
        </p>
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 text-sm font-black text-white shadow-lg shadow-indigo-600/20 transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-45"
          disabled={!isComplete}
          onClick={onNext}
          type="button"
        >
          {tx("Review criteria", "Kriterien pruefen")}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
