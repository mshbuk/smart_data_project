import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  Heart,
  Home,
  Map as MapIcon,
  MessageCircle,
  Share2,
  SlidersHorizontal,
  User,
  type LucideIcon,
} from "lucide-react";
import districts from "./data/districts.json";
import events from "./data/events.json";
import { AuthGate } from "./components/AuthGate";
import { CustomQuestionnaire } from "./components/CustomQuestionnaire";
import { DistrictDetail } from "./components/DistrictDetail";
import { EventsView } from "./components/EventsView";
import { GlobalChatModal } from "./components/GlobalChatModal";
import { MapView } from "./components/MapView";
import { OverviewView } from "./components/OverviewView";
import { ProfilePage } from "./components/ProfilePage";
import { ResultsList } from "./components/ResultsList";
import { SavedComparison } from "./components/SavedComparison";
import type { District, Preferences, UserProfile } from "./types/District";
import type { CityEvent } from "./types/Event";
import { I18nProvider, translate, type Language } from "./i18n";
import { calculateDistrictMatches, profileDefaults } from "./utils/scoring";

type ActiveView = "results" | "map" | "events" | "saved" | "profile";
type AuthGateMode = "guest" | "login" | "register";
type FlowStep = "questionnaire" | "recommendations";
type QuestionnaireBackTarget = "auth" | "recommendations";

type PersistedState = {
  activeView?: ActiveView;
  authGateCompleted?: boolean;
  authMode?: AuthGateMode;
  flowStep?: FlowStep;
  language?: Language;
  preferences?: Preferences;
  likedEventIds?: string[];
  savedDistrictIds?: string[];
  selectedProfile?: UserProfile;
  signedUpEventIds?: string[];
};

type ViewOption = {
  view: ActiveView;
  label: string;
  icon: LucideIcon;
  count?: number;
};

