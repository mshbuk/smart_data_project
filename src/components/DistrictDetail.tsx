import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Euro,
  Heart,
  Home,
  Info,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import type { DistrictMatch, Preferences } from "../types/District";
import {
  formatScore,
  getCriterionInsights,
  getDemoListings,
  getDistrictTraits,
  getImportanceLabel,
  getKnownFor,
} from "../utils/districtInsights";
import { useI18n } from "../i18n";

type DistrictDetailProps = {
  isSaved: boolean;
  match: DistrictMatch;
  preferences: Preferences;
  onBack: () => void;
  onEditCriteria: () => void;
  onToggleSave: (districtId: string) => void;
};

export function DistrictDetail({
  isSaved,
  match,
  preferences,
  onBack,
  onEditCriteria,
  onToggleSave,
}: DistrictDetailProps) {
  const { language, tx } = useI18n();
  const { district } = match;
  const traits = getDistrictTraits(district, language);
  const facts = getKnownFor(district, language);
  const insights = getCriterionInsights(district, preferences, language)
    .filter((insight) => insight.weight > 0)
    .sort((a, b) => b.weight - a.weight || b.score - a.score);
  const listings = getDemoListings(district, language);

  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-white px-4 text-sm font-black text-slate-700 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition-colors hover:bg-slate-50"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          {tx("Back to matches", "Zurück zu den Treffern")}
        </button>

        <button
          className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-indigo-600 px-4 text-sm font-black text-white shadow-lg shadow-indigo-600/20 transition-colors hover:bg-indigo-700"
          onClick={onEditCriteria}
          type="button"
        >
          <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
          {tx("Edit criteria", "Kriterien bearbeiten")}
        </button>
      </div>

      <article className="overflow-hidden rounded-[1.8rem] border border-white/80 bg-white shadow-[0_22px_55px_rgba(15,23,42,0.1)]">
        <div className="relative min-h-[300px] bg-slate-200">
          {district.imageUrl ? (
            <img alt="" className="absolute inset-0 h-full w-full object-cover" src={district.imageUrl} />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-slate-200 to-indigo-200" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 text-white md:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-white/80">{tx("District detail", "Stadtteil-Details")}</p>
                <h2 className="mt-1 text-4xl font-black leading-tight md:text-5xl">{district.name}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {traits.map((trait) => (
                    <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-black backdrop-blur" key={trait}>
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 text-slate-950 shadow-xl">
                <span className="block text-3xl font-black leading-none text-indigo-600">{match.score}%</span>
                <span className="mt-1 block text-xs font-black uppercase tracking-wide text-slate-500">{tx("profile fit", "Profilpassung")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-4 md:p-5 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="grid gap-4">
            <div className="rounded-[1.35rem] bg-slate-50 p-4">
              <div className="flex items-center gap-2">
                <Sparkles aria-hidden="true" className="h-5 w-5 text-indigo-600" />
                <h3 className="text-xl font-black text-slate-950">{tx("Why it matches", "Warum es passt")}</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">{match.explanation}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {match.strengths.map((strength) => (
                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700" key={strength}>
                    {strength}
                  </span>
                ))}
                {match.tradeoffs.map((tradeoff) => (
                  <span className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700" key={tradeoff}>
                    {tradeoff}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[1.35rem] border border-slate-100 bg-white p-4">
              <div className="flex items-center gap-2">
                <Info aria-hidden="true" className="h-5 w-5 text-indigo-600" />
                <h3 className="text-xl font-black text-slate-950">{tx("Score explanations", "Erklärung der Bewertungen")}</h3>
              </div>
              <div className="mt-4 grid gap-3">
                {insights.slice(0, 6).map((insight) => (
                  <div className="grid gap-2 rounded-2xl bg-slate-50 p-3" key={insight.key}>
                    <div className="flex items-center justify-between gap-3">
                      <span>
                        <span className="block text-sm font-black text-slate-950">{insight.label}</span>
                        <span className="block text-xs font-bold text-slate-500">
                          {insight.weight}/5 · {getImportanceLabel(insight.weight, language)}
                        </span>
                      </span>
                      <span className="rounded-xl bg-white px-3 py-1.5 text-sm font-black text-slate-900">
                        {formatScore(insight.score)}/10
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white">
                      <div className="h-full rounded-full bg-indigo-600" style={{ width: `${insight.score * 10}%` }} />
                    </div>
                    <p className="text-xs font-bold leading-5 text-slate-600">{insight.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="grid content-start gap-4">
            <section className="rounded-[1.35rem] border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-2">
                <BadgeCheck aria-hidden="true" className="h-5 w-5 text-emerald-600" />
                <h3 className="text-xl font-black text-slate-950">{tx("Known for", "Bekannt für")}</h3>
              </div>
              <div className="mt-3 grid gap-2">
                {facts.map((fact) => (
                  <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-bold text-slate-700" key={fact}>
                    <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0 text-emerald-500" />
                    {fact}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[1.35rem] border border-indigo-100 bg-indigo-50 p-4">
              <div className="flex items-center gap-2">
                <Home aria-hidden="true" className="h-5 w-5 text-indigo-600" />
                <h3 className="text-xl font-black text-slate-950">{tx("Apartment previews", "Wohnungs-Vorschau")}</h3>
              </div>
              <p className="mt-2 text-xs font-bold leading-5 text-slate-600">
                {tx(
                  "Demo listings shown in-platform so the flow does not depend on external redirects.",
                  "Demo-Angebote werden direkt in der Plattform gezeigt, damit der Flow nicht von Weiterleitungen abhängt.",
                )}
              </p>
              <div className="mt-3 grid gap-2">
                {listings.map((listing) => (
                  <article className="rounded-2xl bg-white p-3 shadow-sm shadow-slate-950/5" key={listing.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-black text-slate-950">{listing.title}</h4>
                        <p className="mt-1 text-xs font-bold text-slate-500">
                          {listing.rooms} {tx("rooms", "Zimmer")} · {listing.size} {tx("sqm", "qm")}
                        </p>
                      </div>
                      <span className="rounded-xl bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">
                        EUR {listing.rent}
                      </span>
                    </div>
                    <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[0.68rem] font-black text-slate-600">
                      {listing.tag}
                    </span>
                  </article>
                ))}
              </div>
            </section>

            <button
              className={[
                "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-black transition-colors",
                isSaved
                  ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                  : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700",
              ].join(" ")}
              onClick={() => onToggleSave(district.id)}
              type="button"
            >
              <Heart aria-hidden="true" className={isSaved ? "h-4 w-4 fill-current" : "h-4 w-4"} />
              {isSaved ? tx("Remove from saved", "Aus Gespeichert entfernen") : tx("Save for comparison", "Für Vergleich speichern")}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-slate-50 px-3 py-2">
                <Euro aria-hidden="true" className="h-4 w-4 text-emerald-600" />
                <p className="mt-2 text-xs font-bold text-slate-500">{tx("Rent", "Miete")}</p>
                <p className="text-sm font-black text-slate-950">
                  EUR {new Intl.NumberFormat(language === "de" ? "de-DE" : "en-US").format(district.rentPerSqm)}/{tx("sqm", "qm")}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-3 py-2">
                <Building2 aria-hidden="true" className="h-4 w-4 text-indigo-600" />
                <p className="mt-2 text-xs font-bold text-slate-500">{tx("Density", "Dichte")}</p>
                <p className="text-sm font-black text-slate-950">
                  {district.populationDensity.toLocaleString(language === "de" ? "de-DE" : "en-US")}/km²
                </p>
              </div>
            </div>
          </aside>
        </div>
      </article>
    </section>
  );
}
