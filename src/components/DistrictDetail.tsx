import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ExternalLink,
  Heart,
  Info,
  Share2,
} from "lucide-react";
import type { DistrictMatch, Preferences } from "../types/District";
import {
  getCriterionInsights,
} from "../utils/districtInsights";
import { useI18n } from "../i18n";

type DistrictDetailProps = {
  isSaved: boolean;
  match: DistrictMatch;
  preferences: Preferences;
  onBack: () => void;
  onToggleSave: (districtId: string) => void;
};

function createHousingSearchLinks(districtName: string) {
  const query = encodeURIComponent(`Hamburg ${districtName} Wohnung mieten`);

  return [
    {
      label: "ImmoScout24",
      url: `https://www.immobilienscout24.de/Suche/de/hamburg/hamburg/wohnung-mieten?enteredFrom=result_list&searchQuery=${query}`,
    },
    {
      label: "Immowelt",
      url: `https://www.immowelt.de/suche/hamburg/wohnungen/mieten?query=${query}`,
    },
    {
      label: "WG-Gesucht",
      url: `https://www.wg-gesucht.de/wohnungen-in-Hamburg.55.2.1.0.html?query=${query}`,
    },
    {
      label: "Kleinanzeigen",
      url: `https://www.kleinanzeigen.de/s-wohnung-mieten/hamburg/${query}/k0c203l9409`,
    },
  ];
}

