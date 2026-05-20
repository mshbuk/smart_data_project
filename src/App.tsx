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

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Hamburg Smart Data Project</p>
        <h1>District Finder</h1>
        <p>
          Find Hamburg districts that fit your lifestyle, budget, and priorities using transparent district-level
          scoring.
        </p>
      </section>

      <ProfileSelector onSelect={handleProfileSelect} selectedProfile={selectedProfile} />
      <PreferenceForm onChange={setPreferences} preferences={preferences} />

      <section className="recommendation-header">
        <div>
          <span className="step-badge">3</span>
          <h2>Your recommendations</h2>
          <p>{matches.length} districts ranked by fit. Save favorites to compare them.</p>
        </div>
      </section>

      <nav aria-label="Recommendation views" className="view-tabs">
        <button className={activeView === "results" ? "active" : ""} onClick={() => setActiveView("results")} type="button">
          Results
        </button>
        <button className={activeView === "saved" ? "active" : ""} onClick={() => setActiveView("saved")} type="button">
          Saved ({savedDistrictIds.length})
        </button>
        <button className={activeView === "map" ? "active" : ""} onClick={() => setActiveView("map")} type="button">
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
