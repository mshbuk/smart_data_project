import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Heart, List, Map as MapIcon, SlidersHorizontal, User, type LucideIcon } from "lucide-react";
import districts from "./data/districts.json";
import { AuthGate } from "./components/AuthGate";
import { CustomQuestionnaire } from "./components/CustomQuestionnaire";
import { DistrictDetail } from "./components/DistrictDetail";
import { MapView } from "./components/MapView";
import { PreferenceForm } from "./components/PreferenceForm";
import { ProfilePage } from "./components/ProfilePage";
import { ProfileSelector } from "./components/ProfileSelector";
import { ResultsList } from "./components/ResultsList";
import { SavedComparison } from "./components/SavedComparison";
import type { District, Preferences, UserProfile } from "./types/District";
import { I18nProvider, translate, type Language } from "./i18n";
import { calculateDistrictMatches, profileDefaults } from "./utils/scoring";

type ActiveView = "results" | "map" | "saved" | "profile";
type AuthGateMode = "guest" | "login" | "register";
type FlowStep = "profile" | "questionnaire" | "criteria" | "recommendations";

type PersistedState = {
  activeView?: ActiveView;
  authGateCompleted?: boolean;
  authMode?: AuthGateMode;
  flowStep?: FlowStep;
  language?: Language;
  preferences?: Preferences;
  savedDistrictIds?: string[];
  selectedProfile?: UserProfile;
};

type ViewOption = {
  view: ActiveView;
  label: string;
  icon: LucideIcon;
  count?: number;
};

const districtData = districts as District[];
const districtIds = new Set(districtData.map((district) => district.id));
const city = "Hamburg";
const storageKey = "district-finder-state-v2";
const userProfiles: UserProfile[] = ["tourist", "family", "longTerm", "custom"];
const activeViews: ActiveView[] = ["results", "map", "saved", "profile"];
const authGateModes: AuthGateMode[] = ["guest", "login", "register"];
const flowSteps: FlowStep[] = ["profile", "questionnaire", "criteria", "recommendations"];
const languages: Language[] = ["de", "en"];
const preferenceKeys: Array<keyof Preferences> = [
  "maxRentPerSqm",
  "safety",
  "quietness",
  "green",
  "publicTransport",
  "schools",
  "kindergartens",
  "nightlife",
];

function isUserProfile(value: unknown): value is UserProfile {
  return typeof value === "string" && userProfiles.includes(value as UserProfile);
}

function isActiveView(value: unknown): value is ActiveView {
  return typeof value === "string" && activeViews.includes(value as ActiveView);
}

function isAuthGateMode(value: unknown): value is AuthGateMode {
  return typeof value === "string" && authGateModes.includes(value as AuthGateMode);
}

function isFlowStep(value: unknown): value is FlowStep {
  return typeof value === "string" && flowSteps.includes(value as FlowStep);
}

function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && languages.includes(value as Language);
}

function isPreferences(value: unknown): value is Preferences {
  if (!value || typeof value !== "object") return false;

  return preferenceKeys.every((key) => typeof (value as Record<string, unknown>)[key] === "number");
}

function loadPersistedState(): PersistedState {
  if (typeof window === "undefined") return {};

  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return {};

    const parsed = JSON.parse(stored) as PersistedState;

    return {
      activeView: isActiveView(parsed.activeView) ? parsed.activeView : undefined,
      authGateCompleted: typeof parsed.authGateCompleted === "boolean" ? parsed.authGateCompleted : undefined,
      authMode: isAuthGateMode(parsed.authMode) ? parsed.authMode : undefined,
      flowStep: isFlowStep(parsed.flowStep) ? parsed.flowStep : undefined,
      language: isLanguage(parsed.language) ? parsed.language : undefined,
      preferences: isPreferences(parsed.preferences) ? parsed.preferences : undefined,
      savedDistrictIds: Array.isArray(parsed.savedDistrictIds)
        ? parsed.savedDistrictIds.filter((id): id is string => typeof id === "string" && districtIds.has(id))
        : undefined,
      selectedProfile: isUserProfile(parsed.selectedProfile) ? parsed.selectedProfile : undefined,
    };
  } catch {
    return {};
  }
}

function clearPersistedState() {
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // Storage cleanup can fail in locked-down browser contexts.
  }
}

