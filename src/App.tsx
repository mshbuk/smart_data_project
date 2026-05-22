import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import { Heart, List, Map as MapIcon, RotateCcw, Save, Sparkles, type LucideIcon } from "lucide-react";
import districts from "./data/districts.json";
import { MapView } from "./components/MapView";
import { PreferenceForm } from "./components/PreferenceForm";
import { ProfileSelector } from "./components/ProfileSelector";
import { ResultsList } from "./components/ResultsList";
import { SavedComparison } from "./components/SavedComparison";
import type { District, Preferences, UserProfile } from "./types/District";
import { calculateDistrictMatches, profileDefaults } from "./utils/scoring";

type ActiveView = "results" | "saved" | "map";

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
const storageKey = "district-finder-state-v2";
const userProfiles: UserProfile[] = ["tourist", "family", "longTerm"];
const activeViews: ActiveView[] = ["results", "saved", "map"];
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
        ? parsed.savedDistrictIds.filter((id): id is string => typeof id === "string")
        : undefined,
      selectedProfile: isUserProfile(parsed.selectedProfile) ? parsed.selectedProfile : undefined,
    };
  } catch {
    return {};
  }
}

function App() {
  const [initialState] = useState(loadPersistedState);
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

  const resetDemoState = () => {
    setSelectedProfile("longTerm");
    setPreferences(profileDefaults.longTerm);
    setSavedDistrictIds([]);
    setActiveView("results");
  };

  const viewOptions: ViewOption[] = [
    { view: "results", label: "Results", icon: List, count: matches.length },
    { view: "saved", label: "Saved", icon: Heart, count: savedDistrictIds.length },
    { view: "map", label: "Map", icon: MapIcon },
  ];

  return (
    <main className="min-h-screen bg-[#f4f7fb] pb-28 font-sans text-slate-950 antialiased md:pb-16">
      <section
        className="relative overflow-hidden bg-slate-950 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.25) 0%, rgba(15,23,42,0.70) 72%), url("${import.meta.env.BASE_URL}hamburg-harbor.png")`,
        }}
      >
        <div className="mx-auto flex min-h-[350px] w-full max-w-[1080px] flex-col justify-end px-4 py-7 md:min-h-[430px] md:px-6 md:py-10">
          <div className="max-w-3xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-white ring-1 ring-white/25 backdrop-blur">
              <Sparkles aria-hidden="true" className="h-4 w-4" />
              Hamburg Smart Data Project
            </p>
            <h1 className="text-5xl font-black leading-none text-white drop-shadow md:text-7xl">District Finder</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/90 md:text-lg">
              Find Hamburg districts that match your lifestyle, budget, and priorities with transparent scoring.
            </p>
          </div>

          <div className="mt-6 grid gap-3 rounded-[1.4rem] border border-white/20 bg-white/15 p-3 text-white backdrop-blur md:max-w-2xl md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-indigo-600">
                <Save aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-black">Current demo profile is remembered</p>
                <p className="text-xs leading-5 text-white/75">Preferences, saved districts, and the open tab persist in this browser.</p>
              </div>
            </div>
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-black text-slate-950 transition-colors hover:bg-indigo-50"
              onClick={resetDemoState}
              type="button"
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto -mt-8 w-full max-w-[1080px] px-3.5 md:px-6">
        <div className="relative">
          <ProfileSelector onSelect={handleProfileSelect} selectedProfile={selectedProfile} />
          <PreferenceForm onChange={setPreferences} preferences={preferences} />
        </div>

        <section className="mt-8 mb-4 px-1">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[#101828] text-sm font-black text-white shadow-lg shadow-slate-900/15">
                3
              </span>
              <div>
                <h2 className="m-0 text-2xl font-black text-slate-950">Your recommendations</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {matches.length} districts ranked by fit. Save favorites to compare them.
                </p>
              </div>
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
          className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-[640px] rounded-[1.4rem] border border-white/80 bg-white/95 p-2 shadow-[0_18px_50px_rgba(15,23,42,0.2)] backdrop-blur-xl md:sticky md:inset-x-auto md:top-3 md:bottom-auto md:mb-4 md:max-w-none md:rounded-2xl"
        >
          <div className="grid grid-cols-3 gap-2">
            {viewOptions.map((option) => {
              const Icon = option.icon;
              const isActive = activeView === option.view;

              return (
                <button
                  aria-pressed={isActive}
                  className={[
                    "relative flex min-h-14 items-center justify-center gap-2 rounded-2xl px-3 text-sm font-black transition-colors",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
                    isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-600 hover:bg-slate-100",
                  ].join(" ")}
                  key={option.view}
                  onClick={() => setActiveView(option.view)}
                  type="button"
                >
                  <Icon aria-hidden="true" className="h-5 w-5" />
                  <span className="text-xs sm:text-sm">{option.label}</span>
                  {typeof option.count === "number" && (
                    <span
                      className={[
                        "grid min-w-6 place-items-center rounded-full px-1.5 py-0.5 text-xs font-black",
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
