import {
  CheckCircle2,
  ExternalLink,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  Send,
  Share2,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { DistrictMatch, Preferences } from "../types/District";
import { getCriterionInsights } from "../utils/districtInsights";
import { useI18n } from "../i18n";
import { formatMonthlyRent50 } from "../utils/rent";

type DistrictDetailProps = {
  isSaved: boolean;
  match: DistrictMatch;
  preferences: Preferences;
  onOpenMap: (districtId: string) => void;
  onToggleSave: (districtId: string) => void;
};

type DistrictReview = {
  author: string;
  id: string;
  isUser?: boolean;
  meta: string;
  rating: number;
  text: string;
};

const reviewStorageKey = "district-finder-community-reviews-v1";

function loadStoredReviews(): Record<string, DistrictReview[]> {
  if (typeof window === "undefined") return {};

  try {
    const stored = window.localStorage.getItem(reviewStorageKey);
    if (!stored) return {};

    const parsed = JSON.parse(stored) as Record<string, DistrictReview[]>;
    return Object.fromEntries(
      Object.entries(parsed).map(([districtId, reviews]) => [
        districtId,
        Array.isArray(reviews)
          ? reviews.filter(
              (review): review is DistrictReview =>
                typeof review?.author === "string" &&
                typeof review.id === "string" &&
                typeof review.meta === "string" &&
                typeof review.rating === "number" &&
                typeof review.text === "string",
            )
          : [],
      ]),
    );
  } catch {
    return {};
  }
}

function storeReviews(reviews: Record<string, DistrictReview[]>) {
  try {
    window.localStorage.setItem(reviewStorageKey, JSON.stringify(reviews));
  } catch {
    // Community comments are demo-local and can safely stay session-only if storage is blocked.
  }
}

function monthlyBudgetFromRentPerSqm(value: number) {
  return Math.round((value * 55) / 50) * 50;
}

type HousingFilters = {
  balcony: boolean;
  furnished: "any" | "yes" | "no";
  maxMonthlyRent: number;
  minSize: number;
  propertyType: "apartment" | "shared" | "house";
  rooms: number;
};

function createHousingSearchLinks(districtName: string, filters: HousingFilters) {
  const searchText = `Hamburg ${districtName} ${filters.propertyType === "shared" ? "WG Zimmer" : filters.propertyType === "house" ? "Haus" : "Wohnung"} mieten bis ${filters.maxMonthlyRent} Euro ${filters.rooms} Zimmer ab ${filters.minSize} qm${filters.balcony ? " Balkon" : ""}${filters.furnished === "yes" ? " möbliert" : ""}`;
  const query = encodeURIComponent(searchText);
  const districtQuery = encodeURIComponent(`Hamburg ${districtName}`);

  return [
    {
      label: "ImmoScout24",
      url: `https://www.immobilienscout24.de/Suche/de/hamburg/hamburg/wohnung-mieten?price=-${filters.maxMonthlyRent}&numberofrooms=${filters.rooms}-${filters.rooms}&livingspace=${filters.minSize}-&searchQuery=${query}`,
    },
    {
      label: "Immowelt",
      url: `https://www.immowelt.de/suche/hamburg/wohnungen/mieten?query=${query}&priceMax=${filters.maxMonthlyRent}&roomi=${filters.rooms}&areaMin=${filters.minSize}`,
    },
    {
      label: "WG-Gesucht",
      url: `https://www.wg-gesucht.de/wohnungen-in-Hamburg.55.2.1.0.html?query=${query}`,
    },
    {
      label: "Kleinanzeigen",
      url: `https://www.kleinanzeigen.de/s-wohnung-mieten/hamburg/${districtQuery}/k0c203l9409?maxPrice=${filters.maxMonthlyRent}&minRooms=${filters.rooms}&minSize=${filters.minSize}`,
    },
  ];
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          aria-hidden="true"
          className={value <= rating ? "h-3.5 w-3.5 fill-current" : "h-3.5 w-3.5 text-muted-foreground/35"}
          key={value}
        />
      ))}
    </span>
  );
}

