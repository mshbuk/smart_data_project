import {
  Euro,
  GraduationCap,
  Music,
  Plus,
  Scale,
  Shield,
  SlidersHorizontal,
  Train,
  TreePine,
  Volume2,
} from "lucide-react";
import type { DistrictMatch, Preferences } from "../types/District";
import { formatScore, getCriterionLabels, getImportanceLabel, preferenceKeys } from "../utils/districtInsights";
import { useI18n } from "../i18n";

type SavedComparisonProps = {
  preferences: Preferences;
  savedMatches: DistrictMatch[];
  onEditCriteria: () => void;
  onFindDistricts: () => void;
};

const rows = [
  { label: "Match", getValue: (match: DistrictMatch) => `${match.score}%`, getRankValue: (match: DistrictMatch) => match.score },
  {
    label: "Rent",
    getValue: (match: DistrictMatch) => `EUR ${match.district.rentPerSqm}/sqm`,
    getRankValue: (match: DistrictMatch) => -match.district.rentPerSqm,
  },
  {
    label: "Safety",
    getValue: (match: DistrictMatch) => `${formatScore(match.district.safetyScore)}/10`,
    getRankValue: (match: DistrictMatch) => match.district.safetyScore,
  },
  {
    label: "Transport",
    getValue: (match: DistrictMatch) => `${formatScore(match.district.publicTransportScore)}/10`,
    getRankValue: (match: DistrictMatch) => match.district.publicTransportScore,
  },
  {
    label: "Green",
    getValue: (match: DistrictMatch) => `${formatScore(match.district.greenScore)}/10`,
    getRankValue: (match: DistrictMatch) => match.district.greenScore,
  },
  {
    label: "Schools",
    getValue: (match: DistrictMatch) => `${formatScore(match.district.schoolScore)}/10`,
    getRankValue: (match: DistrictMatch) => match.district.schoolScore,
  },
  {
    label: "Quietness",
    getValue: (match: DistrictMatch) => `${formatScore(match.district.quietnessScore)}/10`,
    getRankValue: (match: DistrictMatch) => match.district.quietnessScore,
  },
  {
    label: "Nightlife",
    getValue: (match: DistrictMatch) => `${formatScore(match.district.nightlifeScore)}/10`,
    getRankValue: (match: DistrictMatch) => match.district.nightlifeScore,
  },
];

