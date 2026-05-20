import type { Preferences } from "../types/District";

type PreferenceFormProps = {
  preferences: Preferences;
  onChange: (preferences: Preferences) => void;
};

type SliderKey = Exclude<keyof Preferences, "maxRentPerSqm">;

const sliders: Array<{ key: SliderKey; label: string }> = [
  { key: "safety", label: "Safety" },
  { key: "quietness", label: "Quietness" },
  { key: "green", label: "Green areas" },
  { key: "publicTransport", label: "Public transport" },
  { key: "schools", label: "Schools" },
  { key: "kindergartens", label: "Kindergartens" },
  { key: "nightlife", label: "Nightlife / lively atmosphere" },
];

export function PreferenceForm({ preferences, onChange }: PreferenceFormProps) {
  const updatePreference = (key: keyof Preferences, value: number) => {
    onChange({ ...preferences, [key]: value });
  };

  return (
    <section className="panel">
      <div className="section-heading">
        <span className="step-badge">2</span>
        <div>
          <h2>Set your priorities</h2>
          <p>Use 0 for not important and 5 for very important.</p>
        </div>
      </div>

      <label className="rent-input">
        <span>Maximum rent per square meter</span>
        <div>
          <span>EUR</span>
          <input
            min="8"
            max="30"
            onChange={(event) => updatePreference("maxRentPerSqm", Number(event.target.value))}
            type="number"
            value={preferences.maxRentPerSqm}
          />
          <span>/ sqm</span>
        </div>
      </label>

      <div className="slider-stack">
        {sliders.map((slider) => (
          <label className="preference-slider" key={slider.key}>
            <span>
              {slider.label}
              <strong>{preferences[slider.key]}</strong>
            </span>
            <input
              max="5"
              min="0"
              onChange={(event) => updatePreference(slider.key, Number(event.target.value))}
              step="1"
              type="range"
              value={preferences[slider.key]}
            />
          </label>
        ))}
      </div>
    </section>
  );
}