function buildDemoReviews(districtName: string, language: "de" | "en"): DistrictReview[] {
  if (language === "de") {
    return [
      {
        author: "Lea",
        id: "demo-lea",
        meta: "Wohnt seit 2 Jahren hier",
        rating: 5,
        text: `${districtName} fühlt sich im Alltag sehr gut angebunden an. Besonders die kurzen Wege und kleinen Cafés machen den Stadtteil angenehm.`,
      },
      {
        author: "Nico",
        id: "demo-nico",
        meta: "Hat Wohnungen besichtigt",
        rating: 4,
        text: "Die ruhigeren Straßen sind schön, aber bei der Wohnungssuche lohnt es sich, einzelne Mikrolagen genau zu vergleichen.",
      },
      {
        author: "Samira",
        id: "demo-samira",
        meta: "Community-Mitglied",
        rating: 4,
        text: "Für meinen Arbeitsweg war die ÖPNV-Anbindung der wichtigste Punkt. Die Karte hilft, die guten Ecken schnell zu erkennen.",
      },
    ];
  }

  return [
    {
      author: "Lea",
      id: "demo-lea",
      meta: "Lives here for 2 years",
      rating: 5,
      text: `${districtName} feels well connected day to day. Short routes and small cafes make the district pleasant.`,
    },
    {
      author: "Nico",
      id: "demo-nico",
      meta: "Viewed apartments",
      rating: 4,
      text: "The calmer streets are lovely, but it is worth comparing micro-locations carefully during the apartment search.",
    },
    {
      author: "Samira",
      id: "demo-samira",
      meta: "Community member",
      rating: 4,
      text: "Transit access mattered most for my commute. The map makes the strong corners easier to spot.",
    },
  ];
}

