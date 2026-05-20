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
    <section className="mt-3.5 rounded-lg border border-[#d8e3e8] bg-white p-4 shadow-[0_10px_28px_rgba(27,53,74,0.08)] md:p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#245b49] text-sm font-extrabold text-white">
          2
        </span>
        <div>
          <h2 className="m-0 text-xl font-extrabold text-[#172737]">Set your priorities</h2>
          <p className="mt-1 text-[#62707d]">Use 0 for not important and 5 for very important.</p>
        </div>
      </div>

      <label className="mt-[18px] grid gap-2 font-bold text-[#2d3c49]">
        <span>Maximum rent per square meter</span>
        <div className="flex items-center gap-2 rounded-lg border border-[#d6e0e6] bg-[#f9fbfc] px-3 py-2.5">
          <span>EUR</span>
          <input
            className="w-full border-0 bg-transparent font-extrabold text-[#172737] outline-none"
            min="8"
            max="30"
            onChange={(event) => updatePreference("maxRentPerSqm", Number(event.target.value))}
            type="number"
            value={preferences.maxRentPerSqm}
          />
          <span>/ sqm</span>
        </div>
      </label>

      <div className="mt-[18px] grid gap-4">
        {sliders.map((slider) => (
          <label className="grid gap-2" key={slider.key}>
            <span className="flex justify-between gap-2.5 font-bold text-[#2d3c49]">
              {slider.label}
              <strong className="text-[#245b49]">{preferences[slider.key]}</strong>
            </span>
            <input
              className="w-full accent-[#245b49]"
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
