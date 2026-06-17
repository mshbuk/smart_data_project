import { Heart, Sliders, Trophy } from "lucide-react";
import type { DistrictMatch } from "../types/District";
import { useI18n } from "../i18n";

type OverviewViewProps = {
  matches: DistrictMatch[];
  onOpenDetails: (districtId: string) => void;
  onShowAllResults: () => void;
  onStartFinder: () => void;
};

function formatRent(value: number, language: "de" | "en") {
  return new Intl.NumberFormat(language === "de" ? "de-DE" : "en-US", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(value);
}

export function OverviewView({ matches, onOpenDetails, onShowAllResults, onStartFinder }: OverviewViewProps) {
  const { language, tx } = useI18n();
  const visibleMatches = matches.slice(0, 3);

  return (
    <section>
      <div className="mb-4 flex items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {tx(
            "Your strongest Hamburg district matches based on the current profile.",
            "Deine stärksten Hamburger Stadtteil-Matches auf Basis deines aktuellen Profils.",
          )}
        </p>
        <button
          className="flex shrink-0 items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium shadow-card"
          onClick={onStartFinder}
          type="button"
        >
          <Sliders aria-hidden="true" className="h-3.5 w-3.5" />
          {tx("Adjust", "Anpassen")}
        </button>
      </div>

      <ul className="space-y-5">
        {visibleMatches.map((match, index) => {
          const { district } = match;
          const isTop = index === 0;

          return (
            <li key={district.id}>
              <button
                className={[
                  "block w-full overflow-hidden rounded-3xl bg-card text-left shadow-card transition hover:shadow-lg",
                  isTop ? "border-4 border-warning" : "border border-border",
                ].join(" ")}
                onClick={() => onOpenDetails(district.id)}
                type="button"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                  {district.imageUrl ? (
                    <img
                      alt={district.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      src={district.imageUrl}
                    />
                  ) : (
                    <div className="h-full w-full bg-muted" />
                  )}
                  {isTop && (
                    <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-warning px-3 py-1.5 text-xs font-bold text-foreground shadow">
                      <Trophy aria-hidden="true" className="h-3.5 w-3.5" />
                      {tx("Top pick", "Top-Empfehlung")}
                    </span>
                  )}
                  <span className={`absolute ${isTop ? "left-3 top-14" : "left-3 top-3"} font-display text-3xl font-extrabold text-white drop-shadow-md`}>
                    #{index + 1}
                  </span>
                  <div className="absolute right-3 top-3 rounded-2xl bg-black/35 px-3 py-1.5 text-right text-white backdrop-blur-md">
                    <p className="text-[10px] font-medium uppercase tracking-wider opacity-80">Match</p>
                    <p className="-mt-0.5 font-display text-lg font-bold leading-tight tabular-nums">{match.score}%</p>
                  </div>
                </div>

                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-display text-xl font-bold">{district.name}</h3>
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-muted">
                      <Heart aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                    </span>
                  </div>
                  <p className="text-sm leading-snug text-muted-foreground">
                    {(match.strengths[0] ?? district.shortDescription).replace(/\.$/, "")}.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {match.highlights.slice(0, 2).map((highlight) => (
                      <span key={highlight} className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-accent-foreground">
                        ✓ {highlight}
                      </span>
                    ))}
                    <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">
                      Ø {formatRent(district.rentPerSqm, language)} €/m²
                    </span>
                  </div>

                  <span className="mt-4 block rounded-2xl bg-gradient-primary py-3 text-center text-sm font-semibold text-primary-foreground shadow-soft">
                    {tx("Full view", "Vollständige Ansicht")}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {matches.length > 3 && (
        <button
          className="mx-auto mt-5 block rounded-full border border-border bg-card px-5 py-2 text-sm font-medium shadow-card"
          onClick={onShowAllResults}
          type="button"
        >
          {tx("Show more", "Mehr Ergebnisse anzeigen")}
        </button>
      )}
    </section>
  );
}
