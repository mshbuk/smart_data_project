import { Heart, Info } from "lucide-react";
import type { DistrictMatch } from "../types/District";
import { useI18n } from "../i18n";

type DistrictCardProps = {
  match: DistrictMatch;
  isSaved: boolean;
  onToggleSave: (districtId: string) => void;
  onOpenDetails?: (districtId: string) => void;
  rank: number;
};

function getScoreTone(score: number, tx: (english: string, german: string) => string) {
  if (score >= 85) {
    return {
      label: tx("Strong match", "Starke Passung"),
      badge: "bg-emerald-500 text-white shadow-emerald-500/25",
      accent: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (score >= 75) {
    return {
      label: tx("Good match", "Gute Passung"),
      badge: "bg-sky-500 text-white shadow-sky-500/25",
      accent: "border-sky-200 bg-sky-50 text-sky-700",
    };
  }

  return {
    label: tx("Potential fit", "Mögliche Passung"),
    badge: "bg-orange-500 text-white shadow-orange-500/25",
    accent: "border-orange-200 bg-orange-50 text-orange-700",
  };
}

export function DistrictCard({ match, isSaved, onToggleSave, onOpenDetails, rank }: DistrictCardProps) {
  const { language, tx } = useI18n();
  const { district } = match;
  const tone = getScoreTone(match.score, tx);
  const rentFormatter = new Intl.NumberFormat(language === "de" ? "de-DE" : "en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
  const shortReason = match.strengths[0] ?? district.shortDescription;

  return (
    <article className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white moin-card-shadow transition-transform duration-200 hover:-translate-y-0.5">
      <div className="grid">
        <button
          aria-label={tx(`Open ${district.name} details`, `${district.name} Details öffnen`)}
          className="group relative min-h-[300px] overflow-hidden bg-slate-200 text-left"
          onClick={() => onOpenDetails?.(district.id)}
          type="button"
        >
          {district.imageUrl ? (
            <img
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              src={district.imageUrl}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-sky-100 to-indigo-200" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/15 to-transparent" />
          <div className="absolute left-4 top-4 rounded-2xl bg-white/90 px-3 py-2 text-sm font-black text-slate-950 shadow-lg backdrop-blur">
            #{rank}
          </div>
          <div className="absolute right-4 top-4 grid h-16 w-16 place-items-center rounded-full bg-slate-500/75 text-center text-white shadow-lg backdrop-blur">
            <span className="block text-2xl leading-none">{match.score}%</span>
            <span className="mt-1 block text-[0.68rem] uppercase tracking-wide">Match</span>
          </div>
          <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-2xl bg-white/90 px-3 py-2 text-xs font-black text-slate-800 opacity-100 shadow-lg backdrop-blur transition-colors group-hover:bg-indigo-600 group-hover:text-white">
            <Info aria-hidden="true" className="h-4 w-4" />
            {tx("Details", "Details")}
          </span>
        </button>

        <div className="p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="mt-1 text-2xl font-black leading-tight text-slate-950">{district.name}</h3>
              <p className="mt-3 text-base leading-6 text-slate-500">{shortReason}</p>
            </div>
            <button
              aria-label={
                isSaved
                  ? tx(`Remove ${district.name} from saved districts`, `${district.name} aus Gespeichert entfernen`)
                  : tx(`Save ${district.name}`, `${district.name} speichern`)
              }
              className={[
                "grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-all",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600",
                isSaved
                  ? "border-rose-200 bg-rose-50 text-rose-500"
                  : "border-slate-200 bg-slate-50 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500",
              ].join(" ")}
              onClick={() => onToggleSave(district.id)}
              type="button"
            >
              <Heart aria-hidden="true" className={isSaved ? "h-5 w-5 fill-current" : "h-5 w-5"} />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {match.highlights.slice(0, 3).map((highlight) => (
                <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${tone.accent}`} key={highlight}>
                  {highlight}
                </span>
              ))}
              <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-700">
                Ø {rentFormatter.format(district.rentPerSqm)} €/m²
              </span>
            </div>
            <button
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full moin-gradient-primary px-5 text-sm font-black text-white shadow-lg shadow-violet-600/20 transition-transform hover:-translate-y-0.5"
              onClick={() => onOpenDetails?.(district.id)}
              type="button"
            >
              {tx("Full view", "Vollständige Ansicht")}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
