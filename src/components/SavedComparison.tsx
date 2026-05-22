import { Euro, GraduationCap, Heart, Music, Scale, Shield, Train, TreePine, Volume2 } from "lucide-react";
import type { DistrictMatch } from "../types/District";

type SavedComparisonProps = {
  savedMatches: DistrictMatch[];
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
    getValue: (match: DistrictMatch) => `${match.district.safetyScore}/10`,
    getRankValue: (match: DistrictMatch) => match.district.safetyScore,
  },
  {
    label: "Transport",
    getValue: (match: DistrictMatch) => `${match.district.publicTransportScore}/10`,
    getRankValue: (match: DistrictMatch) => match.district.publicTransportScore,
  },
  {
    label: "Green",
    getValue: (match: DistrictMatch) => `${match.district.greenScore}/10`,
    getRankValue: (match: DistrictMatch) => match.district.greenScore,
  },
  {
    label: "Schools",
    getValue: (match: DistrictMatch) => `${match.district.schoolScore}/10`,
    getRankValue: (match: DistrictMatch) => match.district.schoolScore,
  },
  {
    label: "Quietness",
    getValue: (match: DistrictMatch) => `${match.district.quietnessScore}/10`,
    getRankValue: (match: DistrictMatch) => match.district.quietnessScore,
  },
  {
    label: "Nightlife",
    getValue: (match: DistrictMatch) => `${match.district.nightlifeScore}/10`,
    getRankValue: (match: DistrictMatch) => match.district.nightlifeScore,
  },
];

export function SavedComparison({ savedMatches }: SavedComparisonProps) {
  if (savedMatches.length === 0) {
    return (
      <section className="rounded-[1.6rem] border border-white/80 bg-white/90 p-8 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-[1.25rem] bg-rose-50 text-rose-500">
          <Heart aria-hidden="true" className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-xl font-black text-slate-950">No saved districts yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
          Save districts from the recommendations to compare rent, transport, green areas, and fit side by side.
        </p>
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      <div className="rounded-[1.6rem] border border-white/80 bg-white/90 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] md:p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <Scale aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-black text-slate-950">Saved comparison</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Compare up to all saved districts. Best values are highlighted in each row.
            </p>
          </div>
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

      <div className="overflow-hidden rounded-[1.6rem] border border-white/80 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="w-40 px-4 py-4 text-xs font-black uppercase tracking-wide text-slate-500">Metric</th>
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
                        <span className="block text-xs font-bold text-slate-500">Saved</span>
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
                    <td className="px-4 py-4 text-sm font-black text-slate-700">{row.label}</td>
                    {savedMatches.map((match) => {
                      const isBest = savedMatches.length > 1 && row.getRankValue(match) === bestValue;

                      return (
                        <td className="px-4 py-4" key={`${row.label}-${match.district.id}`}>
                          <span
                            className={[
                              "inline-flex rounded-full px-3 py-1.5 text-sm font-black",
                              isBest ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700",
                            ].join(" ")}
                          >
                            {row.getValue(match)}
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
                <span className="font-bold text-slate-700">EUR {district.rentPerSqm}</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                <Shield aria-hidden="true" className="h-4 w-4 text-blue-600" />
                <span className="font-bold text-slate-700">{district.safetyScore}/10</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                <Train aria-hidden="true" className="h-4 w-4 text-cyan-600" />
                <span className="font-bold text-slate-700">{district.publicTransportScore}/10</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                <TreePine aria-hidden="true" className="h-4 w-4 text-green-600" />
                <span className="font-bold text-slate-700">{district.greenScore}/10</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                <GraduationCap aria-hidden="true" className="h-4 w-4 text-amber-600" />
                <span className="font-bold text-slate-700">{district.schoolScore}/10</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                <Volume2 aria-hidden="true" className="h-4 w-4 text-violet-600" />
                <span className="font-bold text-slate-700">{district.quietnessScore}/10</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                <Music aria-hidden="true" className="h-4 w-4 text-indigo-600" />
                <span className="font-bold text-slate-700">{district.nightlifeScore}/10</span>
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