function App() {
  const [initialState] = useState(loadPersistedState);
  const skipNextPersist = useRef(false);
  const [authGateCompleted, setAuthGateCompleted] = useState(initialState.authGateCompleted ?? false);
  const [authMode, setAuthMode] = useState<AuthGateMode | undefined>(initialState.authMode);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile>(initialState.selectedProfile ?? "longTerm");
  const [preferences, setPreferences] = useState<Preferences>(initialState.preferences ?? profileDefaults.longTerm);
  const [savedDistrictIds, setSavedDistrictIds] = useState<string[]>(initialState.savedDistrictIds ?? []);
  const [activeView, setActiveView] = useState<ActiveView>(initialState.activeView ?? "results");
  const [flowStep, setFlowStep] = useState<FlowStep>(initialState.flowStep ?? "profile");
  const [language, setLanguage] = useState<Language>(initialState.language ?? "de");
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [criteriaEditSignal, setCriteriaEditSignal] = useState(0);
  const criteriaPanelRef = useRef<HTMLDivElement | null>(null);

  const matches = useMemo(
    () => calculateDistrictMatches(districtData, preferences, selectedProfile, language),
    [language, preferences, selectedProfile],
  );
  const savedMatches = matches.filter((match) => savedDistrictIds.includes(match.district.id));
  const topMatch = matches[0];
  const selectedDetailMatch = selectedDistrictId
    ? matches.find((match) => match.district.id === selectedDistrictId)
    : undefined;
  const tx = (english: string, german: string) => translate(language, english, german);

  useEffect(() => {
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      clearPersistedState();
      return;
    }

    const stateToStore: PersistedState = {
      activeView,
      authGateCompleted,
      authMode,
      flowStep,
      language,
      preferences,
      savedDistrictIds,
      selectedProfile,
    };

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(stateToStore));
    } catch {
      // Browsers can block storage in private contexts; the app still works for the current session.
    }
  }, [activeView, authGateCompleted, authMode, flowStep, language, preferences, savedDistrictIds, selectedProfile]);

  const handleProfileSelect = (profile: UserProfile) => {
    setSelectedProfile(profile);
    setPreferences(profileDefaults[profile]);
    setSelectedDistrictId(null);
    setFlowStep(profile === "custom" ? "questionnaire" : "criteria");
  };

  const toggleSave = (districtId: string) => {
    setSavedDistrictIds((currentIds) =>
      currentIds.includes(districtId)
        ? currentIds.filter((id) => id !== districtId)
        : [...currentIds, districtId],
    );
  };

  const clearLocalData = () => {
    skipNextPersist.current = true;
    clearPersistedState();
    setAuthGateCompleted(false);
    setAuthMode(undefined);
    setSelectedProfile("longTerm");
    setPreferences(profileDefaults.longTerm);
    setSavedDistrictIds([]);
    setActiveView("results");
    setFlowStep("profile");
  };

  const handleAuthContinue = (mode: AuthGateMode) => {
    setAuthMode(mode);
    setAuthGateCompleted(true);
    setSelectedDistrictId(null);
    setActiveView("results");
    setFlowStep("profile");
  };

  const openCriteriaEditor = () => {
    setSelectedDistrictId(null);
    setActiveView("results");
    setFlowStep("criteria");
    setCriteriaEditSignal((currentSignal) => currentSignal + 1);
    window.requestAnimationFrame(() => {
      criteriaPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const viewOptions: ViewOption[] = [
    { view: "results", label: tx("Results", "Ergebnisse"), icon: List, count: matches.length },
    { view: "map", label: tx("Map", "Karte"), icon: MapIcon },
    { view: "saved", label: tx("Saved", "Gespeichert"), icon: Heart, count: savedDistrictIds.length },
  ];

  if (!authGateCompleted) {
    return (
      <I18nProvider language={language} setLanguage={setLanguage}>
        <AuthGate onContinue={handleAuthContinue} />
      </I18nProvider>
    );
  }

  if (activeView === "profile") {
    return (
      <I18nProvider language={language} setLanguage={setLanguage}>
        <main className="min-h-screen bg-[#f4f7fb] pb-10 font-sans text-slate-950 antialiased">
          <ProfilePage
            city={city}
            favoriteCount={savedDistrictIds.length}
            onBack={() => {
              setActiveView("results");
              setFlowStep("recommendations");
            }}
            onClearLocalData={clearLocalData}
            onEditCriteria={openCriteriaEditor}
            onChangeProfile={() => {
              setSelectedDistrictId(null);
              setActiveView("results");
              setFlowStep("profile");
            }}
            preferences={preferences}
            selectedProfile={selectedProfile}
          />
        </main>
      </I18nProvider>
    );
  }

  return (
    <I18nProvider language={language} setLanguage={setLanguage}>
    <main className="min-h-screen bg-[#f4f7fb] pb-28 font-sans text-slate-950 antialiased md:pb-16">
      <section
        className="relative overflow-hidden bg-slate-950 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.25) 0%, rgba(15,23,42,0.70) 72%), url("${import.meta.env.BASE_URL}hamburg-harbor.png")`,
        }}
      >
        <div className="mx-auto flex min-h-[350px] w-full max-w-[1080px] flex-col justify-end px-4 py-7 md:min-h-[430px] md:px-6 md:py-10">
          <button
            aria-label={tx("Open profile", "Profil öffnen")}
            className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-2xl bg-white/95 text-indigo-600 shadow-xl shadow-slate-950/20 backdrop-blur transition-colors hover:bg-indigo-50 md:right-6 md:top-6"
            onClick={() => {
              setSelectedDistrictId(null);
              setActiveView("profile");
            }}
            type="button"
          >
            <User aria-hidden="true" className="h-6 w-6" strokeWidth={2.5} />
          </button>

          <div className="absolute right-20 top-4 grid grid-cols-2 rounded-2xl bg-white/90 p-1 text-xs font-black shadow-xl shadow-slate-950/20 backdrop-blur md:right-24 md:top-6">
            {languages.map((option) => (
              <button
                aria-pressed={language === option}
                className={[
                  "rounded-xl px-2.5 py-2 transition-colors",
                  language === option ? "bg-indigo-600 text-white" : "text-slate-700 hover:bg-white",
                ].join(" ")}
                key={option}
                onClick={() => setLanguage(option)}
                type="button"
              >
                {option.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="absolute left-4 top-4 flex gap-2 md:left-6 md:top-6">
            <button
              className="min-h-10 rounded-2xl bg-white/90 px-3 text-xs font-black text-slate-800 shadow-lg shadow-slate-950/15 backdrop-blur transition-colors hover:bg-white"
              onClick={() => {
                setSelectedDistrictId(null);
                setActiveView("profile");
              }}
              type="button"
            >
              {tx("Sign in", "Anmelden")}
            </button>
            <button
              className="min-h-10 rounded-2xl bg-indigo-600/95 px-3 text-xs font-black text-white shadow-lg shadow-indigo-950/20 backdrop-blur transition-colors hover:bg-indigo-500"
              onClick={() => {
                setSelectedDistrictId(null);
                setActiveView("profile");
              }}
              type="button"
            >
              {tx("Register", "Registrieren")}
            </button>
          </div>

          <div className="max-w-3xl">
            <h1 className="text-5xl font-black leading-none text-white drop-shadow md:text-7xl">District Finder</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/90 md:text-lg">
              {tx(
                "Find Hamburg districts that match your lifestyle, budget, and priorities with transparent scoring.",
                "Finde Hamburger Stadtteile, die zu deinem Lebensstil, Budget und deinen Prioritäten passen.",
              )}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-6 w-full max-w-[1080px] px-3.5 md:px-6">
        {flowStep === "profile" && (
          <ProfileSelector onSelect={handleProfileSelect} selectedProfile={selectedProfile} />
        )}

        {flowStep === "questionnaire" && (
          <CustomQuestionnaire
            onBack={() => setFlowStep("profile")}
            onChange={setPreferences}
            onNext={() => setFlowStep("criteria")}
            preferences={preferences}
          />
        )}

        {flowStep === "criteria" && (
          <section className="grid gap-4" ref={criteriaPanelRef}>
            <div className="rounded-[1.6rem] border border-white/80 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] md:p-6">
              <p className="text-xs font-black uppercase tracking-wide text-indigo-600">{tx("Criteria review", "Kriterien prüfen")}</p>
              <h2 className="mt-1 text-3xl font-black leading-tight text-slate-950">{tx("These are your criteria", "Das sind deine Kriterien")}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {tx(
                  "These weights come from your selected profile or questionnaire answers. If something feels off, adjust it here before seeing your recommendations.",
                  "Diese Gewichtungen kommen aus deinem Profil oder deinen Antworten. Wenn etwas nicht passt, kannst du es hier vor den Empfehlungen anpassen.",
                )}
              </p>
            </div>

            <PreferenceForm
              defaultExpanded
              expandSignal={criteriaEditSignal}
              onChange={setPreferences}
              preferences={preferences}
            />

            <div className="sticky bottom-4 z-20 grid gap-2 rounded-[1.35rem] border border-white/80 bg-white/95 p-3 shadow-[0_18px_50px_rgba(15,23,42,0.16)] backdrop-blur md:grid-cols-[auto_1fr_auto] md:items-center">
              <button
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 text-sm font-black text-slate-700 transition-colors hover:bg-slate-200"
                onClick={() => setFlowStep(selectedProfile === "custom" ? "questionnaire" : "profile")}
                type="button"
              >
                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                {tx("Back", "Zurück")}
              </button>
              <p className="text-center text-sm font-bold text-slate-600">
                {tx(
                  "You can come back and edit these later from the recommendations page.",
                  "Du kannst diese Kriterien später auf der Empfehlungsseite erneut bearbeiten.",
                )}
              </p>
              <button
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 text-sm font-black text-white shadow-lg shadow-indigo-600/20 transition-colors hover:bg-indigo-700"
                onClick={() => {
                  setSelectedDistrictId(null);
                  setActiveView("results");
                  setFlowStep("recommendations");
                }}
                type="button"
              >
                {tx("See recommendations", "Empfehlungen anzeigen")}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </section>
        )}

        {flowStep === "recommendations" && (
          <>
            <section className="mb-4 px-1">
              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-indigo-600">{tx("Live ranking", "Live-Ranking")}</p>
                  <h2 className="m-0 mt-1 text-2xl font-black text-slate-950">{tx("Your recommendations", "Deine Empfehlungen")}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {tx(
                      `${matches.length} districts ranked by fit. Save favorites to compare them.`,
                      `${matches.length} Stadtteile nach Passung sortiert. Speichere Favoriten für den Vergleich.`,
                    )}
                  </p>
                </div>

                {topMatch && (
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                    <div className="rounded-[1.25rem] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
                      {tx("Top match", "Top-Treffer")}: <span className="font-black">{topMatch.district.name}</span> ({topMatch.score}%)
                    </div>
                    <button
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 text-sm font-black text-white shadow-lg shadow-indigo-600/25 transition-transform hover:-translate-y-0.5"
                      onClick={openCriteriaEditor}
                      type="button"
                    >
                      <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
                      {tx("Edit criteria", "Kriterien bearbeiten")}
                    </button>
                    <button
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-amber-400 px-4 text-sm font-black text-slate-950 shadow-lg shadow-amber-400/25 transition-transform hover:-translate-y-0.5 hover:bg-amber-300"
                      onClick={() => {
                        setSelectedDistrictId(null);
                        setFlowStep("profile");
                      }}
                      type="button"
                    >
                      <User aria-hidden="true" className="h-4 w-4" />
                      {tx("Change profile", "Profil ändern")}
                    </button>
                  </div>
                )}
              </div>
            </section>

            {!selectedDetailMatch && (
              <nav
                aria-label={tx("Recommendation views", "Empfehlungsansichten")}
                className="fixed inset-x-3 bottom-3 z-[1200] mx-auto max-w-[640px] rounded-[1.4rem] border border-white/80 bg-white/95 p-2 shadow-[0_18px_50px_rgba(15,23,42,0.2)] backdrop-blur-xl md:sticky md:inset-x-auto md:top-3 md:bottom-auto md:mb-4 md:max-w-none md:rounded-2xl"
              >
                <div className="grid grid-cols-3 gap-2">
                  {viewOptions.map((option) => {
                    const Icon = option.icon;
                    const isActive = activeView === option.view;

                    return (
                      <button
                        aria-pressed={isActive}
                        className={[
                          "relative flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-xs font-black transition-colors sm:min-h-14 sm:flex-row sm:gap-2 sm:px-3 sm:text-sm",
                          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
                          isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-600 hover:bg-slate-100",
                        ].join(" ")}
                        key={option.view}
                        onClick={() => {
                          setSelectedDistrictId(null);
                          setActiveView(option.view);
                        }}
                        type="button"
                      >
                        <Icon aria-hidden="true" className="h-5 w-5" />
                        <span className="max-w-full truncate">{option.label}</span>
                        {typeof option.count === "number" && (
                          <span
                            className={[
                              "absolute right-2 top-2 grid h-5 min-w-6 place-items-center rounded-full px-1.5 text-[0.62rem] font-black leading-none sm:static sm:h-auto sm:min-w-6 sm:px-1.5 sm:py-0.5 sm:text-xs",
                              isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700",
                            ].join(" ")}
                          >
                            {option.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </nav>
            )}

            {selectedDetailMatch && (
              <DistrictDetail
                isSaved={savedDistrictIds.includes(selectedDetailMatch.district.id)}
                match={selectedDetailMatch}
                onBack={() => setSelectedDistrictId(null)}
                onToggleSave={toggleSave}
                preferences={preferences}
              />
            )}
            {!selectedDetailMatch && activeView === "results" && (
              <ResultsList
                matches={matches}
                onOpenDetails={setSelectedDistrictId}
                onToggleSave={toggleSave}
                savedDistrictIds={savedDistrictIds}
              />
            )}
            {!selectedDetailMatch && activeView === "saved" && (
              <SavedComparison
                onEditCriteria={openCriteriaEditor}
                onFindDistricts={() => setActiveView("results")}
                preferences={preferences}
                savedMatches={savedMatches}
              />
            )}
            {!selectedDetailMatch && activeView === "map" && <MapView matches={matches} />}
          </>
        )}
      </div>
    </main>
    </I18nProvider>
  );
}

export default App;
