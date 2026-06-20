import {
  Baby,
  Briefcase,
  Check,
  GraduationCap,
  Home,
  Music,
  Sparkles,
  ShieldCheck,
  Train,
  Trees,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import type { Preferences, UserProfile } from "../types/District";
import { useI18n } from "../i18n";
import { profileDefaults } from "../utils/scoring";

type CustomQuestionnaireProps = {
  preferences: Preferences;
  selectedProfile: UserProfile;
  onBack: () => void;
  onChange: (preferences: Preferences) => void;
  onProfileChange: (profile: UserProfile) => void;
  onNext: () => void;
};

type PriorityKey = Exclude<keyof Preferences, "maxRentPerSqm">;

type Priority = {
  key: PriorityKey;
  icon: LucideIcon;
  label: { de: string; en: string };
  description: { de: string; en: string };
};

type PersonaOption = {
  profile: UserProfile;
  icon: LucideIcon;
  label: { de: string; en: string };
  description: { de: string; en: string };
};

const totalSteps = 4;

const personaOptions: PersonaOption[] = [
  {
    profile: "longTerm",
    icon: Home,
    label: { de: "Ich ziehe alleine um", en: "I am moving alone" },
    description: {
      de: "Für Studierende, Berufseinsteiger und alle, die langfristig in Hamburg wohnen möchten.",
      en: "For students, young professionals, and anyone planning to live in Hamburg long term.",
    },
  },
  {
    profile: "family",
    icon: Baby,
    label: { de: "Wir ziehen als Familie um", en: "We are moving as a family" },
    description: {
      de: "Füllt Sicherheit, Ruhe, Grünflächen, Schulen und Kitas stärker vor.",
      en: "Prefills safety, calm, green space, schools, and daycare as stronger priorities.",
    },
  },
  {
    profile: "tourist",
    icon: Briefcase,
    label: { de: "Ich bin als Tourist hier", en: "I am visiting as a tourist" },
    description: {
      de: "Legt mehr Gewicht auf ÖPNV, Nachtleben und lebendige Stadtteile.",
      en: "Prioritizes transit, nightlife, and lively neighborhoods.",
    },
  },
];

const priorities: Priority[] = [
  {
    key: "safety",
    icon: ShieldCheck,
    label: { de: "Sicherheit", en: "Safety" },
    description: {
      de: "Wenig Kriminalität, gute Beleuchtung und ein entspanntes Gefühl im Alltag.",
      en: "Low crime, good lighting, and a calm everyday feeling.",
    },
  },
  {
    key: "publicTransport",
    icon: Train,
    label: { de: "ÖPNV", en: "Transit" },
    description: {
      de: "Schnelle U-Bahn-, S-Bahn- und Busverbindungen durch Hamburg.",
      en: "Fast U-Bahn, S-Bahn, and bus connections across Hamburg.",
    },
  },
  {
    key: "green",
    icon: Trees,
    label: { de: "Natur", en: "Nature" },
    description: {
      de: "Parks, Wasser, Sportflächen und Orte zum Durchatmen.",
      en: "Parks, water, sport areas, and everyday breathing room.",
    },
  },
  {
    key: "nightlife",
    icon: Music,
    label: { de: "Nachtleben", en: "Nightlife" },
    description: {
      de: "Bars, Kultur, Events und lebendige Abende in der Nähe.",
      en: "Bars, culture, events, and lively evenings nearby.",
    },
  },
  {
    key: "quietness",
    icon: Wind,
    label: { de: "Ruhe", en: "Calm" },
    description: {
      de: "Ruhigere Wohnstraßen und weniger hektischer Alltag.",
      en: "Quieter residential streets and a less hectic daily rhythm.",
    },
  },
  {
    key: "schools",
    icon: GraduationCap,
    label: { de: "Schulen", en: "Schools" },
    description: {
      de: "Schulnähe und familienfreundliche Bildungsinfrastruktur.",
      en: "School access and family-friendly education infrastructure.",
    },
  },
  {
    key: "kindergartens",
    icon: Baby,
    label: { de: "Kitas", en: "Daycare" },
    description: {
      de: "Kitas und Angebote für Familien mit kleinen Kindern.",
      en: "Daycare and support for families with young children.",
    },
  },
];

function localized<T>(language: "de" | "en", value: { de: T; en: T }) {
  return value[language];
}

function monthlyToRentPerSqm(value: number) {
  return Math.min(Math.max(Math.round((value / 55) * 10) / 10, 8), 30);
}

function rentPerSqmToMonthly(value: number) {
  return Math.round(value * 55 / 50) * 50;
}

function demoRequestToPreferences(request: string): Preferences {
  const normalized = request.toLocaleLowerCase("de-DE");
  const next = { ...profileDefaults.custom };
  const includesAny = (terms: string[]) => terms.some((term) => normalized.includes(term));

  if (includesAny(["ruhig", "ruhe", "quiet", "calm", "wenig lärm"])) {
    next.quietness = 5;
    next.nightlife = Math.min(next.nightlife, 2);
  }
  if (includesAny(["famil", "kind", "schule", "kita", "school", "daycare"])) {
    next.safety = 5;
    next.quietness = Math.max(next.quietness, 4);
    next.green = Math.max(next.green, 4);
    next.schools = 5;
    next.kindergartens = 5;
    next.nightlife = Math.min(next.nightlife, 2);
  }
  if (includesAny(["park", "natur", "grün", "green", "wasser", "water", "elbe", "alster"])) {
    next.green = 5;
  }
  if (includesAny(["sicher", "safety", "safe", "wenig kriminalität"])) {
    next.safety = 5;
  }
  if (includesAny(["öpnv", "bahn", "bus", "zentral", "central", "transit", "commute", "arbeitsweg"])) {
    next.publicTransport = 5;
  }
  if (includesAny(["bar", "party", "nachtleben", "nightlife", "kultur", "event", "café", "cafe", "lebendig", "lively"])) {
    next.nightlife = 5;
    next.quietness = Math.min(next.quietness, 2);
  }
  if (includesAny(["student", "studium", "universität", "university"])) {
    next.maxRentPerSqm = 14;
    next.publicTransport = 5;
    next.nightlife = Math.max(next.nightlife, 4);
  }
  if (includesAny(["günstig", "bezahlbar", "preiswert", "budget", "cheap", "affordable"])) {
    next.maxRentPerSqm = 13;
  }
  if (includesAny(["tourist", "besuch", "urlaub", "visit", "short stay", "kurzaufenthalt"])) {
    next.publicTransport = 5;
    next.nightlife = Math.max(next.nightlife, 4);
    next.schools = 0;
    next.kindergartens = 0;
  }

  const monthlyBudget = normalized.match(/\b([4-9]\d{2}|[1-3]\d{3})\s*(?:€|euro)/)?.[1];
  if (monthlyBudget) next.maxRentPerSqm = monthlyToRentPerSqm(Number(monthlyBudget));

  return next;
}

function FollowUp({ title, question, children }: { title: string; question: string; children: ReactNode }) {
  return (
    <div className="mt-4 rounded-2xl border border-border bg-card p-4">
      <p className="mb-2 text-sm font-semibold">{title}</p>
      <p className="mb-3 text-xs text-muted-foreground">{question}</p>
      {children}
    </div>
  );
}

export function CustomQuestionnaire({
  preferences,
  selectedProfile,
  onBack,
  onChange,
  onProfileChange,
  onNext,
}: CustomQuestionnaireProps) {
  const { language, tx } = useI18n();
  const [step, setStep] = useState(1);
  const [aiRequest, setAiRequest] = useState("");
  const [rooms, setRooms] = useState(2);
  const [rentMin, setRentMin] = useState(600);
  const [rentMax, setRentMax] = useState(() => Math.max(700, rentPerSqmToMonthly(preferences.maxRentPerSqm)));
  const [selectedChips, setSelectedChips] = useState<Set<string>>(() => new Set());
  const [preferencesBeforeExtras, setPreferencesBeforeExtras] = useState<Preferences | null>(null);
  const progress = (step / totalSteps) * 100;

  const applyProfile = (profile: UserProfile) => {
    const defaults = profileDefaults[profile];
    onProfileChange(profile);
    onChange(defaults);
    setRentMax(Math.max(700, rentPerSqmToMonthly(defaults.maxRentPerSqm)));
    setSelectedChips(new Set());
    setPreferencesBeforeExtras(null);
    if (profile !== "custom") setAiRequest("");
  };

  const setPreference = (key: PriorityKey, value: number) => {
    onChange({
      ...preferences,
      [key]: value,
    });
  };

  const setRentRange = (nextMin: number, nextMax: number) => {
    setRentMin(nextMin);
    setRentMax(nextMax);
    onChange({
      ...preferences,
      maxRentPerSqm: monthlyToRentPerSqm(nextMax),
    });
  };

  const toggleChip = (chip: string, updates: Partial<Preferences>) => {
    const next = new Set(selectedChips);
    const active = next.has(chip);
    if (active) {
      next.delete(chip);
      setSelectedChips(next);
      return;
    }

    next.add(chip);
    setSelectedChips(next);
    onChange({
      ...preferences,
      ...updates,
    });
  };

  const next = () => {
    if (step === 1 && selectedProfile === "custom") {
      const translatedPreferences = demoRequestToPreferences(aiRequest);
      onChange(translatedPreferences);
      setRentMax(Math.max(700, rentPerSqmToMonthly(translatedPreferences.maxRentPerSqm)));
    }

    if (step < totalSteps) {
      if (step === 2) {
        setPreferencesBeforeExtras(preferences);
      }

      setStep((current) => current + 1);
      return;
    }

    onNext();
  };

  const back = () => {
    if (step > 1) {
      setStep((current) => current - 1);
      return;
    }

    onBack();
  };

  const skip = () => {
    if (step === 2) {
      const profileDefaultsForSkip = profileDefaults[selectedProfile === "custom" ? "longTerm" : selectedProfile];
      const defaultCriteria = {
        ...profileDefaultsForSkip,
        maxRentPerSqm: preferences.maxRentPerSqm,
      };
      onChange(defaultCriteria);
      setPreferencesBeforeExtras(defaultCriteria);
    }

    if (step === 3) {
      if (preferencesBeforeExtras) {
        onChange(preferencesBeforeExtras);
      }
      setSelectedChips(new Set());
    }

    if (step === 4) {
      const profileDefaultsForSkip = profileDefaults[selectedProfile === "custom" ? "longTerm" : selectedProfile];
      onChange({
        ...preferences,
        maxRentPerSqm: profileDefaultsForSkip.maxRentPerSqm,
      });
      setRentMax(Math.max(700, rentPerSqmToMonthly(profileDefaultsForSkip.maxRentPerSqm)));
      onNext();
      return;
    }

    setStep((current) => Math.min(current + 1, totalSteps));
  };

  const chipButton = (label: string, updates: Partial<Preferences>) => {
    const active = selectedChips.has(label);

    return (
      <button
        className={[
          "rounded-full border px-3 py-1.5 text-xs font-medium transition",
          active
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background hover:border-primary/40",
        ].join(" ")}
        key={label}
        onClick={() => toggleChip(label, updates)}
        type="button"
      >
        {active ? "✓ " : ""}
        {label}
      </button>
    );
  };

  return (
    <section>
      <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-gradient-primary transition-all" style={{ width: `${progress}%` }} />
      </div>

      {step === 1 && (
        <section>
          <h2 className="font-display text-2xl font-semibold">
            {tx("What brings you to Hamburg?", "Was führt Sie nach Hamburg?")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {tx(
              "Choose the situation that fits best. We will prefill the district criteria for you.",
              "Wählen Sie die Situation, die am besten passt. Wir füllen die Stadtteil-Kriterien passend vor.",
            )}
          </p>
          <div className="mt-6 space-y-3">
            {personaOptions.map(({ profile, icon: Icon, label, description }) => {
              const active = selectedProfile === profile;

              return (
                <button
                  className={[
                    "flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition",
                    active ? "border-primary bg-primary-soft" : "border-border bg-card hover:border-primary/40",
                  ].join(" ")}
                  key={profile}
                  onClick={() => applyProfile(profile)}
                  type="button"
                >
                  <div
                    className={[
                      "grid h-10 w-10 place-items-center rounded-xl",
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                    ].join(" ")}
                  >
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{localized(language, label)}</span>
                    <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                      {localized(language, description)}
                    </span>
                  </span>
                  {active && <Check aria-hidden="true" className="h-5 w-5 text-primary" />}
                </button>
              );
            })}

            <div className={selectedProfile === "custom" ? "overflow-hidden rounded-2xl border border-primary bg-primary-soft" : "overflow-hidden rounded-2xl border border-border bg-card"}>
              <button
                aria-pressed={selectedProfile === "custom"}
                className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-primary-soft/60"
                onClick={() => applyProfile("custom")}
                type="button"
              >
                <span className={selectedProfile === "custom" ? "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground" : "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-foreground"}>
                  <Sparkles aria-hidden="true" className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2 font-medium">
                    {tx("Describe it in your own words", "Mit eigenen Worten beschreiben")}
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase text-primary-foreground">AI-Demo</span>
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                    {tx("Tell us what you are looking for and the demo will suggest matching criteria.", "Beschreiben Sie, wonach Sie suchen. Die Demo schlägt dazu passende Kriterien vor.")}
                  </span>
                </span>
                {selectedProfile === "custom" && <Check aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />}
              </button>

              {selectedProfile === "custom" && (
                <div className="border-t border-primary/20 p-4 pt-3">
                  <label className="text-xs font-semibold text-foreground" htmlFor="ai-district-request">
                    {tx("What would your ideal neighborhood be like?", "Wie soll Ihr idealer Stadtteil sein?")}
                  </label>
                  <textarea
                    autoFocus
                    className="mt-2 min-h-28 w-full resize-none rounded-2xl border border-border bg-background px-3 py-3 text-sm leading-relaxed outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    id="ai-district-request"
                    onChange={(event) => setAiRequest(event.target.value)}
                    placeholder={tx(
                      "For example: Quiet, affordable, close to parks and well connected to the city center...",
                      "Zum Beispiel: Ruhig, bezahlbar, nah an Parks und gut an die Innenstadt angebunden...",
                    )}
                    value={aiRequest}
                  />
                  <p className="mt-2 text-xs leading-relaxed text-amber-700">
                    {tx(
                      "This feature is not working properly yet, we are working on it.",
                      "Diese Funktion funktioniert noch nicht richtig, wir arbeiten daran.",
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {step === 2 && (
        <section>
          <h2 className="font-display text-2xl font-semibold">
            {tx("What is especially important to you in a district?", "Was ist dir bei einem Stadtteil besonders wichtig?")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {tx(
              "Tune every priority. These values directly drive the district ranking.",
              "Stelle jede Priorität ein. Diese Werte steuern direkt das Stadtteil-Ranking.",
            )}
          </p>
          <div className="mt-6 space-y-4">
            {priorities.map((priority) => {
              const Icon = priority.icon;
              const value = preferences[priority.key];

              return (
                <div className="rounded-2xl border border-border bg-card p-3" key={priority.key}>
                  <div className="mb-1 flex items-center gap-2">
                    <Icon aria-hidden="true" className="h-4 w-4 text-primary" />
                    <span className="flex-1 text-sm font-semibold">{localized(language, priority.label)}</span>
                    <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold tabular-nums text-accent-foreground">
                      {value}
                    </span>
                  </div>
                  <p className="mb-2 text-xs text-muted-foreground">{localized(language, priority.description)}</p>
                  <input
                    aria-label={localized(language, priority.label)}
                    className="w-full accent-[var(--primary)]"
                    max={5}
                    min={0}
                    onChange={(event) => setPreference(priority.key, Number(event.target.value))}
                    step={1}
                    type="range"
                    value={value}
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {step === 3 && (
        <section>
          <h2 className="font-display text-2xl font-semibold">
            {tx("A few extra details", "Ein paar Details extra")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {tx(
              "Choose anything that describes your daily life. These chips gently strengthen related priorities.",
              "Wähle alles, was deinen Alltag beschreibt. Die Chips verstärken passende Prioritäten.",
            )}
          </p>

          <FollowUp
            question={tx("Where should transit take you quickly?", "Wohin soll der ÖPNV dich schnell bringen?")}
            title="ÖPNV"
          >
            <div className="flex flex-wrap gap-2">
              {chipButton(tx("Work", "Arbeit"), { publicTransport: Math.max(preferences.publicTransport, 4) })}
              {chipButton(tx("University", "Universität"), { publicTransport: Math.max(preferences.publicTransport, 4) })}
              {chipButton(tx("City center", "Innenstadt"), { publicTransport: Math.max(preferences.publicTransport, 5) })}
              {chipButton(tx("Airport", "Flughafen"), { publicTransport: Math.max(preferences.publicTransport, 4) })}
              {chipButton(tx("Leisure", "Freizeit"), { publicTransport: Math.max(preferences.publicTransport, 3) })}
            </div>
          </FollowUp>

          <FollowUp
            question={tx("What does safety mean for you?", "Was bedeutet Sicherheit für dich?")}
            title={tx("Safety", "Sicherheit")}
          >
            <div className="flex flex-wrap gap-2">
              {chipButton(tx("Low crime", "Wenig Kriminalität"), { safety: Math.max(preferences.safety, 5) })}
              {chipButton(tx("Quiet residential area", "Ruhige Wohngegend"), {
                quietness: Math.max(preferences.quietness, 4),
                safety: Math.max(preferences.safety, 4),
              })}
              {chipButton(tx("Good lighting", "Gute Beleuchtung"), { safety: Math.max(preferences.safety, 4) })}
            </div>
          </FollowUp>

          <FollowUp
            question={tx("Which green-space qualities matter?", "Welche Grün-Qualitäten zählen?")}
            title={tx("Nature", "Natur")}
          >
            <div className="flex flex-wrap gap-2">
              {chipButton(tx("Parks", "Parks"), { green: Math.max(preferences.green, 5) })}
              {chipButton(tx("Water", "Wasser (Alster/Elbe)"), { green: Math.max(preferences.green, 4) })}
              {chipButton(tx("Sports", "Sportmöglichkeiten"), { green: Math.max(preferences.green, 4) })}
              {chipButton(tx("Nature and calm", "Natur & Ruhe"), {
                green: Math.max(preferences.green, 4),
                quietness: Math.max(preferences.quietness, 4),
              })}
            </div>
          </FollowUp>

          <FollowUp
            question={tx("Which city-life options should be close?", "Welches Stadtleben soll nah sein?")}
            title={tx("City life", "Stadtleben")}
          >
            <div className="flex flex-wrap gap-2">
              {chipButton(tx("Cafes", "Cafés"), { nightlife: Math.max(preferences.nightlife, 3) })}
              {chipButton(tx("Bars", "Bars"), { nightlife: Math.max(preferences.nightlife, 5) })}
              {chipButton("Events", { nightlife: Math.max(preferences.nightlife, 4) })}
            </div>
          </FollowUp>
        </section>
      )}

      {step === 4 && (
        <section>
          <h2 className="font-display text-2xl font-semibold">
            {tx("Budget and apartment size", "Budget und Wohnungsgröße")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {tx(
              "Your monthly budget is used directly for the recommendation.",
              "Dein monatliches Budget wird direkt für die Empfehlung verwendet.",
            )}
          </p>

          <div className="mt-6 rounded-2xl border border-border bg-card p-4">
            <p className="mb-2 text-sm font-medium">
              {tx("Rooms", "Zimmer")}:{" "}
              <span className="text-primary">
                {rooms}
                {rooms >= 5 ? "+" : ""}
              </span>
            </p>
            <div className="grid grid-cols-5 gap-2">
              {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((roomCount) => (
                <button
                  className={[
                    "rounded-xl border py-2 text-sm font-semibold transition",
                    rooms === roomCount
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:border-primary/40",
                  ].join(" ")}
                  key={roomCount}
                  onClick={() => setRooms(roomCount)}
                  type="button"
                >
                  {roomCount}
                  {roomCount === 5 ? "+" : ""}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-card p-4">
            <p className="mb-2 text-sm font-medium">{tx("Rent", "Miete")}</p>
            <p className="mb-3 text-base font-semibold text-primary tabular-nums">
              {rentMin} € - {rentMax} € {tx("per month", "pro Monat")}
            </p>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Min</label>
                <input
                  className="w-full accent-[var(--primary)]"
                  max={3000}
                  min={400}
                  onChange={(event) => setRentRange(Math.min(Number(event.target.value), rentMax - 50), rentMax)}
                  step={50}
                  type="range"
                  value={rentMin}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Max</label>
                <input
                  className="w-full accent-[var(--primary)]"
                  max={3000}
                  min={400}
                  onChange={(event) => setRentRange(rentMin, Math.max(Number(event.target.value), rentMin + 50))}
                  step={50}
                  type="range"
                  value={rentMax}
                />
              </div>
            </div>
          </div>

        </section>
      )}

      <div className="mt-8 flex items-center gap-2">
        <button
          className="rounded-2xl border border-border px-5 py-3 text-sm font-medium"
          onClick={back}
          type="button"
        >
          {tx("Back", "Zurück")}
        </button>
        <button
          className="flex-1 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-soft"
          onClick={next}
          type="button"
        >
          {step === totalSteps ? tx("See results", "Ergebnisse ansehen") : tx("Continue", "Weiter")}
        </button>
      </div>

      {(step === 2 || step === 3 || step === 4) && (
        <button
          className="mx-auto mt-3 block text-sm text-muted-foreground underline-offset-4 hover:underline"
          onClick={skip}
          type="button"
        >
          {tx("Skip", "Überspringen")}
        </button>
      )}
    </section>
  );
}