export function DistrictDetail({
  isSaved,
  match,
  preferences,
  onBack,
  onToggleSave,
}: DistrictDetailProps) {
  const { language, tx } = useI18n();
  const { district } = match;
  const insights = getCriterionInsights(district, preferences, language)
    .filter((insight) => insight.weight > 0)
    .sort((a, b) => b.weight - a.weight || b.score - a.score);
  const housingSearchLinks = createHousingSearchLinks(district.name);
  const shareDistrict = () => {
    const message =
      language === "de"
        ? `${district.name} wirkt spannend in Moin.`
        : `${district.name} looks interesting in Moin.`;

    if (navigator.share) {
      void navigator.share({
        text: message,
        title: district.name,
        url: window.location.href,
      });
      return;
    }

    window.alert(
      tx(
        "Demo share: copy this district name and send it to a friend.",
        "Demo-Teilen: Kopiere diesen Stadtteilnamen und sende ihn an eine Freundin oder einen Freund.",
      ),
    );
  };

  return (
    <section className="-mx-4 -mt-6 grid gap-8 pb-6 sm:mx-0 sm:mt-0">
      <div className="relative min-h-[25rem] overflow-hidden bg-slate-200 sm:rounded-[2rem]">
        {district.imageUrl ? (
          <img alt="" className="absolute inset-0 h-full w-full object-cover" src={district.imageUrl} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-slate-200 to-slate-200" />
        )}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <button
            aria-label={tx("Back", "Zurück")}
            className="grid h-13 w-13 place-items-center rounded-full bg-white text-slate-950 shadow-[0_12px_28px_rgba(15,23,42,0.2)]"
            onClick={onBack}
            type="button"
          >
            <ArrowLeft aria-hidden="true" className="h-6 w-6" />
          </button>
          <div className="flex gap-3">
            <button
              aria-label={isSaved ? tx("Remove from saved", "Aus Gespeichert entfernen") : tx("Save district", "Stadtteil speichern")}
              className="grid h-13 w-13 place-items-center rounded-full bg-white text-slate-950 shadow-[0_12px_28px_rgba(15,23,42,0.2)]"
              onClick={() => onToggleSave(district.id)}
              type="button"
            >
              <Heart aria-hidden="true" className={isSaved ? "h-6 w-6 fill-rose-500 text-rose-500" : "h-6 w-6"} />
            </button>
            <button
              aria-label={tx("Share district", "Stadtteil teilen")}
              className="grid h-13 w-13 place-items-center rounded-full bg-white text-slate-950 shadow-[0_12px_28px_rgba(15,23,42,0.2)]"
              onClick={shareDistrict}
              type="button"
            >
              <Share2 aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <article className="-mt-24 mx-4 grid gap-8 sm:mx-0">
        <section className="relative rounded-[2.2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_54px_rgba(15,23,42,0.12)]">
          <div className="grid grid-cols-[1fr_auto] gap-5">
            <div>
              <p className="text-lg font-black uppercase tracking-[0.18em] text-rose-500">Hamburg</p>
              <h1 className="mt-3 text-[2.55rem] font-black leading-none tracking-[-0.06em] text-slate-950">
                {district.name}
              </h1>
              <p className="mt-4 text-xl font-medium leading-tight tracking-[-0.03em] text-slate-500">
                {district.shortDescription}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[2.65rem] font-black leading-none tracking-[-0.06em] text-sky-500">{match.score}%</p>
              <p className="mt-2 text-sm font-black uppercase tracking-wide text-slate-400">Match</p>
            </div>
          </div>

          <p className="mt-7 text-[1.25rem] font-medium leading-[1.55] tracking-[-0.03em] text-slate-700">
            {match.explanation}
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="rounded-[1.45rem] bg-slate-50 p-5">
              <p className="text-sm font-black uppercase text-slate-400">{tx("Rent", "Miete")}</p>
              <p className="mt-4 text-lg font-black text-slate-950">
                {new Intl.NumberFormat(language === "de" ? "de-DE" : "en-US", {
                  maximumFractionDigits: 1,
                }).format(district.rentPerSqm)}{" "}
                €<span className="text-base font-medium text-slate-500">/m²</span>
              </p>
            </div>
            <div className="rounded-[1.45rem] bg-slate-50 p-5">
              <p className="text-sm font-black uppercase text-slate-400">{tx("Safety", "Sicherheit")}</p>
              <p className="mt-4 text-lg font-black text-slate-950">
                {Math.round(district.safetyScore * 10)}
                <span className="text-base font-medium text-slate-500">/100</span>
              </p>
            </div>
            <div className="rounded-[1.45rem] bg-slate-50 p-5">
              <p className="text-sm font-black uppercase text-slate-400">ÖPNV</p>
              <p className="mt-4 text-lg font-black text-slate-950">
                {Math.round(district.publicTransportScore * 10)}
                <span className="text-base font-medium text-slate-500">/100</span>
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <button
              className="inline-flex min-h-13 items-center justify-center gap-3 rounded-full border border-slate-200 bg-white px-4 text-base font-black text-slate-950 transition-colors hover:bg-slate-50"
              onClick={() => onToggleSave(district.id)}
              type="button"
            >
              <BadgeCheck aria-hidden="true" className="h-6 w-6" />
              {tx("Compare", "Vergleichen")}
            </button>
            <button
              className="inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-slate-950 px-4 text-base font-black text-white transition-colors hover:bg-slate-800"
              onClick={onBack}
              type="button"
            >
              <Info aria-hidden="true" className="h-6 w-6" />
              {tx("On map", "Auf Karte")}
            </button>
          </div>
        </section>

        <section className="rounded-[2.2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black uppercase tracking-[0.18em] text-slate-400">
            {tx("Fits you because", "Passt zu dir, weil:")}
          </h2>
          <div className="mt-8 grid gap-5">
            {match.strengths.slice(0, 3).map((strength) => (
              <p className="flex items-center gap-5 text-xl font-medium text-slate-950" key={strength}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sky-50 text-sky-500">
                  <CheckCircle2 aria-hidden="true" className="h-6 w-6" />
                </span>
                {strength}
              </p>
            ))}
          </div>
        </section>

        <section className="rounded-[2.2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black uppercase tracking-[0.18em] text-slate-400">
            {tx("Ratings", "Bewertungen")}
          </h2>
          <div className="mt-8 grid gap-5">
            {insights.slice(0, 6).map((insight) => (
              <div className="grid grid-cols-[1fr_36%_auto] items-center gap-4" key={insight.key}>
                <span className="text-xl font-medium text-slate-500">{insight.label}</span>
                <span className="h-3 overflow-hidden rounded-full bg-slate-200">
                  <span className="block h-full rounded-full bg-slate-950" style={{ width: `${insight.score * 10}%` }} />
                </span>
                <span className="text-xl font-black text-slate-950">{Math.round(insight.score * 10)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2.2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black uppercase tracking-[0.18em] text-sky-500">{tx("Advantages", "Vorteile")}</h2>
          <div className="mt-6 grid gap-5">
            {match.strengths.slice(0, 4).map((strength) => (
              <p className="flex items-center gap-4 text-xl font-medium text-slate-950" key={strength}>
                <CheckCircle2 aria-hidden="true" className="h-6 w-6 text-sky-500" />
                {strength}
              </p>
            ))}
          </div>
        </section>

        <section className="rounded-[2.2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black uppercase tracking-[0.18em] text-rose-500">{tx("Watch out for", "Zu beachten")}</h2>
          <div className="mt-6 grid gap-5">
            {(match.tradeoffs.length ? match.tradeoffs : [tx("Rent level may vary by street.", "Mietniveau kann je nach Lage variieren.")]).slice(0, 3).map((tradeoff) => (
              <p className="flex items-center gap-4 text-xl font-medium text-slate-950" key={tradeoff}>
                <span className="text-rose-500">×</span>
                {tradeoff}
              </p>
            ))}
          </div>
        </section>

        <section className="rounded-[2.2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <h2 className="text-xl font-black uppercase tracking-[0.16em] text-slate-700">
            {tx("Next step", "Nächster Schritt")}
          </h2>
          <p className="mt-3 text-base font-medium leading-relaxed text-slate-700">
            {tx(
              "We forward you with this district as a filter.",
              "Wir leiten dich mit diesem Stadtteil als Filter weiter.",
            )}
          </p>
          <div className="mt-6 grid gap-3">
            {housingSearchLinks.map((link) => (
              <a
                className="inline-flex min-h-13 items-center justify-between rounded-[1.4rem] bg-white px-4 text-base font-black text-slate-950 shadow-sm transition-colors hover:bg-slate-100"
                href={link.url}
                key={link.label}
                rel="noreferrer"
                target="_blank"
              >
                <span className="inline-flex items-center gap-4">
                  <Building2 aria-hidden="true" className="h-6 w-6 text-slate-950" />
                  {link.label}
                </span>
                <ExternalLink aria-hidden="true" className="h-5 w-5 text-slate-500" />
              </a>
            ))}
          </div>
        </section>
      </article>
    </section>
  );
}
