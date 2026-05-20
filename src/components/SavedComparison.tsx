import type { DistrictMatch } from "../types/District";

type SavedComparisonProps = {
  savedMatches: DistrictMatch[];
};

export function SavedComparison({ savedMatches }: SavedComparisonProps) {
  if (savedMatches.length === 0) {
    return (
      <section className="rounded-lg border border-[#d8e3e8] bg-white p-4 text-center shadow-[0_10px_28px_rgba(27,53,74,0.08)]">
        <h2 className="m-0 text-xl font-extrabold text-[#172737]">No saved districts yet</h2>
        <p className="mt-1 leading-6 text-[#62707d]">Save districts from the recommendations to compare them here.</p>
      </section>
    );
  }

  return (
    <section className="grid gap-3 md:grid-cols-2">
      {savedMatches.map(({ district, score }) => (
        <article
          className="rounded-lg border border-[#d8e3e8] bg-white p-4 shadow-[0_10px_28px_rgba(27,53,74,0.08)]"
          key={district.id}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="m-0 text-lg font-extrabold text-[#172737]">{district.name}</h3>
            <span className="rounded-full bg-[#f0c84b] px-2.5 py-1.5 font-black text-[#172737]">{score}% match</span>
          </div>
          <dl className="m-0 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-[#f4f7f9] p-2.5">
              <dt className="text-xs font-extrabold text-[#61707d] uppercase">Rent</dt>
              <dd className="mt-1 m-0 font-black text-[#1f2e3a]">EUR {district.rentPerSqm}/sqm</dd>
            </div>
            <div className="rounded-lg bg-[#f4f7f9] p-2.5">
              <dt className="text-xs font-extrabold text-[#61707d] uppercase">Safety</dt>
              <dd className="mt-1 m-0 font-black text-[#1f2e3a]">{district.safetyScore}/10</dd>
            </div>
            <div className="rounded-lg bg-[#f4f7f9] p-2.5">
              <dt className="text-xs font-extrabold text-[#61707d] uppercase">Green</dt>
              <dd className="mt-1 m-0 font-black text-[#1f2e3a]">{district.greenScore}/10</dd>
            </div>
            <div className="rounded-lg bg-[#f4f7f9] p-2.5">
              <dt className="text-xs font-extrabold text-[#61707d] uppercase">Transport</dt>
              <dd className="mt-1 m-0 font-black text-[#1f2e3a]">{district.publicTransportScore}/10</dd>
            </div>
            <div className="rounded-lg bg-[#f4f7f9] p-2.5">
              <dt className="text-xs font-extrabold text-[#61707d] uppercase">Schools</dt>
              <dd className="mt-1 m-0 font-black text-[#1f2e3a]">{district.schoolScore}/10</dd>
            </div>
            <div className="rounded-lg bg-[#f4f7f9] p-2.5">
              <dt className="text-xs font-extrabold text-[#61707d] uppercase">Quietness</dt>
              <dd className="mt-1 m-0 font-black text-[#1f2e3a]">{district.quietnessScore}/10</dd>
            </div>
            <div className="rounded-lg bg-[#f4f7f9] p-2.5">
              <dt className="text-xs font-extrabold text-[#61707d] uppercase">Nightlife</dt>
              <dd className="mt-1 m-0 font-black text-[#1f2e3a]">{district.nightlifeScore}/10</dd>
            </div>
            <div className="rounded-lg bg-[#f4f7f9] p-2.5">
              <dt className="text-xs font-extrabold text-[#61707d] uppercase">Density</dt>
              <dd className="mt-1 m-0 font-black text-[#1f2e3a]">{district.populationDensity}/km2</dd>
            </div>
          </dl>
        </article>
      ))}
    </section>
  );
}
