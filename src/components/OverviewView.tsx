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
    <section className="mx-auto grid max-w-[760px] gap-12 px-2 pb-6">
      <div className="pt-8">
        <p className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.22em] text-rose-500">
          <Sparkles aria-hidden="true" className="h-6 w-6" />
          Hamburg Match
        </p>
        <h1 className="mt-9 max-w-[11ch] text-[4.25rem] font-black leading-[0.98] tracking-[-0.06em] text-slate-950 sm:max-w-none sm:text-7xl">
          {tx("Your new home in Hamburg.", "Dein neues Zuhause in Hamburg.")}
        </h1>
        <p className="mt-9 max-w-xl text-[2rem] font-medium leading-[1.45] tracking-[-0.03em] text-slate-500 sm:text-4xl">
          {tx(
            "Discover districts that truly fit your lifestyle.",
            "Entdecke Stadtteile, die wirklich zu deinem Lebensstil passen.",
          )}
        </p>
      </div>

      <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
        <img alt="" className="h-[32rem] w-full object-cover" src={heroImage} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/5 to-transparent" />
        <button
          className="absolute inset-x-10 bottom-10 inline-flex min-h-28 items-center justify-between gap-4 rounded-full bg-white px-12 text-[1.75rem] font-black tracking-[-0.04em] text-slate-950 shadow-[0_18px_40px_rgba(15,23,42,0.22)] transition-transform hover:-translate-y-1"
          onClick={onStartFinder}
          type="button"
        >
          <span className="inline-flex items-center gap-5">
            <Sparkles aria-hidden="true" className="h-7 w-7 text-rose-500" />
            {tx("Find your district", "Finde deinen Stadtteil")}
          </span>
          <ArrowRight aria-hidden="true" className="h-9 w-9" />
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-1">
        {[
          { icon: Compass, label: tx("Explore map", "Karte erkunden") },
          { icon: SlidersHorizontal, label: tx("Adjust criteria", "Antworten anpassen") },
          { icon: MapPin, label: tx("View all matches", "Alle Matches") },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <button
              className="inline-flex min-h-16 shrink-0 items-center gap-3 rounded-full border border-slate-200 bg-white px-8 text-xl font-black text-slate-950 shadow-sm transition-colors hover:bg-slate-50"
              key={item.label}
              onClick={item.label.includes("Alle") || item.label.includes("all") ? onShowAllResults : onStartFinder}
              type="button"
            >
              <Icon aria-hidden="true" className="h-6 w-6 text-slate-600" />
              {item.label}
            </button>
          );
        })}
      </div>

      <section className="grid gap-7">
        <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-slate-400">
          {tx("How it works", "So funktioniert's")}
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            [tx("Preferences", "Präferenzen"), tx("Tell us what matters", "Sag uns, was dir wichtig ist")],
            [tx("Matching", "Matching"), tx("We analyze districts", "Wir analysieren Stadtteile")],
            [tx("Discover", "Entdecken"), tx("Compare and find your match", "Vergleiche & finde dein Match")],
          ].map(([title, copy], index) => (
            <article className="min-h-60 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm" key={title}>
              <p className="text-lg font-black text-rose-500">0{index + 1}</p>
              <h3 className="mt-7 text-[1.7rem] font-black leading-tight tracking-[-0.04em] text-slate-950">
                {title}
              </h3>
              <p className="mt-4 text-[1.45rem] font-medium leading-tight tracking-[-0.03em] text-slate-500">
                {copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-7">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-slate-400">
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
                  index === 0 ? "border-amber-400 ring-4 ring-amber-400/25" : "border-slate-200",
                ].join(" ")}
                key={district.id}
                onClick={() => onOpenDetails(district.id)}
                type="button"
              >
                <div className="relative h-80 overflow-hidden bg-slate-200">
                  {district.imageUrl && <img alt="" className="h-full w-full object-cover" src={district.imageUrl} />}
                  <span className="absolute left-6 top-6 text-4xl font-black text-white drop-shadow-lg">#{index + 1}</span>
                  {index === 0 && (
                    <span className="absolute left-6 top-6 translate-y-14 rounded-full bg-amber-400 px-5 py-2 text-sm font-black text-slate-950">
                      🏆 Top-Empfehlung
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-[1fr_auto] gap-5 p-8">
                  <div>
                    <h3 className="text-[2.35rem] font-black leading-none tracking-[-0.05em] text-slate-950">
                      {district.name}
                    </h3>
                    <p className="mt-5 text-2xl font-medium leading-tight tracking-[-0.03em] text-slate-500">
                      {district.shortDescription}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[3rem] font-black leading-none tracking-[-0.06em] text-slate-950">{match.score}%</p>
                    <p className="mt-3 text-sm font-black uppercase tracking-wide text-slate-400">Match</p>
                  </div>
                  <div className="col-span-2 grid grid-cols-3 gap-4">
                    <div className="rounded-[1.65rem] bg-slate-50 p-5">
                      <p className="text-sm font-black uppercase text-slate-400">{tx("Rent", "Miete")}</p>
                      <p className="mt-5 text-2xl font-black text-slate-950">
                        {formatRent(district.rentPerSqm, language)} €
                      </p>
                    </div>
                    <div className="rounded-[1.65rem] bg-slate-50 p-5">
                      <p className="text-sm font-black uppercase text-slate-400">ÖPNV</p>
                      <p className="mt-5 text-2xl font-black capitalize text-slate-950">{transitLabel}</p>
                    </div>
                    <div className="rounded-[1.65rem] bg-slate-50 p-5">
                      <p className="text-sm font-black uppercase text-slate-400">{tx("Green", "Grün")}</p>
                      <p className="mt-5 text-2xl font-black text-slate-950">
                        {Math.round(district.greenScore * 10)}/100
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2 flex flex-wrap gap-3">
                    {match.highlights.slice(0, 3).map((highlight) => (
                      <span className="rounded-full bg-sky-50 px-5 py-2 text-lg font-medium text-sky-500" key={highlight}>
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
