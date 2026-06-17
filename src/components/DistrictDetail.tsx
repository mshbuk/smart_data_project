import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Heart,
  Home,
  MapPin,
  Share2,
} from "lucide-react";
import type { DistrictMatch, Preferences } from "../types/District";
import { getCriterionInsights } from "../utils/districtInsights";
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
  const population = district.population ?? 0;
  const shareDistrict = () => {
    const message =
      language === "de"
        ? `${district.name} wirkt spannend im Hamburg Finder.`
        : `${district.name} looks interesting in Hamburg Finder.`;

    if (navigator.share) {
      void navigator.share({
        text: message,
        title: district.name,
        url: window.location.href,
      });
      return;
    }

    void navigator.clipboard?.writeText(`${district.name} - ${window.location.href}`);
  };

  return (
    <section className="min-h-screen bg-background pb-24">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {district.imageUrl ? (
          <img alt={district.name} className="h-full w-full object-cover" src={district.imageUrl} />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
          <button
            aria-label={tx("Back", "Zurück")}
            className="grid h-10 w-10 place-items-center rounded-full bg-background/85 shadow-card backdrop-blur"
            onClick={onBack}
            type="button"
          >
            <ArrowLeft aria-hidden="true" className="h-5 w-5" />
          </button>
          <div className="flex gap-1">
            <button
              aria-label={isSaved ? tx("Remove from saved", "Aus Gespeichert entfernen") : tx("Save district", "Stadtteil speichern")}
              className="grid h-10 w-10 place-items-center rounded-full bg-background/85 shadow-card backdrop-blur"
              onClick={() => onToggleSave(district.id)}
              type="button"
            >
              <Heart aria-hidden="true" className={isSaved ? "h-5 w-5 fill-primary text-primary" : "h-5 w-5"} />
            </button>
            <button
              aria-label={tx("Share district", "Stadtteil teilen")}
              className="grid h-10 w-10 place-items-center rounded-full bg-background/85 shadow-card backdrop-blur"
              onClick={shareDistrict}
              type="button"
            >
              <Share2 aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-5 px-4 pb-24 pt-4">
        <section>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Hamburg</span>
          <h1 className="mt-1 font-display text-2xl font-bold">{district.name}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{district.shortDescription}</p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{tx("Match", "Passung")}</span>
            <span className="font-display text-2xl font-bold text-primary tabular-nums">{match.score}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${match.score}%` }} />
          </div>
          <p className="mt-3 text-sm leading-relaxed">{match.explanation}</p>
        </section>

        <section>
          <h3 className="mb-2 font-display text-base font-semibold">{tx("Why it matches", "Warum es passt")}</h3>
          <ul className="space-y-1.5 text-sm">
            {match.strengths.slice(0, 4).map((strength) => (
              <li className="flex gap-2" key={strength}>
                <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                {strength}
              </li>
            ))}
          </ul>
        </section>

        <section className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">{tx("Average rent", "Ø Miete")}</p>
            <p className="mt-1 font-display text-lg font-semibold">
              {district.rentPerSqm.toFixed(2)} €/m²
            </p>
            <p className="text-[10px] text-muted-foreground">Miet-Check 2026</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">{tx("Population", "Einwohner")}</p>
            <p className="mt-1 font-display text-lg font-semibold">
              {population ? population.toLocaleString(language === "de" ? "de-DE" : "en-US") : "Demo"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {district.populationDensity.toLocaleString(language === "de" ? "de-DE" : "en-US")} Einw./km²
            </p>
          </div>
        </section>

        {district.crimeCases2024 != null && (
          <section className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Polizeiliche Kriminalstatistik 2024</p>
            <p className="mt-1 text-sm">
              <span className="font-display text-lg font-semibold">{district.crimeCases2024.toLocaleString("de-DE")}</span>{" "}
              <span className="text-muted-foreground">erfasste Fälle</span>
              {population > 0 && (
                <span className="text-muted-foreground"> · {((district.crimeCases2024 / population) * 1000).toFixed(1)} / 1.000 Einw.</span>
              )}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">Quelle: Polizei Hamburg, PKS Stadtteilatlas 2024.</p>
          </section>
        )}

        <section>
          <h3 className="mb-2 font-display text-base font-semibold">{tx("Facts", "Fakten")}</h3>
          <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
            {insights.slice(0, 7).map((insight) => (
              <div className="grid grid-cols-[1fr_34%_auto] items-center gap-3" key={insight.key}>
                <span className="text-sm text-muted-foreground">{insight.label}</span>
                <span className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <span className="block h-full rounded-full bg-gradient-primary" style={{ width: `${insight.score * 10}%` }} />
                </span>
                <span className="text-sm font-semibold tabular-nums">{insight.score.toFixed(1)}/10</span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-card p-3">
            <p className="mb-1 text-xs font-medium text-success">{tx("Pros", "Vorteile")}</p>
            <ul className="space-y-1 text-xs">
              {match.strengths.slice(0, 3).map((strength) => (
                <li key={strength}>+ {strength}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-3">
            <p className="mb-1 text-xs font-medium text-destructive">{tx("Cons", "Zu beachten")}</p>
            <ul className="space-y-1 text-xs">
              {(match.tradeoffs.length ? match.tradeoffs : [tx("Rent level can vary by street.", "Mietniveau kann je nach Lage variieren.")]).slice(0, 3).map((tradeoff) => (
                <li key={tradeoff}>- {tradeoff}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-2xl bg-primary-soft p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent-foreground">{tx("Next step", "Nächster Schritt")}</p>
          <p className="mt-1 text-sm">
            {tx(
              `Discover apartment searches filtered for ${district.name}.`,
              `Entdecke Wohnungssuchen mit ${district.name} als Filter.`,
            )}
          </p>
          <div className="mt-3 grid gap-2">
            {housingSearchLinks.map((link) => (
              <a
                className="flex items-center justify-between rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-soft"
                href={link.url}
                key={link.label}
                rel="noreferrer"
                target="_blank"
              >
                <span className="inline-flex items-center gap-2">
                  <Home aria-hidden="true" className="h-4 w-4" />
                  {link.label}
                </span>
                <ExternalLink aria-hidden="true" className="h-4 w-4" />
              </a>
            ))}
          </div>
        </section>

        <button
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-medium"
          onClick={onBack}
          type="button"
        >
          <MapPin aria-hidden="true" className="h-4 w-4" />
          {tx("Back to results", "Zurück zu den Ergebnissen")}
        </button>

        <section className="rounded-2xl border border-dashed border-border bg-muted/30 p-3 text-[11px] leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground">Datenquellen</p>
          <p className="mt-1">{district.sourceSummary || "Statistikamt Nord 2024, Polizei Hamburg PKS 2024, Miet-Check 2026."}</p>
          {district.missingSources?.length ? (
            <p className="mt-1">Fehlend: {district.missingSources.join(", ")}.</p>
          ) : null}
          <p className="mt-1">Datenqualität: <b>{district.dataQuality ?? "demo"}</b>.</p>
        </section>
      </div>
    </section>
  );
}
