import "leaflet/dist/leaflet.css";
import { useState } from "react";
import districts from "./data/districts.json";
import { MapView } from "./components/MapView";
import { PreferenceForm } from "./components/PreferenceForm";
import { ProfileSelector } from "./components/ProfileSelector";
import { ResultsList } from "./components/ResultsList";
import { SavedComparison } from "./components/SavedComparison";
import type { District, UserProfile } from "./types/District";
import { calculateDistrictMatches, profileDefaults } from "./utils/scoring";

type ActiveView = "results" | "saved" | "map";

const districtData = districts as District[];

function App() {
  const [selectedProfile, setSelectedProfile] = useState<UserProfile>("longTerm");
  const [preferences, setPreferences] = useState(profileDefaults.longTerm);
  const [savedDistrictIds, setSavedDistrictIds] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>("results");

  const matches = calculateDistrictMatches(districtData, preferences, selectedProfile);
  const savedMatches = matches.filter((match) => savedDistrictIds.includes(match.district.id));

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

  const tabButtonClass = (view: ActiveView) =>
    [
      "min-h-11 rounded-md border-0 px-3 font-extrabold transition-colors",
      activeView === view ? "bg-[#245b49] text-white" : "bg-transparent text-[#4d5b68] hover:bg-[#eef4f6]",
    ].join(" ");

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1080px] bg-[#edf3f7] px-3.5 pt-5 pb-11 font-sans text-[#1c2430] antialiased md:px-6 md:pt-8 md:pb-16">
      <section className="px-1 pt-6 pb-4">
        <p className="mb-2 text-xs font-extrabold tracking-normal text-[#396653] uppercase">Hamburg Smart Data Project</p>
        <h1 className="m-0 text-[2.6rem] leading-none font-extrabold text-[#102232] md:text-6xl">District Finder</h1>
        <p className="mt-3.5 max-w-2xl text-base leading-7 text-[#4f5c67]">
          Find Hamburg districts that fit your lifestyle, budget, and priorities using transparent district-level
          scoring.
        </p>
      </section>

      <ProfileSelector onSelect={handleProfileSelect} selectedProfile={selectedProfile} />
      <PreferenceForm onChange={setPreferences} preferences={preferences} />

      <section className="mt-5 mb-3 px-1">
        <div className="flex items-start gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#245b49] text-sm font-extrabold text-white">
            3
          </span>
          <div>
            <h2 className="m-0 text-xl font-extrabold text-[#172737]">Your recommendations</h2>
            <p className="mt-1 text-[#62707d]">{matches.length} districts ranked by fit. Save favorites to compare them.</p>
          </div>
        </div>
      </section>

      <nav
        aria-label="Recommendation views"
        className="sticky top-0 z-20 mb-3 grid grid-cols-3 gap-1.5 rounded-lg border border-[#d8e3e8] bg-white/95 p-2 backdrop-blur-xl"
      >
        <button className={tabButtonClass("results")} onClick={() => setActiveView("results")} type="button">
          Results
        </button>
        <button className={tabButtonClass("saved")} onClick={() => setActiveView("saved")} type="button">
          Saved ({savedDistrictIds.length})
        </button>
        <button className={tabButtonClass("map")} onClick={() => setActiveView("map")} type="button">
          Map
        </button>
      </nav>

      {activeView === "results" && (
        <ResultsList matches={matches} onToggleSave={toggleSave} savedDistrictIds={savedDistrictIds} />
      )}
      {activeView === "saved" && <SavedComparison savedMatches={savedMatches} />}
      {activeView === "map" && <MapView matches={matches} />}
    </main>
  );
}

export default App;
