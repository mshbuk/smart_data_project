import { ArrowRight, Compass, MapPin, Sparkles, SlidersHorizontal } from "lucide-react";
import type { DistrictMatch } from "../types/District";
import { getScoreLabel } from "../utils/districtInsights";
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
  const topMatches = matches.slice(0, 3);
  const heroImage = topMatches[0]?.district.imageUrl ?? "/smart_data_project/hamburg-harbor.png";

  return (
    <section className="mx-auto grid max-w-[760px] gap-9 px-1 pb-6">
      <div className="pt-6">
        <p className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.22em] text-rose-500">
          <Sparkles aria-hidden="true" className="h-5 w-5" />
          Hamburg Match
        </p>
        <h1 className="mt-7 max-w-[11ch] text-[3.5rem] font-black leading-[0.98] tracking-[-0.06em] text-slate-950 sm:max-w-none sm:text-7xl">
          {tx("Your new home in Hamburg.", "Dein neues Zuhause in Hamburg.")}
        </h1>
        <p className="mt-7 max-w-xl text-[1.65rem] font-medium leading-[1.45] tracking-[-0.03em] text-slate-500 sm:text-4xl">
          {tx(
            "Discover districts that truly fit your lifestyle.",
            "Entdecke Stadtteile, die wirklich zu deinem Lebensstil passen.",
          )}
        </p>
      </div>

      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
        <img alt="" className="h-[26rem] w-full object-cover" src={heroImage} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/5 to-transparent" />
        <button
          className="absolute inset-x-6 bottom-6 inline-flex min-h-20 items-center justify-between gap-4 rounded-full bg-white px-7 text-[1.35rem] font-black tracking-[-0.04em] text-slate-950 shadow-[0_18px_40px_rgba(15,23,42,0.22)] transition-transform hover:-translate-y-1"
          onClick={onStartFinder}
          type="button"
        >
          <span className="inline-flex items-center gap-5">
            <Sparkles aria-hidden="true" className="h-5 w-5 text-rose-500" />
            {tx("Find your district", "Finde deinen Stadtteil")}
          </span>
          <ArrowRight aria-hidden="true" className="h-7 w-7" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { action: "finder", icon: Compass, label: tx("Explore map", "Karte erkunden") },
          { action: "finder", icon: SlidersHorizontal, label: tx("Adjust criteria", "Antworten anpassen") },
          { action: "results", icon: MapPin, label: tx("View all matches", "Alle Matches") },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <button
              className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 text-center text-[0.72rem] font-black leading-tight text-slate-950 shadow-sm transition-colors hover:bg-slate-50 sm:text-sm"
              key={item.label}
              onClick={item.action === "results" ? onShowAllResults : onStartFinder}
              type="button"
            >
              <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-600" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <section className="grid gap-7">
        <h2 className="text-xl font-black uppercase tracking-[0.2em] text-slate-400">
          {tx("How it works", "So funktioniert's")}
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            [tx("Preferences", "Präferenzen"), tx("Tell us what matters", "Sag uns, was dir wichtig ist")],
            [tx("Matching", "Matching"), tx("We analyze districts", "Wir analysieren Stadtteile")],
            [tx("Discover", "Entdecken"), tx("Compare and find your match", "Vergleiche & finde dein Match")],
          ].map(([title, copy], index) => (
            <article className="min-h-44 rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm" key={title}>
              <p className="text-base font-black text-rose-500">0{index + 1}</p>
              <h3 className="mt-5 text-[1.25rem] font-black leading-tight tracking-[-0.04em] text-slate-950">
                {title}
              </h3>
              <p className="mt-3 text-[1rem] font-medium leading-tight tracking-[-0.03em] text-slate-500">
                {copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-7">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-black uppercase tracking-[0.2em] text-slate-400">
            {tx("Popular districts", "Beliebte Stadtteile")}
          </h2>
          <span className="text-xl font-bold text-rose-500">Trending</span>
        </div>

        <div className="grid gap-8">
          {topMatches.map((match, index) => {
            const { district } = match;
            const transitLabel = getScoreLabel(district.publicTransportScore, language);

            return (
              <button
                className={[
                  "overflow-hidden rounded-[2.6rem] border bg-white text-left shadow-[0_18px_46px_rgba(15,23,42,0.08)] transition-transform hover:-translate-y-1",
                  index === 0 ? "border-slate-950 ring-2 ring-slate-950/10" : "border-slate-200",
                ].join(" ")}
                key={district.id}
                onClick={() => onOpenDetails(district.id)}
                type="button"
              >
                <div className="relative h-64 overflow-hidden bg-slate-200">
                  {district.imageUrl && <img alt="" className="h-full w-full object-cover" src={district.imageUrl} />}
                  <span className="absolute left-6 top-6 text-4xl font-black text-white drop-shadow-lg">#{index + 1}</span>
                  {index === 0 && (
                    <span className="absolute left-6 top-6 translate-y-14 rounded-full bg-amber-400 px-5 py-2 text-sm font-black text-slate-950">
                      🏆 Top-Empfehlung
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-[1fr_auto] gap-4 p-6">
                  <div>
                    <h3 className="text-[2rem] font-black leading-none tracking-[-0.05em] text-slate-950">
                      {district.name}
                    </h3>
                    <p className="mt-4 text-[1.35rem] font-medium leading-tight tracking-[-0.03em] text-slate-500">
                      {district.shortDescription}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[2.5rem] font-black leading-none tracking-[-0.06em] text-slate-950">{match.score}%</p>
                    <p className="mt-3 text-sm font-black uppercase tracking-wide text-slate-400">Match</p>
                  </div>
                  <div className="col-span-2 grid grid-cols-3 gap-4">
                    <div className="rounded-[1.35rem] bg-slate-50 p-4">
                      <p className="text-sm font-black uppercase text-slate-400">{tx("Rent", "Miete")}</p>
                      <p className="mt-4 text-xl font-black text-slate-950">
                        {formatRent(district.rentPerSqm, language)} €
                      </p>
                    </div>
                    <div className="rounded-[1.35rem] bg-slate-50 p-4">
                      <p className="text-sm font-black uppercase text-slate-400">ÖPNV</p>
                      <p className="mt-4 text-lg font-black capitalize text-slate-950">{transitLabel}</p>
                    </div>
                    <div className="rounded-[1.35rem] bg-slate-50 p-4">
                      <p className="text-sm font-black uppercase text-slate-400">{tx("Green", "Grün")}</p>
                      <p className="mt-4 text-xl font-black text-slate-950">
                        {Math.round(district.greenScore * 10)}/100
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2 flex flex-wrap gap-3">
                    {match.highlights.slice(0, 3).map((highlight) => (
                      <span className="rounded-full bg-sky-50 px-4 py-1.5 text-base font-medium text-sky-500" key={highlight}>
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          className="mx-auto inline-flex min-h-14 items-center justify-center rounded-full border border-slate-200 bg-white px-8 text-base font-black text-slate-950 shadow-sm transition-colors hover:bg-slate-50"
          onClick={onShowAllResults}
          type="button"
        >
          {tx("Show more results", "Mehr Ergebnisse anzeigen")}
        </button>
      </section>
    </section>
  );
}