const districtData = districts as District[];
const cityEvents = events as CityEvent[];
const districtIds = new Set(districtData.map((district) => district.id));
const city = "Hamburg";
const storageKey = "district-finder-state-v2";
const userProfiles: UserProfile[] = ["tourist", "family", "longTerm", "custom"];
const activeViews: ActiveView[] = ["results", "map", "events", "saved", "profile"];
const authGateModes: AuthGateMode[] = ["guest", "login", "register"];
const flowSteps: FlowStep[] = ["questionnaire", "recommendations"];
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
      likedEventIds: Array.isArray(parsed.likedEventIds)
        ? parsed.likedEventIds.filter((id): id is string => typeof id === "string")
        : undefined,
      preferences: isPreferences(parsed.preferences) ? parsed.preferences : undefined,
      savedDistrictIds: Array.isArray(parsed.savedDistrictIds)
        ? parsed.savedDistrictIds.filter((id): id is string => typeof id === "string" && districtIds.has(id))
        : undefined,
      selectedProfile: isUserProfile(parsed.selectedProfile) ? parsed.selectedProfile : undefined,
      signedUpEventIds: Array.isArray(parsed.signedUpEventIds)
        ? parsed.signedUpEventIds.filter((id): id is string => typeof id === "string")
        : undefined,
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
  const [flowStep, setFlowStep] = useState<FlowStep>(initialState.flowStep === "recommendations" ? "recommendations" : "questionnaire");
  const [language, setLanguage] = useState<Language>(initialState.language ?? "de");
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [mapFocusDistrictId, setMapFocusDistrictId] = useState<string | null>(null);
  const [showFullResults, setShowFullResults] = useState(false);
  const [questionnaireBackTarget, setQuestionnaireBackTarget] = useState<QuestionnaireBackTarget>("auth");
  const [likedEventIds, setLikedEventIds] = useState<string[]>(initialState.likedEventIds ?? []);
  const [signedUpEventIds, setSignedUpEventIds] = useState<string[]>(initialState.signedUpEventIds ?? []);
  const [isGlobalChatOpen, setIsGlobalChatOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const matches = useMemo(
    () => calculateDistrictMatches(districtData, preferences, selectedProfile, language),
    [language, preferences, selectedProfile],
  );
  const savedMatches = matches.filter((match) => savedDistrictIds.includes(match.district.id));
  const topMatch = matches[0];
  const selectedDetailMatch = selectedDistrictId
    ? matches.find((match) => match.district.id === selectedDistrictId)
    : undefined;
  const selectedEvent = selectedEventId
    ? cityEvents.find((event) => event.id === selectedEventId)
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
      likedEventIds,
      preferences,
      savedDistrictIds,
      selectedProfile,
      signedUpEventIds,
    };

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(stateToStore));
    } catch {
      // Browsers can block storage in private contexts; the app still works for the current session.
    }
  }, [activeView, authGateCompleted, authMode, flowStep, language, likedEventIds, preferences, savedDistrictIds, selectedProfile, signedUpEventIds]);

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
    setLikedEventIds([]);
    setSavedDistrictIds([]);
    setSignedUpEventIds([]);
    setSelectedEventId(null);
    setActiveView("results");
    setShowFullResults(false);
    setQuestionnaireBackTarget("auth");
    setFlowStep("questionnaire");
  };

  const handleAuthContinue = (mode: AuthGateMode) => {
    setAuthMode(mode);
    setAuthGateCompleted(true);
    setSelectedProfile("longTerm");
    setPreferences(profileDefaults.longTerm);
    setSelectedDistrictId(null);
    setSelectedEventId(null);
    setActiveView("results");
    setShowFullResults(false);
    setQuestionnaireBackTarget("auth");
    setFlowStep("questionnaire");
  };

  const handleLogout = () => {
    setAuthGateCompleted(false);
    setAuthMode(undefined);
    setSelectedDistrictId(null);
    setSelectedEventId(null);
    setActiveView("results");
    setShowFullResults(false);
    setQuestionnaireBackTarget("auth");
    setFlowStep("questionnaire");
  };

  const leaveQuestionnaire = () => {
    if (questionnaireBackTarget === "recommendations") {
      setSelectedDistrictId(null);
      setSelectedEventId(null);
      setActiveView("results");
      setFlowStep("recommendations");
      return;
    }

    setAuthGateCompleted(false);
    setAuthMode(undefined);
    setSelectedDistrictId(null);
    setSelectedEventId(null);
    setActiveView("results");
    setShowFullResults(false);
  };

  const openCriteriaEditor = () => {
    setSelectedDistrictId(null);
    setSelectedEventId(null);
    setActiveView("results");
    setShowFullResults(false);
    setQuestionnaireBackTarget("recommendations");
    setFlowStep("questionnaire");
  };

  const finishQuestionnaire = () => {
    setSelectedDistrictId(null);
    setSelectedEventId(null);
    setActiveView("results");
    setShowFullResults(false);
    setQuestionnaireBackTarget("recommendations");
    setFlowStep("recommendations");
  };

  const openMapForDistrict = (districtId: string) => {
    setMapFocusDistrictId(districtId);
    setSelectedDistrictId(null);
    setSelectedEventId(null);
    setActiveView("map");
    setFlowStep("recommendations");
  };

  const toggleEventSignUp = (eventId: string) => {
    setSignedUpEventIds((currentIds) =>
      currentIds.includes(eventId)
        ? currentIds.filter((id) => id !== eventId)
        : [...currentIds, eventId],
    );
  };

  const toggleEventLike = (eventId: string) => {
    setLikedEventIds((currentIds) =>
      currentIds.includes(eventId)
        ? currentIds.filter((id) => id !== eventId)
        : [...currentIds, eventId],
    );
  };

  const shareSelectedEvent = () => {
    if (!selectedEvent) return;

    const url = window.location.href;
    if (navigator.share) {
      void navigator.share({
        text: selectedEvent.description,
        title: selectedEvent.title,
        url,
      });
      return;
    }

    void navigator.clipboard?.writeText(url);
  };

  const viewOptions: ViewOption[] = [
    { view: "results", label: "Start", icon: Home },
    { view: "map", label: tx("Map", "Karte"), icon: MapIcon },
    { view: "events", label: "Events", icon: CalendarDays },
    { view: "saved", label: tx("Compare", "Vergleich"), icon: BarChart3 },
    { view: "profile", label: tx("Profile", "Profil"), icon: User },
  ];
  const headerTitle =
    flowStep === "questionnaire"
      ? tx("Questions", "Fragen")
      : selectedEvent
        ? selectedEvent.title
      : selectedDetailMatch
        ? selectedDetailMatch.district.name
      : activeView === "results"
        ? tx("Your top districts", "Deine Top-Stadtteile")
        : activeView === "map"
          ? tx("Map", "Karte")
          : activeView === "events"
            ? "Events"
            : activeView === "saved"
              ? tx("Compare", "Vergleich")
              : tx("Profile", "Profil");
  const canNavigateBack = flowStep !== "recommendations" || Boolean(selectedDetailMatch) || Boolean(selectedEvent);
  const navigateBack = () => {
    if (selectedEvent) {
      setSelectedEventId(null);
      return;
    }

    if (selectedDetailMatch) {
      setSelectedDistrictId(null);
      return;
    }

    if (flowStep === "questionnaire") {
      leaveQuestionnaire();
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
                className={[
                  "truncate font-display font-semibold text-foreground",
                  selectedEvent ? "text-2xl" : "text-lg",
                ].join(" ")}
                onClick={() => {
                  setSelectedDistrictId(null);
                  setSelectedEventId(null);
                  setActiveView("results");
                  setShowFullResults(false);
                  if (flowStep !== "recommendations") setFlowStep("questionnaire");
                }}
                type="button"
              >
                {headerTitle}
              </button>
            </div>
            <div className="flex shrink-0 items-center gap-2">
            {flowStep === "recommendations" && activeView === "results" && !selectedDetailMatch && !selectedEvent && (
              <button
                className="inline-flex min-h-9 items-center gap-1 rounded-full border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-card"
                onClick={openCriteriaEditor}
                type="button"
              >
                <SlidersHorizontal aria-hidden="true" className="h-3.5 w-3.5" />
                {tx("Adjust answers", "Antworten anpassen")}
              </button>
            )}
            {selectedEvent ? (
              <>
                <button
                  aria-label={likedEventIds.includes(selectedEvent.id) ? tx("Unlike event", "Event nicht mehr liken") : tx("Like event", "Event liken")}
                  className="grid h-10 w-10 place-items-center rounded-full text-foreground transition-colors hover:bg-muted"
                  onClick={() => toggleEventLike(selectedEvent.id)}
                  type="button"
                >
                  <Heart
                    aria-hidden="true"
                    className={likedEventIds.includes(selectedEvent.id) ? "h-7 w-7 fill-rose-500 text-rose-500" : "h-7 w-7"}
                    strokeWidth={2.4}
                  />
                </button>
                <button
                  aria-label={tx("Share event", "Event teilen")}
                  className="grid h-10 w-10 place-items-center rounded-full text-foreground transition-colors hover:bg-muted"
                  onClick={shareSelectedEvent}
                  type="button"
                >
                  <Share2 aria-hidden="true" className="h-7 w-7" strokeWidth={2.4} />
                </button>
              </>
            ) : null}
            <button
              aria-label={tx("Open chats", "Chats öffnen")}
              className={[
                "relative grid place-items-center rounded-full text-foreground transition-colors hover:bg-muted",
                selectedEvent ? "h-10 w-10" : "h-9 w-9 border border-border bg-card shadow-card",
              ].join(" ")}
              onClick={() => setIsGlobalChatOpen(true)}
              type="button"
            >
              <MessageCircle aria-hidden="true" className={selectedEvent ? "h-7 w-7" : "h-4 w-4"} strokeWidth={selectedEvent ? 2.4 : 2} />
              {(selectedEvent ? Math.max(1, signedUpEventIds.length) : signedUpEventIds.length) > 0 && (
                <span className={[
                  "absolute grid place-items-center rounded-full bg-primary px-1 font-bold leading-none text-primary-foreground",
                  selectedEvent ? "-right-0.5 -top-1 h-5 min-w-5 text-xs" : "-right-1 -top-1 h-4 min-w-4 text-[10px]",
                ].join(" ")}>
                  {selectedEvent ? Math.max(1, signedUpEventIds.length) : signedUpEventIds.length}
                </span>
              )}
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
          </div>
        </header>

      <div className={["mx-auto w-full max-w-xl pb-24 pt-4", selectedDetailMatch ? "" : "px-4"].join(" ")}>
        {flowStep === "questionnaire" && (
          <CustomQuestionnaire
            onBack={leaveQuestionnaire}
            onChange={setPreferences}
            onNext={finishQuestionnaire}
            onProfileChange={setSelectedProfile}
            preferences={preferences}
            selectedProfile={selectedProfile}
          />
        )}

        {flowStep === "recommendations" && (
          <>
            {activeView === "results" && showFullResults && !selectedDetailMatch && (
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
                  </div>
                )}
              </div>
            </section>
            )}

            {flowStep === "recommendations" && (
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
                          if (selectedDetailMatch && option.view === "map") {
                            setMapFocusDistrictId(selectedDetailMatch.district.id);
                          }
                          setSelectedDistrictId(null);
                          if (option.view !== "events") setSelectedEventId(null);
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
                onOpenMap={openMapForDistrict}
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
                  openCriteriaEditor();
                }}
                onToggleSave={toggleSave}
                savedDistrictIds={savedDistrictIds}
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
              <EventsView
                onToggleSignUp={toggleEventSignUp}
                onSelectEvent={setSelectedEventId}
                selectedEventId={selectedEventId}
                signedUpEventIds={signedUpEventIds}
              />
            )}
            {!selectedDetailMatch && activeView === "map" && (
              <MapView
                focusedDistrictId={mapFocusDistrictId}
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
                savedEventCount={new Set([...likedEventIds, ...signedUpEventIds]).size}
                onBack={() => {
                  setActiveView("results");
                  setFlowStep("recommendations");
                }}
                onClearLocalData={clearLocalData}
                onEditCriteria={openCriteriaEditor}
                onChangeProfile={() => {
                  openCriteriaEditor();
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
      {isGlobalChatOpen && (
        <GlobalChatModal
          onClose={() => setIsGlobalChatOpen(false)}
          signedUpEventIds={signedUpEventIds}
        />
      )}
    </main>
    </I18nProvider>
  );
}

export default App;
