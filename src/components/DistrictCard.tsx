import type { DistrictMatch } from "../types/District";

type DistrictCardProps = {
  match: DistrictMatch;
  isSaved: boolean;
  onToggleSave: (districtId: string) => void;
};

export function DistrictCard({ match, isSaved, onToggleSave }: DistrictCardProps) {
  const { district } = match;

  return (
    <article className="rounded-lg border border-[#d8e3e8] bg-white p-4 shadow-[0_10px_28px_rgba(27,53,74,0.08)]">
      <div className="flex justify-between gap-3">
        <div>
          <h3 className="m-0 text-lg font-extrabold text-[#172737]">{district.name}</h3>
          <p className="mt-1 leading-6 text-[#65727e]">{district.shortDescription}</p>
        </div>
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#f0c84b] font-black text-[#162232]">
          {match.score}%
        </div>
      </div>

      <p className="my-3.5 leading-6 text-[#2f414f]">{match.explanation}</p>

      <div className="grid grid-cols-2 gap-2">
        <span className="rounded-full bg-[#eef4f6] px-2.5 py-2 text-xs font-bold text-[#344855]">Rent EUR {district.rentPerSqm}/sqm</span>
        <span className="rounded-full bg-[#eef4f6] px-2.5 py-2 text-xs font-bold text-[#344855]">Safety {district.safetyScore}/10</span>
        <span className="rounded-full bg-[#eef4f6] px-2.5 py-2 text-xs font-bold text-[#344855]">Green {district.greenScore}/10</span>
        <span className="rounded-full bg-[#eef4f6] px-2.5 py-2 text-xs font-bold text-[#344855]">Transport {district.publicTransportScore}/10</span>
        <span className="rounded-full bg-[#eef4f6] px-2.5 py-2 text-xs font-bold text-[#344855]">Schools {district.schoolScore}/10</span>
        <span className="rounded-full bg-[#eef4f6] px-2.5 py-2 text-xs font-bold text-[#344855]">Quiet {district.quietnessScore}/10</span>
      </div>

      <div className="mt-3.5 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex flex-wrap gap-2">
          {match.highlights.map((highlight) => (
            <span className="rounded-full bg-[#eef4f6] px-2.5 py-1.5 text-xs font-bold text-[#344855]" key={highlight}>
              {highlight}
            </span>
          ))}
        </div>
        <button
          className={[
            "min-h-11 rounded-lg border border-[#245b49] px-4 font-black transition-colors md:min-w-[104px]",
            isSaved ? "bg-[#245b49] text-white" : "bg-white text-[#245b49] hover:bg-[#e8f3ee]",
          ].join(" ")}
          onClick={() => onToggleSave(district.id)}
          type="button"
        >
          {isSaved ? "Saved" : "Save"}
        </button>
      </div>
    </article>
  );
}