export function SavedComparison({ preferences, savedMatches, onEditCriteria, onFindDistricts }: SavedComparisonProps) {
  const { language, tx } = useI18n();
  const labels = getCriterionLabels(language);

  if (savedMatches.length === 0) {
    return (
      <section className="rounded-[1.6rem] border border-white/80 bg-white/90 p-8 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-[1.25rem] bg-indigo-600 text-white shadow-xl shadow-indigo-600/25">
          <Plus aria-hidden="true" className="h-8 w-8" strokeWidth={3} />
        </div>
        <h2 className="mt-4 text-xl font-black text-slate-950">{tx("No saved districts yet", "Noch keine Stadtteile gespeichert")}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
          {tx(
            "Save districts from the recommendations to compare rent, transport, green areas, and fit side by side.",
            "Speichere Stadtteile aus den Empfehlungen, um Miete, Verkehr, Gruenflaechen und Passung zu vergleichen.",
          )}
        </p>
        <button
          className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 text-sm font-black text-white shadow-lg shadow-indigo-600/20 transition-colors hover:bg-indigo-700"
          onClick={onFindDistricts}
          type="button"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          {tx("Add districts to compare", "Stadtteile zum Vergleich hinzufuegen")}
        </button>
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      <div className="rounded-[1.6rem] border border-white/80 bg-white/90 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <Scale aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-black text-slate-950">{tx("Saved comparison", "Gespeicherter Vergleich")}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {tx(
                "Compare up to all saved districts. Best values are highlighted in each row.",
                "Vergleiche alle gespeicherten Stadtteile. Die besten Werte werden pro Zeile hervorgehoben.",
              )}
            </p>
          </div>
          </div>
          <button
            className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-indigo-600 px-4 text-sm font-black text-white shadow-lg shadow-indigo-600/20 transition-colors hover:bg-indigo-700"
            onClick={onFindDistricts}
            type="button"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            {tx("Add", "Hinzufuegen")}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {savedMatches.map(({ district, score }) => (
            <span
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-800"
              key={district.id}
            >
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              {district.name}
              <span className="text-indigo-600">{score}%</span>
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-[1.6rem] border border-white/80 bg-white/90 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-black text-slate-950">{tx("Your priority shape", "Dein Prioritaetenprofil")}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {tx(
                "The comparison is weighted by these criteria, so saved districts are judged against your current goal.",
                "Der Vergleich nutzt diese Gewichtungen, damit gespeicherte Stadtteile zu deinem aktuellen Ziel bewertet werden.",
              )}
            </p>
          </div>
          <button
            className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-slate-100 px-4 text-sm font-black text-slate-700 transition-colors hover:bg-slate-200"
            onClick={onEditCriteria}
            type="button"
          >
            <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
            {tx("Edit weights", "Gewichtung bearbeiten")}
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {preferenceKeys.map((key) => {
            const value = preferences[key];

            return (
              <div className="grid gap-2 rounded-2xl bg-slate-50 p-3" key={key}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-black text-slate-900">{labels[key]}</span>
                  <span className="text-xs font-black text-indigo-600">
                    {value}/5 · {getImportanceLabel(value, language)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-indigo-600" style={{ width: `${value * 20}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.6rem] border border-white/80 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="w-40 px-4 py-4 text-xs font-black uppercase tracking-wide text-slate-500">{tx("Metric", "Kriterium")}</th>
                {savedMatches.map(({ district }) => (
                  <th className="px-4 py-4" key={district.id}>
                    <div className="flex items-center gap-3">
                      {district.imageUrl && (
                        <img
                          alt=""
                          className="h-11 w-11 rounded-2xl object-cover"
                          loading="lazy"
                          src={district.imageUrl}
                        />
                      )}
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-black text-slate-950">{district.name}</span>
                        <span className="block text-xs font-bold text-slate-500">{tx("Saved", "Gespeichert")}</span>
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => {
                const bestValue = Math.max(...savedMatches.map(row.getRankValue));

                return (
                  <tr className="bg-white" key={row.label}>
                    <td className="px-4 py-4 text-sm font-black text-slate-700">
                      {tx(row.label, {
                        Match: "Passung",
                        Rent: "Miete",
                        Safety: "Sicherheit",
                        Transport: "Verkehr",
                        Green: "Gruen",
                        Schools: "Schulen",
                        Quietness: "Ruhe",
                        Nightlife: "Nachtleben",
                      }[row.label] ?? row.label)}
                    </td>
                    {savedMatches.map((match) => {
                      const isBest = savedMatches.length > 1 && row.getRankValue(match) === bestValue;
                      const value =
                        row.label === "Rent"
                          ? `EUR ${new Intl.NumberFormat(language === "de" ? "de-DE" : "en-US").format(match.district.rentPerSqm)}/${tx("sqm", "qm")}`
                          : row.getValue(match);

                      return (
                        <td className="px-4 py-4" key={`${row.label}-${match.district.id}`}>
                          <span
                            className={[
                              "inline-flex rounded-full px-3 py-1.5 text-sm font-black",
                              isBest ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700",
                            ].join(" ")}
                          >
                            {value}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {savedMatches.map(({ district, strengths, tradeoffs }) => (
          <article className="rounded-[1.35rem] border border-white/80 bg-white/90 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.07)]" key={district.id}>
            <h3 className="text-lg font-black text-slate-950">{district.name}</h3>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                <Euro aria-hidden="true" className="h-4 w-4 text-emerald-600" />
                <span className="font-bold text-slate-700">
                  EUR {new Intl.NumberFormat(language === "de" ? "de-DE" : "en-US").format(district.rentPerSqm)}/{tx("sqm", "qm")}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                <Shield aria-hidden="true" className="h-4 w-4 text-blue-600" />
                <span className="font-bold text-slate-700">{formatScore(district.safetyScore)}/10</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                <Train aria-hidden="true" className="h-4 w-4 text-cyan-600" />
                <span className="font-bold text-slate-700">{formatScore(district.publicTransportScore)}/10</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                <TreePine aria-hidden="true" className="h-4 w-4 text-green-600" />
                <span className="font-bold text-slate-700">{formatScore(district.greenScore)}/10</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                <GraduationCap aria-hidden="true" className="h-4 w-4 text-amber-600" />
                <span className="font-bold text-slate-700">{formatScore(district.schoolScore)}/10</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                <Volume2 aria-hidden="true" className="h-4 w-4 text-violet-600" />
                <span className="font-bold text-slate-700">{formatScore(district.quietnessScore)}/10</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                <Music aria-hidden="true" className="h-4 w-4 text-indigo-600" />
                <span className="font-bold text-slate-700">{formatScore(district.nightlifeScore)}/10</span>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {strengths.slice(0, 2).map((strength) => (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700" key={`${district.id}-${strength}`}>
                  {strength}
                </span>
              ))}
              {tradeoffs.slice(0, 1).map((tradeoff) => (
                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700" key={`${district.id}-${tradeoff}`}>
                  {tradeoff}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

    </section>
  );
}
