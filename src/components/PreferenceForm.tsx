import type { CSSProperties } from "react";
import {
  Baby,
  ChevronDown,
  ChevronUp,
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
import { useEffect, useState } from "react";
import type { Preferences } from "../types/District";
import { getImportanceLabel } from "../utils/districtInsights";
import { useI18n } from "../i18n";

type PreferenceFormProps = {
  preferences: Preferences;
  onChange: (preferences: Preferences) => void;
  defaultExpanded?: boolean;
  expandSignal?: number;
};

type SliderKey = Exclude<keyof Preferences, "maxRentPerSqm">;

const sliders: Array<{ key: SliderKey; label: string; helper: string; icon: LucideIcon; color: string }> = [
  { key: "safety", label: "Safety", helper: "Everyday security", icon: Shield, color: "#2563eb" },
  { key: "quietness", label: "Quietness", helper: "Calmer streets", icon: Volume2, color: "#7c3aed" },
  { key: "green", label: "Green areas", helper: "Parks and open space", icon: TreePine, color: "#16a34a" },
  { key: "publicTransport", label: "Public transport", helper: "U-Bahn, S-Bahn, bus", icon: Train, color: "#0891b2" },
  { key: "schools", label: "Schools", helper: "School access", icon: GraduationCap, color: "#d97706" },
  { key: "kindergartens", label: "Kindergartens", helper: "Early-childhood options", icon: Baby, color: "#db2777" },
  { key: "nightlife", label: "Nightlife", helper: "Food, bars, events", icon: Music, color: "#4f46e5" },
];

const labelTranslations: Record<string, string> = {
  Safety: "Sicherheit",
  Quietness: "Ruhe",
  "Green areas": "Grünflächen",
  "Public transport": "ÖPNV",
  Schools: "Schulen",
  Kindergartens: "Kitas",
  Nightlife: "Nachtleben",
  "Everyday security": "Sicherheit im Alltag",
  "Calmer streets": "Ruhigere Straßen",
  "Parks and open space": "Parks und Freiraum",
  "U-Bahn, S-Bahn, bus": "U-Bahn, S-Bahn, Bus",
  "School access": "Schulzugang",
  "Early-childhood options": "Kita-Angebote",
  "Food, bars, events": "Essen, Bars, Events",
};

function getPrioritySummary(preferences: Preferences) {
  return sliders
    .filter((slider) => preferences[slider.key] > 0)
    .sort((a, b) => preferences[b.key] - preferences[a.key])
    .slice(0, 4);
}

export function PreferenceForm({ preferences, onChange, defaultExpanded = false, expandSignal = 0 }: PreferenceFormProps) {
  const { language, tx } = useI18n();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const prioritySummary = getPrioritySummary(preferences);

  useEffect(() => {
    if (defaultExpanded) setIsExpanded(true);
  }, [defaultExpanded]);

  useEffect(() => {
    if (expandSignal > 0) setIsExpanded(true);
  }, [expandSignal]);

  const updatePreference = (key: keyof Preferences, value: number) => {
    onChange({ ...preferences, [key]: value });
  };

  return (
    <section className="mt-4 rounded-[1.6rem] border border-white/80 bg-white/90 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur md:p-5">
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal aria-hidden="true" className="h-5 w-5 text-indigo-600" />
            <h2 className="m-0 text-xl font-black text-[#101828]">{tx("Fine-tune priorities", "Prioritäten feinjustieren")}</h2>
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {tx(
              "Keep the preset, or open the controls to customize the weights.",
              "Behalte die Vorgaben oder öffne die Regler, um die Gewichtung anzupassen.",
            )}
          </p>
        </div>

        <button
          aria-expanded={isExpanded}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 text-sm font-black text-white transition-colors hover:bg-indigo-700"
          onClick={() => setIsExpanded((current) => !current)}
          type="button"
        >
          {isExpanded ? (
            <>
              <ChevronUp aria-hidden="true" className="h-4 w-4" />
              {tx("Hide controls", "Regler ausblenden")}
            </>
          ) : (
            <>
              <ChevronDown aria-hidden="true" className="h-4 w-4" />
              {tx("Edit weights", "Gewichtung bearbeiten")}
            </>
          )}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
          <Euro aria-hidden="true" className="h-3.5 w-3.5" />
          {tx("Max", "Max.")} EUR {preferences.maxRentPerSqm}/{tx("sqm", "qm")}
        </span>
        {prioritySummary.map((slider) => {
          const Icon = slider.icon;

          return (
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black"
              key={slider.key}
              style={{ backgroundColor: `${slider.color}14`, color: slider.color }}
            >
              <Icon aria-hidden="true" className="h-3.5 w-3.5" />
              {tx(slider.label, labelTranslations[slider.label] ?? slider.label)} {preferences[slider.key]}/5 ·{" "}
              {getImportanceLabel(preferences[slider.key], language)}
            </span>
          );
        })}
      </div>

      {isExpanded && (
        <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5">
          <label className="grid gap-2 rounded-2xl bg-slate-50 p-3 font-bold text-slate-800 md:grid-cols-[minmax(220px,1fr)_minmax(160px,240px)] md:items-center">
            <span className="flex items-center gap-2 text-sm">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-emerald-600">
                <Euro aria-hidden="true" className="h-4 w-4" />
              </span>
              <span>
                <span className="block font-black text-slate-950">{tx("Maximum rent", "Maximale Miete")}</span>
                <span className="block text-xs font-bold text-slate-500">{tx("Euros per square meter", "Euro pro Quadratmeter")}</span>
              </span>
            </span>
            <span className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100">
              <span className="text-xs font-black text-slate-500">EUR</span>
              <input
                className="min-w-0 flex-1 border-0 bg-transparent text-base font-black text-slate-950 outline-none"
                inputMode="decimal"
                max="30"
                min="8"
                onChange={(event) => updatePreference("maxRentPerSqm", Number(event.target.value))}
                type="number"
                value={preferences.maxRentPerSqm}
              />
              <span className="text-xs font-black text-slate-500">/{tx("sqm", "qm")}</span>
            </span>
          </label>

          <div className="grid gap-2 md:grid-cols-2">
            {sliders.map((slider) => {
              const Icon = slider.icon;
              const progress = `${preferences[slider.key] * 20}%`;

              return (
                <label className="grid gap-3 rounded-2xl bg-slate-50 p-3" key={slider.key}>
                  <span className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white shadow-sm"
                        style={{ backgroundColor: slider.color }}
                      >
                        <Icon aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2.4} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-black leading-5 text-slate-950">
                          {tx(slider.label, labelTranslations[slider.label] ?? slider.label)}
                        </span>
                        <span className="block truncate text-xs font-bold leading-5 text-slate-500">
                          {tx(slider.helper, labelTranslations[slider.helper] ?? slider.helper)}
                        </span>
                      </span>
                    </span>
                    <strong
                      className="grid min-h-11 min-w-[5rem] shrink-0 place-items-center rounded-xl px-2 text-center text-base font-black leading-tight"
                      style={{ backgroundColor: `${slider.color}1a`, color: slider.color }}
                    >
                      <span>
                        <span className="block">{preferences[slider.key]}/5</span>
                        <span className="block text-[0.62rem] uppercase tracking-wide">
                          {getImportanceLabel(preferences[slider.key], language)}
                        </span>
                      </span>
                    </strong>
                  </span>
                  <input
                    className="preference-range"
                    max="5"
                    min="0"
                    onChange={(event) => updatePreference(slider.key, Number(event.target.value))}
                    step="1"
                    style={{ "--range-color": slider.color, "--range-progress": progress } as CSSProperties}
                    type="range"
                    value={preferences[slider.key]}
                  />
                </label>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
