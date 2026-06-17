import { Heart, Trophy } from "lucide-react";
import type { DistrictMatch } from "../types/District";
import { useI18n } from "../i18n";

type DistrictCardProps = {
  match: DistrictMatch;
  isSaved: boolean;
  onToggleSave: (districtId: string) => void;
  onOpenDetails?: (districtId: string) => void;
  rank: number;
};

export function DistrictCard({ match, isSaved, onToggleSave, onOpenDetails, rank }: DistrictCardProps) {
  const { language, tx } = useI18n();
  const { district } = match;
  const rentFormatter = new Intl.NumberFormat(language === "de" ? "de-DE" : "en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
  const shortReason = match.strengths[0] ?? district.shortDescription;
  const isTop = rank === 1;

  return (
    <article
      className={[
        "overflow-hidden rounded-3xl bg-card shadow-card transition hover:shadow-lg",
        isTop ? "border-4 border-warning" : "border border-border",
      ].join(" ")}
    >
      <div className="grid">
        <button
          aria-label={tx(`Open ${district.name} details`, `${district.name} Details öffnen`)}
          className="group relative aspect-[16/10] w-full overflow-hidden bg-muted text-left"
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
            <div className="absolute inset-0 bg-muted" />
          )}
          {isTop && (
            <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-warning px-3 py-1.5 text-xs font-bold text-foreground shadow">
              <Trophy aria-hidden="true" className="h-3.5 w-3.5" />
              {tx("Top pick", "Top-Empfehlung")}
            </span>
          )}
          <span className={`absolute ${isTop ? "left-3 top-14" : "left-3 top-3"} font-display text-3xl font-extrabold text-white drop-shadow-md`}>
            #{rank}
          </span>
          <div className="absolute right-3 top-3 rounded-2xl bg-black/35 px-3 py-1.5 text-right text-white backdrop-blur-md">
            <p className="text-[10px] font-medium uppercase tracking-wider opacity-80">Match</p>
            <p className="-mt-0.5 font-display text-lg font-bold leading-tight tabular-nums">{match.score}%</p>
          </div>
        </button>

        <div className="p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-display text-xl font-bold text-foreground">{district.name}</h3>
              <p className="mt-2 text-sm leading-snug text-muted-foreground">{shortReason}</p>
            </div>
            <button
              aria-label={
                isSaved
                  ? tx(`Remove ${district.name} from saved districts`, `${district.name} aus Gespeichert entfernen`)
                  : tx(`Save ${district.name}`, `${district.name} speichern`)
              }
              className={[
                "grid h-9 w-9 shrink-0 place-items-center rounded-full transition-all",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                isSaved
                  ? "bg-rose-50 text-rose-600"
                  : "bg-muted text-muted-foreground hover:bg-rose-50 hover:text-rose-600",
              ].join(" ")}
              onClick={() => onToggleSave(district.id)}
              type="button"
            >
              <Heart aria-hidden="true" className={isSaved ? "h-5 w-5 fill-current" : "h-5 w-5"} />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
              {match.highlights.slice(0, 3).map((highlight) => (
                <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-accent-foreground" key={highlight}>
                  ✓ {highlight}
                </span>
              ))}
              <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">
                Ø {rentFormatter.format(district.rentPerSqm)} €/m²
              </span>
          </div>

            <button
              className="mt-4 block w-full rounded-2xl bg-gradient-primary py-3 text-center text-sm font-semibold text-primary-foreground shadow-soft"
              onClick={() => onOpenDetails?.(district.id)}
              type="button"
            >
              {tx("Full view", "Vollständige Ansicht")}
            </button>
        </div>
      </div>
    </article>
  );
}
