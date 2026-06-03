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

const radarAxes = [
  { label: { en: "Safe", de: "Sicher" }, getValue: (match: DistrictMatch) => match.district.safetyScore },
  { label: { en: "Transit", de: "ÖPNV" }, getValue: (match: DistrictMatch) => match.district.publicTransportScore },
  { label: { en: "Green", de: "Grün" }, getValue: (match: DistrictMatch) => match.district.greenScore },
  {
    label: { en: "Family", de: "Familie" },
    getValue: (match: DistrictMatch) => (match.district.schoolScore + match.district.kindergartenScore) / 2,
  },
  { label: { en: "Nightlife", de: "Nachtleben" }, getValue: (match: DistrictMatch) => match.district.nightlifeScore },
  { label: { en: "Quiet", de: "Ruhe" }, getValue: (match: DistrictMatch) => match.district.quietnessScore },
];

const radarColors = ["#e11d48", "#0ea5e9", "#0f172a"];

function radarPoint(axisIndex: number, value: number, radius: number, center: number) {
  const angle = -Math.PI / 2 + (axisIndex / radarAxes.length) * Math.PI * 2;
  const scaledRadius = (Math.max(0, Math.min(value, 10)) / 10) * radius;

  return {
    x: center + Math.cos(angle) * scaledRadius,
    y: center + Math.sin(angle) * scaledRadius,
  };
}

function radarPolygon(match: DistrictMatch, radius: number, center: number) {
  return radarAxes
    .map((axis, axisIndex) => {
      const point = radarPoint(axisIndex, axis.getValue(match), radius, center);
      return `${point.x},${point.y}`;
    })
    .join(" ");
}

export function SavedComparison({ preferences, savedMatches, onEditCriteria, onFindDistricts }: SavedComparisonProps) {
  const { language, tx } = useI18n();
  const labels = getCriterionLabels(language);
  const radarMatches = savedMatches.slice(0, 3);

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
            "Speichere Stadtteile aus den Empfehlungen, um Miete, Verkehr, Grünflächen und Passung zu vergleichen.",
          )}
        </p>
        <button
          className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 text-sm font-black text-white shadow-lg shadow-indigo-600/20 transition-colors hover:bg-indigo-700"
          onClick={onFindDistricts}
          type="button"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          {tx("Add districts to compare", "Stadtteile zum Vergleich hinzufügen")}
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
            {tx("Add", "Hinzufügen")}
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
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">{tx("Profile comparison", "Profil-Vergleich")}</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">{tx("Direct visual comparison", "Direkter Vergleich")}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {tx(
              "The diagram compares up to three saved districts across the main district qualities.",
              "Das Diagramm vergleicht bis zu drei gespeicherte Stadtteile über die wichtigsten Stadtteilqualitäten.",
            )}
          </p>
        </div>
        <div className="mt-4 overflow-hidden rounded-[1.35rem] bg-white p-3">
          <svg aria-hidden="true" className="mx-auto h-auto w-full max-w-[520px]" viewBox="0 0 420 380">
            {[0.25, 0.5, 0.75, 1].map((scale) => (
              <polygon
                fill="none"
                key={scale}
                points={radarAxes
                  .map((_, axisIndex) => {
                    const point = radarPoint(axisIndex, scale * 10, 120, 210);
                    return `${point.x},${point.y}`;
                  })
                  .join(" ")}
                stroke="#dbe4ee"
                strokeWidth="1.5"
              />
            ))}
            {radarAxes.map((axis, axisIndex) => {
              const axisPoint = radarPoint(axisIndex, 10, 120, 210);
              const labelPoint = radarPoint(axisIndex, 11.5, 120, 210);

              return (
                <g key={axis.label.en}>
                  <line stroke="#dbe4ee" strokeWidth="1.5" x1="210" x2={axisPoint.x} y1="210" y2={axisPoint.y} />
                  <text
                    fill="#64748b"
                    fontSize="15"
                    fontWeight="800"
                    textAnchor={labelPoint.x < 190 ? "end" : labelPoint.x > 220 ? "start" : "middle"}
                    x={labelPoint.x}
                    y={labelPoint.y + 5}
                  >
                    {language === "de" ? axis.label.de : axis.label.en}
                  </text>
                </g>
              );
            })}
            {radarMatches.map((match, index) => {
              const color = radarColors[index % radarColors.length];

              return (
                <g key={match.district.id}>
                  <polygon fill={color} fillOpacity="0.14" points={radarPolygon(match, 120, 210)} stroke={color} strokeWidth="4" />
                  {radarAxes.map((axis, axisIndex) => {
                    const point = radarPoint(axisIndex, axis.getValue(match), 120, 210);
                    return <circle cx={point.x} cy={point.y} fill={color} key={axis.label.en} r="5" />;
                  })}
                </g>
              );
            })}
            <g transform="translate(60 350)">
              {radarMatches.map((match, index) => {
                const color = radarColors[index % radarColors.length];

                return (
                  <g key={match.district.id} transform={`translate(${index * 132} 0)`}>
                    <circle cx="0" cy="0" fill={color} r="6" />
                    <text fill="#475569" fontSize="14" fontWeight="800" x="14" y="5">
                      {match.district.name}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
        {savedMatches.length > 3 && (
          <p className="mt-2 text-xs font-bold text-slate-500">
            {tx("The diagram shows the first three saved districts.", "Das Diagramm zeigt die ersten drei gespeicherten Stadtteile.")}
          </p>
        )}
      </div>

      <div className="rounded-[1.6rem] border border-white/80 bg-white/90 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-black text-slate-950">{tx("Your priority shape", "Dein Prioritätenprofil")}</h3>
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
                        Green: "Grün",
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