export function DistrictDetail({
  isSaved,
  match,
  preferences,
  onOpenMap,
  onToggleSave,
}: DistrictDetailProps) {
  const { language, tx } = useI18n();
  const { district } = match;
  const [showApartmentDiscovery, setShowApartmentDiscovery] = useState(false);
  const [showAdvancedHousingFilters, setShowAdvancedHousingFilters] = useState(false);
  const [housingFilters, setHousingFilters] = useState<HousingFilters>(() => ({
    balcony: false,
    furnished: "any",
    maxMonthlyRent: monthlyBudgetFromRentPerSqm(preferences.maxRentPerSqm),
    minSize: 45,
    propertyType: "apartment",
    rooms: 2,
  }));
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewsByDistrict, setReviewsByDistrict] = useState<Record<string, DistrictReview[]>>(loadStoredReviews);
  const insights = getCriterionInsights(district, preferences, language)
    .filter((insight) => insight.weight > 0)
    .sort((a, b) => b.weight - a.weight || b.score - a.score);
  const housingSearchLinks = useMemo(() => createHousingSearchLinks(district.name, housingFilters), [district.name, housingFilters]);
  const demoReviews = useMemo(() => buildDemoReviews(district.name, language), [district.name, language]);
  const userReviews = reviewsByDistrict[district.id] ?? [];
  const galleryImages = useMemo(() => {
    const extras = ["eimsbuettel-2.jpg", "ottensen-2.jpg", "winterhude-2.jpg", "altona-2.jpg", "hafencity-2.jpg"];
    const seed = district.name.split("").reduce((total, character) => total + character.charCodeAt(0), 0);
    const asset = (name: string) => `${import.meta.env.BASE_URL}lovable-assets/${name}`;
    return [district.imageUrl || asset("hamburg-hero.jpg"), asset(extras[seed % extras.length]), asset(extras[(seed + 2) % extras.length])];
  }, [district.imageUrl, district.name]);
  const population = district.population ?? 0;

  useEffect(() => {
    storeReviews(reviewsByDistrict);
  }, [reviewsByDistrict]);

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

  const submitReview = () => {
    const text = reviewText.trim();
    if (!text) return;

    const review: DistrictReview = {
      author: tx("You", "Du"),
      id: `user-${Date.now()}`,
      isUser: true,
      meta: tx("Just now", "Gerade eben"),
      rating,
      text,
    };

    setReviewsByDistrict((current) => ({
      ...current,
      [district.id]: [...(current[district.id] ?? []), review],
    }));
    setReviewText("");
    setRating(5);
  };

  return (
    <section className="min-h-screen bg-background pb-32">
      <div className="relative grid h-72 w-full grid-cols-[2fr_1fr] grid-rows-2 gap-1 overflow-hidden bg-muted">
        {galleryImages.map((image, index) => (
          <img alt={index === 0 ? district.name : `${district.name} ${tx("impression", "Eindruck")} ${index + 1}`} className={index === 0 ? "row-span-2 h-full w-full object-cover" : "h-full w-full object-cover"} key={image} src={image} />
        ))}
        <div className="absolute right-3 top-3 flex gap-1">
          <button
            aria-label={isSaved ? tx("Remove from saved", "Aus Favoriten entfernen") : tx("Save district", "Stadtteil favorisieren")}
            className="grid h-10 w-10 place-items-center rounded-full bg-background/85 shadow-card backdrop-blur"
            onClick={() => onToggleSave(district.id)}
            type="button"
          >
            <Heart aria-hidden="true" className={isSaved ? "h-5 w-5 fill-rose-600 text-rose-600" : "h-5 w-5"} />
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
          <button
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft"
            onClick={() => onOpenMap(district.id)}
            type="button"
          >
            <MapPin aria-hidden="true" className="h-4 w-4" />
            {tx("Map", "Karte")}
          </button>
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
            <p className="mt-1 font-display text-lg font-semibold">{formatMonthlyRent50(district.rentPerSqm, language)} €</p>
            <p className="text-[10px] text-muted-foreground">{tx("average for a 50 m² apartment", "durchschnittlich für 50 m²")} · Miet-Check 2026</p>
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
              {(match.tradeoffs.length
                ? match.tradeoffs
                : [tx("Rent level can vary by street.", "Mietniveau kann je nach Lage variieren.")]
              )
                .slice(0, 3)
                .map((tradeoff) => (
                  <li key={tradeoff}>- {tradeoff}</li>
                ))}
            </ul>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{tx("Next step", "Nächster Schritt")}</p>
          <h3 className="mt-1 font-display text-lg font-semibold">{tx("Discover apartments", "Wohnungen entdecken")}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {tx(
              `Discover matching apartments in ${district.name} on our partner platforms.`,
              `Entdecke passende Wohnungen in ${district.name} auf unseren Partnerplattformen.`,
            )}
          </p>

          {!showApartmentDiscovery ? (
            <button
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-soft"
              onClick={() => setShowApartmentDiscovery(true)}
              type="button"
            >
              <Home aria-hidden="true" className="h-4 w-4" />
              {tx("Discover apartments", "Wohnungen entdecken")}
            </button>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-muted/50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{tx("Apartment filters", "Wohnungsfilter")}</p><p className="mt-1 text-sm font-semibold">{district.name}</p></div>
                  <button className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold" onClick={() => setShowAdvancedHousingFilters((value) => !value)} type="button"><SlidersHorizontal className="h-3.5 w-3.5" />{tx("More filters", "Mehr Filter")}</button>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <label className="grid gap-1 text-[10px] font-semibold text-muted-foreground">{tx("Max. rent/month", "Max. Miete/Monat")}<input className="min-w-0 rounded-xl border border-border bg-card px-2 py-2 text-sm font-semibold text-foreground" min="300" onChange={(event) => setHousingFilters((current) => ({ ...current, maxMonthlyRent: Number(event.target.value) }))} step="50" type="number" value={housingFilters.maxMonthlyRent} /></label>
                  <label className="grid gap-1 text-[10px] font-semibold text-muted-foreground">{tx("Rooms", "Zimmer")}<input className="min-w-0 rounded-xl border border-border bg-card px-2 py-2 text-sm font-semibold text-foreground" min="1" onChange={(event) => setHousingFilters((current) => ({ ...current, rooms: Number(event.target.value) }))} step="0.5" type="number" value={housingFilters.rooms} /></label>
                  <label className="grid gap-1 text-[10px] font-semibold text-muted-foreground">{tx("Min. size", "Min. Fläche")}<input className="min-w-0 rounded-xl border border-border bg-card px-2 py-2 text-sm font-semibold text-foreground" min="10" onChange={(event) => setHousingFilters((current) => ({ ...current, minSize: Number(event.target.value) }))} step="5" type="number" value={housingFilters.minSize} /></label>
                </div>
                {showAdvancedHousingFilters && (
                  <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3">
                    <label className="grid gap-1 text-[10px] font-semibold text-muted-foreground">{tx("Home type", "Wohnungstyp")}<select className="rounded-xl border border-border bg-card px-2 py-2 text-sm text-foreground" onChange={(event) => setHousingFilters((current) => ({ ...current, propertyType: event.target.value as HousingFilters["propertyType"] }))} value={housingFilters.propertyType}><option value="apartment">{tx("Apartment", "Wohnung")}</option><option value="shared">WG-Zimmer</option><option value="house">{tx("House", "Haus")}</option></select></label>
                    <label className="grid gap-1 text-[10px] font-semibold text-muted-foreground">{tx("Furnished", "Möbliert")}<select className="rounded-xl border border-border bg-card px-2 py-2 text-sm text-foreground" onChange={(event) => setHousingFilters((current) => ({ ...current, furnished: event.target.value as HousingFilters["furnished"] }))} value={housingFilters.furnished}><option value="any">{tx("No preference", "Egal")}</option><option value="yes">{tx("Yes", "Ja")}</option><option value="no">{tx("No", "Nein")}</option></select></label>
                    <label className="col-span-2 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold"><input checked={housingFilters.balcony} onChange={(event) => setHousingFilters((current) => ({ ...current, balcony: event.target.checked }))} type="checkbox" />{tx("Balcony or terrace", "Balkon oder Terrasse")}</label>
                  </div>
                )}
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{tx("Partner links use these apartment filters where supported.", "Die Partnerlinks übernehmen diese Wohnungsfilter, soweit unterstützt.")}</p>
              </div>

              <div className="grid gap-2">
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
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Community</p>
              <h3 className="mt-1 font-display text-lg font-semibold">{tx("Comments and ratings", "Kommentare und Bewertungen")}</h3>
            </div>
            <MessageCircle aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="space-y-3">
            {[...demoReviews, ...userReviews].map((review) => (
              <article
                className={review.isUser ? "rounded-2xl border border-rose-100 bg-rose-50/60 p-3" : "rounded-2xl bg-muted/45 p-3"}
                key={review.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{review.author}</p>
                    <p className="text-[11px] text-muted-foreground">{review.meta}</p>
                  </div>
                  <RatingStars rating={review.rating} />
                </div>
                <p className="mt-2 text-sm leading-relaxed">{review.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-dashed border-border bg-background p-3">
            <p className="text-sm font-semibold">{tx("Leave your own comment", "Eigenen Kommentar hinterlassen")}</p>
            <div className="mt-3 flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  aria-label={tx(`${value} star rating`, `${value} Sterne Bewertung`)}
                  className="rounded-full p-1 text-amber-500 transition hover:bg-amber-50"
                  key={value}
                  onClick={() => setRating(value)}
                  type="button"
                >
                  <Star aria-hidden="true" className={value <= rating ? "h-5 w-5 fill-current" : "h-5 w-5 text-muted-foreground/35"} />
                </button>
              ))}
            </div>
            <textarea
              className="mt-3 min-h-24 w-full resize-none rounded-2xl border border-border bg-card px-3 py-2 text-sm outline-none transition focus:border-primary"
              onChange={(event) => setReviewText(event.target.value)}
              placeholder={tx("What should others know about this district?", "Was sollten andere über diesen Stadtteil wissen?")}
              value={reviewText}
            />
            <button
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-soft disabled:cursor-not-allowed disabled:opacity-45"
              disabled={!reviewText.trim()}
              onClick={submitReview}
              type="button"
            >
              <Send aria-hidden="true" className="h-4 w-4" />
              {tx("Post comment", "Kommentar veröffentlichen")}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-dashed border-border bg-muted/30 p-3 text-[11px] leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground">Datenquellen</p>
          <p className="mt-1">{district.sourceSummary || "Statistikamt Nord 2024, Polizei Hamburg PKS 2024, Miet-Check 2026."}</p>
          {district.missingSources?.length ? (
            <p className="mt-1">Fehlend: {district.missingSources.join(", ")}.</p>
          ) : null}
          <p className="mt-1">
            Datenqualität: <b>{district.dataQuality ?? "demo"}</b>.
          </p>
        </section>
      </div>
    </section>
  );
}
