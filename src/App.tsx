import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { Heart, List, Map as MapIcon, User, type LucideIcon } from "lucide-react";
import districts from "./data/districts.json";
import { MapView } from "./components/MapView";
import { PreferenceForm } from "./components/PreferenceForm";
import { ProfilePage } from "./components/ProfilePage";
import { ProfileSelector } from "./components/ProfileSelector";
import { ResultsList } from "./components/ResultsList";
import { SavedComparison } from "./components/SavedComparison";
import type { District, Preferences, UserProfile } from "./types/District";
import { calculateDistrictMatches, profileDefaults } from "./utils/scoring";

type ActiveView = "results" | "map" | "saved" | "profile";

type PersistedState = {
  activeView?: ActiveView;
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
const userProfiles: UserProfile[] = ["tourist", "family", "longTerm"];
const activeViews: ActiveView[] = ["results", "map", "saved", "profile"];
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
  const [selectedProfile, setSelectedProfile] = useState<UserProfile>(initialState.selectedProfile ?? "longTerm");
  const [preferences, setPreferences] = useState<Preferences>(initialState.preferences ?? profileDefaults.longTerm);
  const [savedDistrictIds, setSavedDistrictIds] = useState<string[]>(initialState.savedDistrictIds ?? []);
  const [activeView, setActiveView] = useState<ActiveView>(initialState.activeView ?? "results");

  const matches = useMemo(
    () => calculateDistrictMatches(districtData, preferences, selectedProfile),
    [preferences, selectedProfile],
  );
  const savedMatches = matches.filter((match) => savedDistrictIds.includes(match.district.id));
  const topMatch = matches[0];

  useEffect(() => {
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      clearPersistedState();
      return;
    }

    const stateToStore: PersistedState = {
      activeView,
      preferences,
      savedDistrictIds,
      selectedProfile,
    };

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(stateToStore));
    } catch {
      // Browsers can block storage in private contexts; the app still works for the current session.
    }
  }, [activeView, preferences, savedDistrictIds, selectedProfile]);

  const handleProfileSelect = (profile: UserProfile) => {
    setSelectedProfile(profile);
    setPreferences(profileDefaults[profile]);
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
    setSelectedProfile("longTerm");
    setPreferences(profileDefaults.longTerm);
    setSavedDistrictIds([]);
    setActiveView("profile");
  };

  const viewOptions: ViewOption[] = [
    { view: "results", label: "Results", icon: List, count: matches.length },
    { view: "map", label: "Map", icon: MapIcon },
    { view: "saved", label: "Saved", icon: Heart, count: savedDistrictIds.length },
  ];

  if (activeView === "profile") {
    return (
      <main className="min-h-screen bg-[#f4f7fb] pb-10 font-sans text-slate-950 antialiased">
        <ProfilePage
          city={city}
          favoriteCount={savedDistrictIds.length}
          onBack={() => setActiveView("results")}
          onClearLocalData={clearLocalData}
          preferences={preferences}
          selectedProfile={selectedProfile}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] pb-28 font-sans text-slate-950 antialiased md:pb-16">
      <section
        className="relative overflow-hidden bg-slate-950 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.25) 0%, rgba(15,23,42,0.70) 72%), url("${import.meta.env.BASE_URL}hamburg-harbor.png")`,
        }}
      >
        <div className="mx-auto flex min-h-[350px] w-full max-w-[1080px] flex-col justify-end px-4 py-7 md:min-h-[430px] md:px-6 md:py-10">
          <button
            aria-label="Open profile"
            className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-2xl bg-white/95 text-indigo-600 shadow-xl shadow-slate-950/20 backdrop-blur transition-colors hover:bg-indigo-50 md:right-6 md:top-6"
            onClick={() => setActiveView("profile")}
            type="button"
          >
            <User aria-hidden="true" className="h-6 w-6" strokeWidth={2.5} />
          </button>

          <div className="max-w-3xl">
            <h1 className="text-5xl font-black leading-none text-white drop-shadow md:text-7xl">District Finder</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/90 md:text-lg">
              Find Hamburg districts that match your lifestyle, budget, and priorities with transparent scoring.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-6 w-full max-w-[1080px] px-3.5 md:px-6">
        <div className="relative grid gap-4">
          <ProfileSelector onSelect={handleProfileSelect} selectedProfile={selectedProfile} />
          <PreferenceForm onChange={setPreferences} preferences={preferences} />
        </div>

        <section className="mt-8 mb-4 px-1">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-indigo-600">Live ranking</p>
              <h2 className="m-0 mt-1 text-2xl font-black text-slate-950">Your recommendations</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {matches.length} districts ranked by fit. Save favorites to compare them.
              </p>
            </div>

            {topMatch && (
              <div className="rounded-[1.25rem] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
                Top match: <span className="font-black">{topMatch.district.name}</span> ({topMatch.score}%)
              </div>
            )}
          </div>
        </section>

        <nav
          aria-label="Recommendation views"
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
                  onClick={() => setActiveView(option.view)}
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

        {activeView === "results" && (
          <ResultsList matches={matches} onToggleSave={toggleSave} savedDistrictIds={savedDistrictIds} />
        )}
        {activeView === "saved" && <SavedComparison savedMatches={savedMatches} />}
        {activeView === "map" && <MapView matches={matches} />}
      </div>
    </main>
  );
}

export default App;
