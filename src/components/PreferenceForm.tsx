import {
  Baby,
  Euro,
  GraduationCap,
  Music,
  Shield,
  SlidersHorizontal,
  Train,
  TreePine,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import type { Preferences } from "../types/District";

type PreferenceFormProps = {
  preferences: Preferences;
  onChange: (preferences: Preferences) => void;
};

type SliderKey = Exclude<keyof Preferences, "maxRentPerSqm">;

const sliders: Array<{ key: SliderKey; label: string; helper: string; icon: LucideIcon; color: string }> = [
  { key: "safety", label: "Safety", helper: "Secure everyday feeling", icon: Shield, color: "#2563eb" },
  { key: "quietness", label: "Quietness", helper: "Less noise and calmer streets", icon: Volume2, color: "#7c3aed" },
  { key: "green", label: "Green areas", helper: "Parks, open space, and nature access", icon: TreePine, color: "#16a34a" },
  { key: "publicTransport", label: "Public transport", helper: "Fast U-Bahn, S-Bahn, and bus links", icon: Train, color: "#0891b2" },
  { key: "schools", label: "Schools", helper: "School access and family infrastructure", icon: GraduationCap, color: "#d97706" },
  { key: "kindergartens", label: "Kindergartens", helper: "Early-childhood options nearby", icon: Baby, color: "#db2777" },
  { key: "nightlife", label: "Nightlife", helper: "Restaurants, bars, events, and lively streets", icon: Music, color: "#4f46e5" },
];

export function PreferenceForm({ preferences, onChange }: PreferenceFormProps) {
  const updatePreference = (key: keyof Preferences, value: number) => {
    onChange({ ...preferences, [key]: value });
  };

  return (
    <section className="mt-6 rounded-[1.6rem] border border-white/80 bg-white/90 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur md:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[#101828] text-sm font-black text-white shadow-lg shadow-slate-900/15">
          2
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal aria-hidden="true" className="h-5 w-5 text-indigo-600" />
            <h2 className="m-0 text-xl font-black text-[#101828]">Set your priorities</h2>
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Importance runs from 0 to 5. Your choices are kept in this browser for the next demo run.
          </p>
        </div>
      </div>

      <label className="mt-6 grid gap-2 font-bold text-slate-800">
        <span className="flex items-center gap-2 text-sm">
          <Euro aria-hidden="true" className="h-4 w-4 text-emerald-600" />
          Maximum rent per square meter
        </span>
        <span className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100">
          <span className="text-sm font-black text-slate-500">EUR</span>
          <input
            className="min-w-0 flex-1 border-0 bg-transparent text-lg font-black text-slate-950 outline-none"
            inputMode="decimal"
            max="30"
            min="8"
            onChange={(event) => updatePreference("maxRentPerSqm", Number(event.target.value))}
            type="number"
            value={preferences.maxRentPerSqm}
          />
          <span className="text-sm font-black text-slate-500">/ sqm</span>
        </span>
      </label>

      <div className="mt-5 divide-y divide-slate-100">
        {sliders.map((slider) => {
          const Icon = slider.icon;

          return (
            <label className="grid gap-3 py-4 first:pt-0 last:pb-0" key={slider.key}>
              <span className="flex items-start justify-between gap-3">
                <span className="flex min-w-0 items-start gap-3">
                  <span
                    className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-white shadow-sm"
                    style={{ backgroundColor: slider.color }}
                  >
                    <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={2.4} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-black leading-5 text-slate-950">{slider.label}</span>
                    <span className="mt-1 block text-sm leading-5 text-slate-500">{slider.helper}</span>
                  </span>
                </span>
                <strong
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-lg font-black"
                  style={{ backgroundColor: `${slider.color}1a`, color: slider.color }}
                >
                  {preferences[slider.key]}
                </strong>
              </span>
              <input
                className="h-2 w-full cursor-pointer"
                max="5"
                min="0"
                onChange={(event) => updatePreference(slider.key, Number(event.target.value))}
                step="1"
                style={{ accentColor: slider.color }}
                type="range"
                value={preferences[slider.key]}
              />
            </label>
          );
        })}
      </div>
    </section>
  );
}
