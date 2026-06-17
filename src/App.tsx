import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CalendarDays,
  Home,
  Map as MapIcon,
  SlidersHorizontal,
  User,
  type LucideIcon,
} from "lucide-react";
import districts from "./data/districts.json";
import { AuthGate } from "./components/AuthGate";
import { CustomQuestionnaire } from "./components/CustomQuestionnaire";
import { DistrictDetail } from "./components/DistrictDetail";
import { EventsView } from "./components/EventsView";
import { MapView } from "./components/MapView";
import { OverviewView } from "./components/OverviewView";
import { PreferenceForm } from "./components/PreferenceForm";
import { ProfilePage } from "./components/ProfilePage";
import { ProfileSelector } from "./components/ProfileSelector";
import { ResultsList } from "./components/ResultsList";
import { SavedComparison } from "./components/SavedComparison";
import { WelcomeIntro } from "./components/WelcomeIntro";
import type { District, Preferences, UserProfile } from "./types/District";
import { I18nProvider, translate, type Language } from "./i18n";
import { calculateDistrictMatches, profileDefaults } from "./utils/scoring";

type ActiveView = "results" | "map" | "events" | "saved" | "profile";
type AuthGateMode = "guest" | "login" | "register";
type FlowStep = "welcome" | "profile" | "questionnaire" | "criteria" | "recommendations";

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
const activeViews: ActiveView[] = ["results", "map", "events", "saved", "profile"];
const authGateModes: AuthGateMode[] = ["guest", "login", "register"];
const flowSteps: FlowStep[] = ["welcome", "profile", "questionnaire", "criteria", "recommendations"];
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
  const [showFullResults, setShowFullResults] = useState(false);
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
    setFlowStep("welcome");
  };

  const handleLogout = () => {
    setAuthGateCompleted(false);
    setAuthMode(undefined);
    setSelectedDistrictId(null);
    setActiveView("results");
    setFlowStep("welcome");
  };

  const handleWelcomeBack = () => {
    setAuthGateCompleted(false);
    setAuthMode(undefined);
    setSelectedDistrictId(null);
    setActiveView("results");
    setFlowStep("welcome");
  };

  const handleWelcomeStart = () => {
    setSelectedDistrictId(null);
    setActiveView("results");
    setShowFullResults(false);
    setFlowStep("profile");
  };

  const openCriteriaEditor = () => {
    setSelectedDistrictId(null);
    setActiveView("results");
    setShowFullResults(false);
    setFlowStep("criteria");
    setCriteriaEditSignal((currentSignal) => currentSignal + 1);
    window.requestAnimationFrame(() => {
      criteriaPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const viewOptions: ViewOption[] = [
    { view: "results", label: tx("Overview", "Übersicht"), icon: Home },
    { view: "map", label: tx("Map", "Karte"), icon: MapIcon },
    { view: "events", label: "Events", icon: CalendarDays },
    { view: "saved", label: tx("Compare", "Vergleich"), icon: BarChart3 },
    { view: "profile", label: tx("Profile", "Profil"), icon: User },
  ];
  const headerTitle =
    flowStep === "welcome"
      ? "Hamburg Finder"
      : flowStep === "profile"
        ? tx("Questions", "Fragen")
        : flowStep === "questionnaire"
          ? tx("Questions", "Fragen")
          : flowStep === "criteria"
            ? tx("Criteria", "Kriterien")
            : activeView === "results"
              ? tx("Results", "Ergebnisse")
              : activeView === "map"
                ? tx("Map", "Karte")
                : activeView === "events"
                  ? "Events"
                  : activeView === "saved"
                    ? tx("Compare", "Vergleich")
                    : tx("Profile", "Profil");
  const canNavigateBack = flowStep !== "recommendations";
  const navigateBack = () => {
    if (flowStep === "welcome") {
      handleWelcomeBack();
      return;
    }

    if (flowStep === "profile") {
      setFlowStep("welcome");
      return;
    }

    if (flowStep === "questionnaire") {
      setFlowStep("profile");
      return;
    }

    if (flowStep === "criteria") {
      setFlowStep(selectedProfile === "custom" ? "questionnaire" : "profile");
    }
  };

  if (!authGateCompleted) {
    return (
      <I18nProvider language={language} setLanguage={setLanguage}>
        <AuthGate onContinue={handleAuthContinue} />
      </I18nProvider>
    );
  }

  return (
    <I18nProvider language={language} setLanguage={setLanguage}>
    <main className="min-h-screen bg-background pb-24 font-sans text-foreground antialiased">
      {!selectedDetailMatch && (
        <header className="sticky top-0 z-[1300] border-b border-border bg-background/85 backdrop-blur-md">
          <div className="mx-auto flex min-h-[3.5rem] w-full max-w-xl items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              {canNavigateBack && (
                <button
                  aria-label={tx("Back", "Zurück")}
                  className="-ml-1 rounded-full p-1.5 transition-colors hover:bg-muted"
                  onClick={navigateBack}
                  type="button"
                >
                  <ArrowLeft aria-hidden="true" className="h-5 w-5" />
                </button>
              )}
              <button
                className="truncate font-display text-lg font-semibold text-foreground"
                onClick={() => {
                  setSelectedDistrictId(null);
                  setActiveView("results");
                  setShowFullResults(false);
                  if (flowStep !== "recommendations") setFlowStep("welcome");
                }}
                type="button"
              >
                {headerTitle}
              </button>
            </div>
            <button
              aria-label={tx("Open profile", "Profil öffnen")}
              className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-sm font-black text-primary transition-colors hover:bg-accent"
              onClick={() => {
                setSelectedDistrictId(null);
                setActiveView("profile");
                setFlowStep("recommendations");
              }}
              type="button"
            >
              {authMode === "guest" ? "G" : "M"}
            </button>
            <div className="grid grid-cols-2 rounded-full border border-border bg-card p-0.5 text-[11px] font-semibold shadow-card">
              {(["de", "en"] as const).map((option) => (
                <button
                  aria-pressed={language === option}
                  className={[
                    "rounded-full px-2.5 py-1 transition-colors",
                    language === option ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
                  ].join(" ")}
                  key={option}
                  onClick={() => setLanguage(option)}
                  type="button"
                >
                  {option.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </header>
      )}

      <div className={selectedDetailMatch ? "mx-auto w-full max-w-xl" : "mx-auto w-full max-w-xl px-4 pb-24 pt-4"}>
        {flowStep === "welcome" && (
          <WelcomeIntro onBack={handleWelcomeBack} onStart={handleWelcomeStart} />
        )}

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
              <p className="text-xs font-black uppercase tracking-wide text-slate-950">{tx("Criteria review", "Kriterien prüfen")}</p>
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
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white shadow-lg shadow-slate-950/15 transition-colors hover:bg-slate-800"
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
            {activeView === "results" && showFullResults && (
            <section className="mb-4 px-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-medium text-slate-500">
                    {tx(
                      "Based on your answers",
                      "Basierend auf deinen Antworten",
                    )}
                  </p>
                  {topMatch && (
                    <p className="mt-1 text-sm font-bold text-slate-600">
                      {tx("Top match", "Top-Treffer")}: <span className="text-slate-950">{topMatch.district.name}</span> · {topMatch.score}%
                    </p>
                  )}
                </div>

                {topMatch && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
                      onClick={openCriteriaEditor}
                      type="button"
                    >
                      <SlidersHorizontal aria-hidden="true" className="h-4 w-4 text-slate-950" />
                      {tx("Adjust answers", "Antworten anpassen")}
                    </button>
                    <button
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full moin-gradient-primary px-4 text-sm font-black text-white shadow-lg shadow-slate-950/15 transition-transform hover:-translate-y-0.5"
                      onClick={() => {
                        setSelectedDistrictId(null);
                        setFlowStep("profile");
                        setShowFullResults(false);
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
            )}

            {!selectedDetailMatch && (
              <nav
                aria-label={tx("Recommendation views", "Empfehlungsansichten")}
                className="fixed inset-x-0 bottom-0 z-[1200] mx-auto max-w-xl border-t border-border bg-background/95 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md"
              >
                <div className="flex items-stretch justify-around">
                  {viewOptions.map((option) => {
                    const Icon = option.icon;
                    const isActive = activeView === option.view;

                    return (
                      <button
                        aria-pressed={isActive}
                        className={[
                          "relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5 text-[11px] font-medium transition-colors",
                          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                        ].join(" ")}
                        key={option.view}
                        onClick={() => {
                          setSelectedDistrictId(null);
                          setActiveView(option.view);
                          if (option.view === "results") setShowFullResults(false);
                        }}
                        type="button"
                      >
                        <Icon aria-hidden="true" className={["h-5 w-5", isActive ? "" : "opacity-80"].join(" ")} strokeWidth={isActive ? 2.4 : 1.8} />
                        <span className="max-w-full truncate leading-none">{option.label}</span>
                        {typeof option.count === "number" && (
                          <span
                            className={[
                              "absolute right-2 top-2 grid h-5 min-w-6 place-items-center rounded-full px-1.5 text-[0.62rem] font-black leading-none sm:static sm:h-auto sm:min-w-6 sm:px-1.5 sm:py-0.5 sm:text-xs",
                              isActive ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700",
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
            {!selectedDetailMatch && activeView === "results" && !showFullResults && (
              <OverviewView
                matches={matches}
                onOpenDetails={setSelectedDistrictId}
                onShowAllResults={() => setShowFullResults(true)}
                onStartFinder={() => {
                  setSelectedDistrictId(null);
                  setFlowStep("profile");
                  setShowFullResults(false);
                }}
              />
            )}
            {!selectedDetailMatch && activeView === "results" && showFullResults && (
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
            {!selectedDetailMatch && activeView === "events" && (
              <EventsView />
            )}
            {!selectedDetailMatch && activeView === "map" && (
              <MapView
                matches={matches}
                onOpenDetails={setSelectedDistrictId}
                onToggleSave={toggleSave}
                savedDistrictIds={savedDistrictIds}
              />
            )}
            {!selectedDetailMatch && activeView === "profile" && (
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
                onLogout={handleLogout}
                onOpenComparison={() => setActiveView("saved")}
                preferences={preferences}
                selectedProfile={selectedProfile}
              />
            )}
          </>
        )}
      </div>
    </main>
    </I18nProvider>
  );
}

export default App;
