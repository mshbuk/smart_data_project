import L, { type Layer, type Path, type PathOptions } from "leaflet";
import { useEffect, useMemo, useState } from "react";
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";
import { Circle, CircleMarker, GeoJSON, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Layers, MapPinned, Navigation } from "lucide-react";
import districtBoundariesUrl from "../data/districts.geojson?url";
import type { DistrictMatch } from "../types/District";
import { useI18n, type Language } from "../i18n";

type MapViewProps = {
  matches: DistrictMatch[];
};

type BoundaryProperties = {
  Stadtteil?: string;
  crimeCases2024?: number;
  dataQuality?: string;
  districtId?: string;
  districtName?: string;
  isHighlighted?: boolean;
  isTopMatch?: boolean;
  latitude?: number;
  longitude?: number;
  missingSources?: string[];
  matchScore?: number;
  population?: number;
  populationDensity?: number;
  rank?: number;
  rentPerSqm?: number;
  shortDescription?: string;
  sourceSummary?: string;
};

type DistrictBoundaryFeature = Feature<Polygon | MultiPolygon, BoundaryProperties>;
type DistrictBoundaryCollection = FeatureCollection<Polygon | MultiPolygon, BoundaryProperties>;

type BoundaryMatch = {
  match: DistrictMatch;
  rank: number;
};

type UserLocation = {
  accuracy?: number;
  latitude: number;
  longitude: number;
};

type LocationStatus = "idle" | "locating" | "found" | "error";

type PoiCategory = "park" | "transit" | "education";

type OrientationPoi = {
  category: PoiCategory;
  description: LocalizedText;
  label: string;
  latitude: number;
  longitude: number;
};

type Landmark = {
  description: LocalizedText;
  icon: string;
  label: string;
  latitude: number;
  longitude: number;
};

type LocalizedText = {
  de: string;
  en: string;
};

type SelectedMapDistrict = {
  latitude: number;
  longitude: number;
  name: string;
};

type LocalSpot = {
  description: string;
  icon: string;
  label: string;
  latitude: number;
  longitude: number;
};

type TopBoundaryCount = 10 | 25 | 50 | "all";

const emptyDistrictBoundaries: DistrictBoundaryCollection = {
  type: "FeatureCollection",
  features: [],
};

const hamburgAltstadtCenter: [number, number] = [53.55062, 9.9955];
const mapIconBaseUrl = `${import.meta.env.BASE_URL}map-icons/`;
const topBoundaryOptions: TopBoundaryCount[] = [10, 25, 50, "all"];

const poiCategories: Array<{ key: PoiCategory; label: LocalizedText; color: string }> = [
  { key: "park", label: { en: "Parks", de: "Parks" }, color: "#16a34a" },
  { key: "transit", label: { en: "HVV", de: "HVV" }, color: "#0891b2" },
  { key: "education", label: { en: "Education / health", de: "Bildung / Gesundheit" }, color: "#d97706" },
];

const permanentLandmarks: Landmark[] = [
  {
    description: { en: "City center orientation point", de: "Orientierungspunkt in der Innenstadt" },
    icon: "rathaus.png",
    label: "Hamburg Rathaus",
    latitude: 53.5503,
    longitude: 9.992,
  },
  {
    description: { en: "Harbor and cultural landmark", de: "Hafen- und Kulturmarke" },
    icon: "elbphilharmonie.png",
    label: "Elbphilharmonie",
    latitude: 53.5413,
    longitude: 9.9841,
  },
  {
    description: { en: "Harbor market orientation point", de: "Orientierungspunkt am Hafenmarkt" },
    icon: "fischmarkt.png",
    label: "Fischmarkt",
    latitude: 53.5468,
    longitude: 9.9505,
  },
  {
    description: { en: "Inner Alster reference point", de: "Referenzpunkt an der Binnenalster" },
    icon: "alster.png",
    label: "Binnenalster",
    latitude: 53.5559,
    longitude: 9.9977,
  },
  {
    description: { en: "Main rail and HVV interchange", de: "Zentraler Bahn- und HVV-Knoten" },
    icon: "hauptbahnhof.png",
    label: "Hauptbahnhof",
    latitude: 53.5528,
    longitude: 10.0067,
  },
  {
    description: { en: "Airport connection point", de: "Flughafen-Anbindung" },
    icon: "flughafen.png",
    label: "Flughafen",
    latitude: 53.6304,
    longitude: 9.9882,
  },
];

const orientationPois: OrientationPoi[] = [
  {
    category: "park",
    description: { en: "Large central city park", de: "Grosser zentraler Stadtpark" },
    label: "Planten un Blomen",
    latitude: 53.5614,
    longitude: 9.9799,
  },
  {
    category: "park",
    description: { en: "Major green-space anchor in Winterhude", de: "Wichtiger Gruenraum in Winterhude" },
    label: "Stadtpark",
    latitude: 53.5968,
    longitude: 10.0199,
  },
  {
    category: "transit",
    description: { en: "Central U-Bahn and S-Bahn interchange", de: "Zentraler U- und S-Bahn-Knoten" },
    label: "Jungfernstieg",
    latitude: 53.5523,
    longitude: 9.9937,
  },
  {
    category: "transit",
    description: { en: "U-Bahn, S-Bahn, bus, and nightlife connection", de: "U-Bahn, S-Bahn, Bus und Nachtleben" },
    label: "Sternschanze",
    latitude: 53.5646,
    longitude: 9.969,
  },
  {
    category: "education",
    description: { en: "University area", de: "Universitaetsbereich" },
    label: "Universitaet Hamburg",
    latitude: 53.5665,
    longitude: 9.9841,
  },
  {
    category: "education",
    description: { en: "Major hospital and health reference point", de: "Wichtiger Klinik- und Gesundheitsanker" },
    label: "UKE",
    latitude: 53.5908,
    longitude: 9.9745,
  },
];

const legendItems: Array<{ label: LocalizedText; color: string }> = [
  { label: { en: "Top 3", de: "Top 3" }, color: "#16a34a" },
  { label: { en: "Shown 80+", de: "Angezeigt 80+" }, color: "#0ea5e9" },
  { label: { en: "Shown 70+", de: "Angezeigt 70+" }, color: "#7c3aed" },
  { label: { en: "Shown lower", de: "Angezeigt niedriger" }, color: "#f97316" },
  { label: { en: "Outside top", de: "Ausserhalb der Top-Auswahl" }, color: "#cbd5e1" },
];

function localize(text: LocalizedText, language: Language) {
  return text[language];
}

function normalizeDistrictName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function getBoundaryColor(score: number, isTopMatch: boolean) {
  if (isTopMatch) return "#16a34a";
  if (score >= 80) return "#0ea5e9";
  if (score >= 70) return "#7c3aed";
  return "#f97316";
}

function getBoundaryStyle(feature?: DistrictBoundaryFeature): PathOptions {
  const hasMatch = typeof feature?.properties?.matchScore === "number";

  if (!hasMatch || !feature?.properties?.isHighlighted) {
    return {
      color: "#cbd5e1",
      fillColor: "#e2e8f0",
      fillOpacity: 0.13,
      opacity: 0.85,
      weight: 0.7,
    };
  }

  const score = feature.properties?.matchScore ?? 0;
  const isTopMatch = Boolean(feature?.properties?.isTopMatch);
  const color = getBoundaryColor(score, isTopMatch);

  return {
    color,
    fillColor: color,
    fillOpacity: isTopMatch ? 0.44 : 0.3,
    opacity: 0.95,
    weight: isTopMatch ? 2 : 1.25,
  };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const replacements: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return replacements[character];
  });
}

function formatNumber(value: number, language: Language) {
  return new Intl.NumberFormat(language === "de" ? "de-DE" : "en-US").format(value);
}

function getPopupQualityLabel(dataQuality: string | undefined, language: Language) {
  if (dataQuality === "sourced") {
    return { label: language === "de" ? "Belegt" : "Sourced", color: "#047857", background: "#ecfdf5" };
  }

  if (dataQuality === "partially-sourced") {
    return { label: language === "de" ? "Teilweise" : "Partial", color: "#b45309", background: "#fffbeb" };
  }

  return { label: "Demo", color: "#475569", background: "#f8fafc" };
}

function createPopupMetric(label: string, value: string, detail: string) {
  return `
    <div style="border:1px solid #e2e8f0;border-radius:14px;padding:8px;background:#f8fafc;">
      <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:#94a3b8;letter-spacing:.04em;">${escapeHtml(label)}</div>
      <div style="margin-top:2px;font-size:14px;font-weight:900;color:#0f172a;">${escapeHtml(value)}</div>
      <div style="margin-top:2px;font-size:11px;font-weight:700;color:#64748b;">${escapeHtml(detail)}</div>
    </div>
  `;
}

function createBoundaryPopup(feature: DistrictBoundaryFeature, language: Language) {
  const properties = feature.properties ?? {};
  const boundaryName = properties.Stadtteil ?? (language === "de" ? "Stadtteil" : "District");
  const districtName = properties.districtName ?? boundaryName;
  const hasMatch = typeof properties.matchScore === "number";

  if (!hasMatch) {
    return `
      <div style="min-width:190px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        <div style="font-size:12px;font-weight:800;text-transform:uppercase;color:#64748b;letter-spacing:.04em;">${language === "de" ? "Hamburger Grenze" : "Hamburg boundary"}</div>
        <strong style="display:block;margin-top:3px;font-size:16px;color:#0f172a;">${escapeHtml(boundaryName)}</strong>
        <div style="margin-top:6px;line-height:1.45;color:#334155;">${language === "de" ? "Dieser Stadtteil ist in der GeoJSON-Ebene vorhanden, hat aber noch keine Demo-Bewertung." : "This district is available in the GeoJSON layer, but does not have demo scoring data yet."}</div>
      </div>
    `;
  }

  const score = properties.matchScore ?? 0;
  const rank = properties.rank ? `#${properties.rank}` : language === "de" ? "Empfohlen" : "Recommended";
  const statusText = properties.isHighlighted
    ? language === "de"
      ? "In der aktuellen Top-Auswahl sichtbar"
      : "Shown in current top set"
    : language === "de"
      ? "Bewertet, ausserhalb der aktuellen Top-Auswahl"
      : "Scored, outside the current top set";
  const statusColor = properties.isHighlighted ? "#16a34a" : "#64748b";
  const quality = getPopupQualityLabel(properties.dataQuality, language);
  const metrics = [
    typeof properties.rentPerSqm === "number" &&
    (properties.sourceSummary?.includes("Miet-Check") || properties.dataQuality === "placeholder")
      ? createPopupMetric(
          language === "de" ? "Miete" : "Rent",
          `EUR ${properties.rentPerSqm.toFixed(2)}`,
          properties.sourceSummary?.includes("Miet-Check")
            ? language === "de"
              ? "pro qm"
              : "per sqm"
            : language === "de"
              ? "Demo / qm"
              : "demo / sqm",
        )
      : null,
    typeof properties.population === "number"
      ? createPopupMetric(
          language === "de" ? "Einwohner" : "Residents",
          formatNumber(properties.population, language),
          "2024",
        )
      : null,
    typeof properties.population === "number" && typeof properties.populationDensity === "number"
      ? createPopupMetric(
          language === "de" ? "Dichte" : "Density",
          formatNumber(properties.populationDensity, language),
          language === "de" ? "pro km²" : "per km²",
        )
      : null,
    typeof properties.crimeCases2024 === "number"
      ? createPopupMetric(
          "PKS",
          formatNumber(properties.crimeCases2024, language),
          language === "de" ? "Faelle 2024" : "cases 2024",
        )
      : null,
  ].filter(Boolean).join("");
  const missingSources = properties.missingSources?.length
    ? `<div style="margin-top:8px;border-radius:12px;background:#fffbeb;padding:7px 9px;color:#92400e;font-size:11px;font-weight:800;">${language === "de" ? "Fehlt" : "Missing"}: ${escapeHtml(properties.missingSources.join(", "))}</div>`
    : "";

  return `
    <div style="min-width:230px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="font-size:12px;font-weight:800;text-transform:uppercase;color:#4f46e5;letter-spacing:.04em;">${rank} ${language === "de" ? "Treffer" : "match"}</div>
      <strong style="display:block;margin-top:3px;font-size:16px;color:#0f172a;">${escapeHtml(districtName)}</strong>
      <div style="margin-top:7px;display:flex;align-items:center;gap:7px;flex-wrap:wrap;">
        <span style="border-radius:999px;background:#ecfdf5;color:#16a34a;padding:5px 9px;font-size:12px;font-weight:900;">${score}% ${language === "de" ? "Passung" : "match"}</span>
        <span style="border-radius:999px;background:${quality.background};color:${quality.color};padding:5px 9px;font-size:12px;font-weight:900;">${quality.label}</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:9px;">${metrics}</div>
      ${missingSources}
      <div style="margin-top:6px;color:${statusColor};font-size:12px;font-weight:800;">${statusText}</div>
    </div>
  `;
}

function createPngMapIcon(icon: string, size = 34) {
  const height = Math.round(size * 1.2);

  return L.icon({
    className: "district-finder-png-map-icon",
    iconAnchor: [size / 2, height - 4],
    iconSize: [size, height],
    iconUrl: `${mapIconBaseUrl}${icon}`,
    popupAnchor: [0, -height + 12],
  });
}

function buildLocalSpots(district: SelectedMapDistrict, language: Language): LocalSpot[] {
  const districtSuffix = language === "de" ? `in ${district.name}` : `in ${district.name}`;

  return [
    {
      description:
        language === "de"
          ? "Illustrativer Cafe-Spot fuer den Alltag im gewaehlten Stadtteil."
          : "Illustrative cafe spot for daily life in the selected district.",
      icon: "cafe.png",
      label: language === "de" ? `Kiez-Cafe ${districtSuffix}` : `Neighborhood cafe ${districtSuffix}`,
      latitude: district.latitude + 0.0042,
      longitude: district.longitude - 0.0048,
    },
    {
      description:
        language === "de"
          ? "Zweiter Cafe-Anker, damit das Viertel nicht wie ein einzelner Punkt wirkt."
          : "Second cafe anchor so the district reads less like a single point.",
      icon: "cafe.png",
      label: language === "de" ? `Coffee Corner ${districtSuffix}` : `Coffee corner ${districtSuffix}`,
      latitude: district.latitude - 0.0036,
      longitude: district.longitude + 0.0066,
    },
    {
      description:
        language === "de"
          ? "Essens- und Abendspot als Orientierung fuer lokale Gastronomie."
          : "Food and evening spot for a sense of local restaurants.",
      icon: "restaurant.png",
      label: language === "de" ? `Restaurantmeile ${districtSuffix}` : `Restaurant row ${districtSuffix}`,
      latitude: district.latitude + 0.0013,
      longitude: district.longitude + 0.0072,
    },
    {
      description:
        language === "de"
          ? "Kleiner Mittagstisch-Spot fuer den Alltag unter der Woche."
          : "Small lunch spot for weekday daily life.",
      icon: "restaurant.png",
      label: language === "de" ? `Mittagstisch ${districtSuffix}` : `Lunch spot ${districtSuffix}`,
      latitude: district.latitude - 0.0062,
      longitude: district.longitude - 0.0011,
    },
    {
      description:
        language === "de"
          ? "U-Bahn-nahe Orientierung fuer Wege ohne Auto."
          : "U-Bahn-oriented marker for car-free movement.",
      icon: "ubahn.png",
      label: language === "de" ? `U-Bahn-Zugang ${districtSuffix}` : `U-Bahn access ${districtSuffix}`,
      latitude: district.latitude - 0.0045,
      longitude: district.longitude - 0.0038,
    },
    {
      description:
        language === "de"
          ? "Zweiter Schnellbahn-Anker fuer bessere Orientierung im Stadtteil."
          : "Second rapid-transit anchor for better district orientation.",
      icon: "ubahn.png",
      label: language === "de" ? `U-Bahn-Knoten ${districtSuffix}` : `U-Bahn node ${districtSuffix}`,
      latitude: district.latitude + 0.0068,
      longitude: district.longitude + 0.0016,
    },
    {
      description:
        language === "de"
          ? "S-Bahn-Anschluss fuer schnelle Wege in andere Teile Hamburgs."
          : "S-Bahn connection for faster movement across Hamburg.",
      icon: "sbahn.png",
      label: language === "de" ? `S-Bahn-Station ${districtSuffix}` : `S-Bahn station ${districtSuffix}`,
      latitude: district.latitude - 0.0024,
      longitude: district.longitude + 0.0048,
    },
    {
      description:
        language === "de"
          ? "Zusaetzlicher S-Bahn-/Regionalbahn-Anker fuer realistischere Mobilitaet."
          : "Additional rail anchor for a more realistic mobility layer.",
      icon: "sbahn.png",
      label: language === "de" ? `Bahn-Anschluss ${districtSuffix}` : `Rail connection ${districtSuffix}`,
      latitude: district.latitude + 0.003,
      longitude: district.longitude - 0.0084,
    },
    {
      description:
        language === "de"
          ? "Supermarkt-Spot fuer taegliche Erledigungen."
          : "Grocery marker for everyday errands.",
      icon: "grocery.png",
      label: language === "de" ? `Supermarkt ${districtSuffix}` : `Grocery ${districtSuffix}`,
      latitude: district.latitude + 0.0054,
      longitude: district.longitude + 0.0052,
    },
    {
      description:
        language === "de"
          ? "Kleiner Nahversorger als zweiter Alltagsanker."
          : "Small local shop as a second daily-services anchor.",
      icon: "grocery.png",
      label: language === "de" ? `Nahversorger ${districtSuffix}` : `Local grocery ${districtSuffix}`,
      latitude: district.latitude - 0.0053,
      longitude: district.longitude + 0.0032,
    },
    {
      description:
        language === "de"
          ? "Apotheken-Spot fuer Gesundheits- und Alltagsversorgung."
          : "Pharmacy spot for health and everyday needs.",
      icon: "pharmacy.png",
      label: language === "de" ? `Apotheke ${districtSuffix}` : `Pharmacy ${districtSuffix}`,
      latitude: district.latitude + 0.001,
      longitude: district.longitude - 0.0067,
    },
    {
      description:
        language === "de"
          ? "Arztpraxis-Spot fuer eine greifbarere Gesundheitsinfrastruktur."
          : "Doctor marker for a more tangible health-infrastructure view.",
      icon: "doctor.png",
      label: language === "de" ? `Arztpraxis ${districtSuffix}` : `Doctor office ${districtSuffix}`,
      latitude: district.latitude - 0.0071,
      longitude: district.longitude - 0.0049,
    },
    {
      description:
        language === "de"
          ? "Gruenflaeche oder kleiner Park als Aufenthaltsort."
          : "Green area or small park as a local outdoor anchor.",
      icon: "park.png",
      label: language === "de" ? `Gruenflaeche ${districtSuffix}` : `Green space ${districtSuffix}`,
      latitude: district.latitude + 0.0085,
      longitude: district.longitude - 0.0031,
    },
    {
      description:
        language === "de"
          ? "Spielplatz oder ruhiger Aufenthaltsort fuer Familien."
          : "Playground or calm outdoor point for families.",
      icon: "park.png",
      label: language === "de" ? `Spielplatz ${districtSuffix}` : `Playground ${districtSuffix}`,
      latitude: district.latitude - 0.008,
      longitude: district.longitude + 0.0071,
    },
    {
      description:
        language === "de"
          ? "Schul- oder Kita-Spot fuer Familienorientierung."
          : "School or daycare marker for family-oriented scanning.",
      icon: "school.png",
      label: language === "de" ? `Schule / Kita ${districtSuffix}` : `School / daycare ${districtSuffix}`,
      latitude: district.latitude + 0.006,
      longitude: district.longitude + 0.009,
    },
    {
      description:
        language === "de"
          ? "Sport- und Fitnessangebot als Freizeitanker."
          : "Sports and fitness option as a leisure anchor.",
      icon: "fitness.png",
      label: language === "de" ? `Fitness ${districtSuffix}` : `Fitness ${districtSuffix}`,
      latitude: district.latitude - 0.0018,
      longitude: district.longitude - 0.0102,
    },
    {
      description:
        language === "de"
          ? "Kultur- oder Veranstaltungsort fuer den Stadtteilcharakter."
          : "Culture or event marker for the district character.",
      icon: "culture.png",
      label: language === "de" ? `Kulturspot ${districtSuffix}` : `Culture spot ${districtSuffix}`,
      latitude: district.latitude + 0.0096,
      longitude: district.longitude + 0.0068,
    },
    {
      description:
        language === "de"
          ? "Bar oder Abendtreff fuer lebendige Viertel."
          : "Bar or evening hangout for livelier districts.",
      icon: "bar.png",
      label: language === "de" ? `Abendtreff ${districtSuffix}` : `Evening spot ${districtSuffix}`,
      latitude: district.latitude - 0.0092,
      longitude: district.longitude - 0.0087,
    },
  ];
}

function attachBoundaryInteractions(
  feature: DistrictBoundaryFeature,
  layer: Layer,
  language: Language,
  onSelectDistrict: (district: SelectedMapDistrict) => void,
) {
  const pathLayer = layer as Path;

  layer.bindPopup(createBoundaryPopup(feature, language));
  layer.on({
    click: () => {
      const latitude = feature.properties?.latitude;
      const longitude = feature.properties?.longitude;

      if (typeof latitude !== "number" || typeof longitude !== "number") return;

      onSelectDistrict({
        latitude,
        longitude,
        name: feature.properties?.districtName ?? feature.properties?.Stadtteil ?? "Hamburg",
      });
    },
    mouseout: () => {
      pathLayer.setStyle(getBoundaryStyle(feature));
    },
    mouseover: () => {
      const hasMatch = typeof feature.properties?.matchScore === "number";
      const isHighlighted = Boolean(feature.properties?.isHighlighted);

      pathLayer.setStyle({
        ...getBoundaryStyle(feature),
        fillOpacity: isHighlighted ? 0.54 : hasMatch ? 0.24 : 0.2,
        weight: isHighlighted ? 2.6 : 1.5,
      });
      pathLayer.bringToFront();
    },
  });
}

function buildBoundaryCollection(
  rawDistrictBoundaries: DistrictBoundaryCollection,
  matches: DistrictMatch[],
  highlightedRankLimit: number,
): DistrictBoundaryCollection {
  const lookup = new Map<string, BoundaryMatch>();

  matches.forEach((match, index) => {
    lookup.set(normalizeDistrictName(match.district.name), {
      match,
      rank: index + 1,
    });
  });

  const features = rawDistrictBoundaries.features.map((feature) => {
    const boundaryName = feature.properties?.Stadtteil;
    if (!boundaryName) return feature;

    const boundaryMatch = lookup.get(normalizeDistrictName(boundaryName));
    if (!boundaryMatch) {
      return {
        ...feature,
        properties: {
          ...feature.properties,
          districtName: boundaryName,
        },
      };
    }

    const { match, rank } = boundaryMatch;
    const isHighlighted = rank <= highlightedRankLimit;

    return {
      ...feature,
      properties: {
        ...feature.properties,
        districtId: match.district.id,
        districtName: match.district.name,
        crimeCases2024: match.district.crimeCases2024,
        dataQuality: match.district.dataQuality,
        isHighlighted,
        isTopMatch: isHighlighted && rank <= 3,
        latitude: match.district.latitude,
        longitude: match.district.longitude,
        missingSources: match.district.missingSources,
        matchScore: match.score,
        population: match.district.population,
        populationDensity: match.district.populationDensity,
        rank,
        rentPerSqm: match.district.rentPerSqm,
        shortDescription: match.district.shortDescription,
        sourceSummary: match.district.sourceSummary,
      },
    };
  });

  return {
    type: "FeatureCollection",
    features,
  };
}

function useDistrictBoundaries() {
  const [boundaries, setBoundaries] = useState<DistrictBoundaryCollection>(emptyDistrictBoundaries);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    async function loadBoundaries() {
      try {
        const response = await fetch(districtBoundariesUrl);
        if (!response.ok) throw new Error("GeoJSON request failed");

        const data = (await response.json()) as DistrictBoundaryCollection;
        if (isCurrent) {
          setBoundaries(data);
          setHasError(false);
        }
      } catch {
        if (isCurrent) setHasError(true);
      }
    }

    loadBoundaries();

    return () => {
      isCurrent = false;
    };
  }, []);

  return { boundaries, hasError };
}

function FocusUserLocation({ location }: { location: UserLocation | null }) {
  const map = useMap();

  useEffect(() => {
    if (!location) return;

    map.setView([location.latitude, location.longitude], Math.max(map.getZoom(), 13), {
      animate: true,
    });
  }, [location, map]);

  return null;
}

function CloseMapPopupsOnLanguageChange({ language }: { language: Language }) {
  const map = useMap();

  useEffect(() => {
    map.closePopup();
  }, [language, map]);

  return null;
}

function TranslatedZoomControl({ language }: { language: Language }) {
  const map = useMap();

  useEffect(() => {
    const zoomControl = L.control.zoom({
      zoomInTitle: language === "de" ? "Hineinzoomen" : "Zoom in",
      zoomOutTitle: language === "de" ? "Herauszoomen" : "Zoom out",
    });

    zoomControl.addTo(map);

    return () => {
      zoomControl.remove();
    };
  }, [language, map]);

  return null;
}

export function MapView({ matches }: MapViewProps) {
  const { language, tx } = useI18n();
  const [topBoundaryCount, setTopBoundaryCount] = useState<TopBoundaryCount>(25);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [locationMessage, setLocationMessage] = useState("");
  const [visiblePoiCategories, setVisiblePoiCategories] = useState<Set<PoiCategory>>(
    () => new Set<PoiCategory>(["park", "transit"]),
  );
  const [selectedMapDistrict, setSelectedMapDistrict] = useState<SelectedMapDistrict | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const { boundaries: rawDistrictBoundaries, hasError: boundaryLoadError } = useDistrictBoundaries();
  const highlightedRankLimit = topBoundaryCount === "all" ? Number.POSITIVE_INFINITY : topBoundaryCount;
  const boundaryCollection = useMemo(
    () => buildBoundaryCollection(rawDistrictBoundaries, matches, highlightedRankLimit),
    [highlightedRankLimit, matches, rawDistrictBoundaries],
  );
  const isLoadingBoundaries = rawDistrictBoundaries.features.length === 0 && !boundaryLoadError;
  const matchedDistrictIds = new Set(
    boundaryCollection.features
      .map((feature) => feature.properties?.districtId)
      .filter((districtId): districtId is string => Boolean(districtId)),
  );
  const highlightedBoundaryCount = boundaryCollection.features.filter(
    (feature) => feature.properties?.isHighlighted,
  ).length;
  const missingDistricts = matches.filter((match) => !matchedDistrictIds.has(match.district.id));
  const boundaryLayerKey = boundaryCollection.features
    .map(
      (feature) =>
        `${feature.properties?.districtId}:${feature.properties?.matchScore}:${feature.properties?.isHighlighted}:${feature.properties?.Stadtteil}`,
    )
    .join("|")
    .concat(`:${language}`);
  const localSpots = useMemo(
    () => (selectedMapDistrict ? buildLocalSpots(selectedMapDistrict, language) : []),
    [language, selectedMapDistrict],
  );

  const findCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      setLocationMessage(tx("Current location is not available in this browser.", "Dein Standort ist in diesem Browser nicht verfuegbar."));
      return;
    }

    setLocationStatus("locating");
    setLocationMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          accuracy: position.coords.accuracy,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationStatus("found");
        setLocationMessage(tx("Your location is now shown on the map.", "Dein Standort wird jetzt auf der Karte angezeigt."));
      },
      () => {
        setLocationStatus("error");
        setLocationMessage(
          tx(
            "Location permission was not granted, so the map stayed centered on Hamburg.",
            "Die Standortfreigabe wurde nicht erteilt, deshalb bleibt die Karte auf Hamburg zentriert.",
          ),
        );
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60_000,
        timeout: 10_000,
      },
    );
  };

  const togglePoiCategory = (category: PoiCategory) => {
    setVisiblePoiCategories((currentCategories) => {
      const nextCategories = new Set(currentCategories);

      if (nextCategories.has(category)) {
        nextCategories.delete(category);
      } else {
        nextCategories.add(category);
      }

      return nextCategories;
    });
  };

  return (
    <section className="overflow-hidden rounded-[1.6rem] border border-white/80 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-start md:p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <MapPinned aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-black text-slate-950">{tx("Map view", "Kartenansicht")}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {tx(
                "Every Hamburg district from the GeoJSON is shown as its own border. Permanent landmarks stay visible, and clicking a district reveals useful local spots.",
                "Jeder Hamburger Stadtteil aus dem GeoJSON wird als eigene Flaeche gezeigt. Wichtige Orte bleiben sichtbar, und ein Klick auf einen Stadtteil zeigt nuetzliche Spots.",
              )}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">
          <Layers aria-hidden="true" className="h-4 w-4 text-indigo-500" />
          {isLoadingBoundaries
            ? tx("Loading borders", "Grenzen laden")
            : tx(
                `${boundaryCollection.features.length} borders / ${highlightedBoundaryCount} highlighted`,
                `${boundaryCollection.features.length} Grenzen / ${highlightedBoundaryCount} hervorgehoben`,
              )}
        </div>
      </div>

      <div className="px-3 pb-3 md:px-5 md:pb-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wide text-slate-500">{tx("Show top", "Top anzeigen")}</span>
          {topBoundaryOptions.map((option) => {
            const isActive = topBoundaryCount === option;
            const label = option === "all" ? tx("All", "Alle") : String(option);

            return (
              <button
                aria-pressed={isActive}
                className={[
                  "min-h-10 rounded-2xl px-4 text-sm font-black transition-colors",
                  isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                ].join(" ")}
                key={option}
                onClick={() => setTopBoundaryCount(option)}
                type="button"
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wide text-slate-500">{tx("Optional orientation", "Optionale Orientierung")}</span>
          {poiCategories.map((category) => {
            const isActive = visiblePoiCategories.has(category.key);

            return (
              <button
                aria-pressed={isActive}
                className={[
                  "inline-flex min-h-9 items-center gap-2 rounded-2xl px-3 text-xs font-black transition-colors",
                  isActive ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                ].join(" ")}
                key={category.key}
                onClick={() => togglePoiCategory(category.key)}
                type="button"
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: category.color }} />
                {localize(category.label, language)}
              </button>
            );
          })}
        </div>

        <div className="relative overflow-hidden rounded-[1.35rem]">
          <MapContainer
            center={hamburgAltstadtCenter}
            className="h-[70vh] max-h-[560px] min-h-[430px] w-full"
            scrollWheelZoom={false}
            zoomControl={false}
            zoom={11}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <GeoJSON
              data={boundaryCollection}
              key={boundaryLayerKey}
              onEachFeature={(feature, layer) =>
                attachBoundaryInteractions(feature as DistrictBoundaryFeature, layer, language, setSelectedMapDistrict)
              }
              style={(feature) => getBoundaryStyle(feature as DistrictBoundaryFeature)}
            />
            {permanentLandmarks.map((landmark) => (
              <Marker
                icon={createPngMapIcon(landmark.icon, 38)}
                key={landmark.label}
                position={[landmark.latitude, landmark.longitude]}
                title={landmark.label}
              >
                <Popup>
                  <strong>{landmark.label}</strong>
                  <br />
                  {localize(landmark.description, language)}
                </Popup>
              </Marker>
            ))}
            {localSpots.map((spot) => (
              <Marker
                icon={createPngMapIcon(spot.icon, 29)}
                key={`${selectedMapDistrict?.name}-${spot.label}`}
                position={[spot.latitude, spot.longitude]}
                title={spot.label}
              >
                <Popup>
                  <strong>{spot.label}</strong>
                  <br />
                  {spot.description}
                </Popup>
              </Marker>
            ))}
            {orientationPois
              .filter((poi) => visiblePoiCategories.has(poi.category))
              .map((poi) => {
                const category = poiCategories.find((item) => item.key === poi.category);
                const color = category?.color ?? "#4f46e5";

                return (
                  <CircleMarker
                    center={[poi.latitude, poi.longitude]}
                    key={poi.label}
                    pathOptions={{
                      color: "#ffffff",
                      fillColor: color,
                      fillOpacity: 0.95,
                      opacity: 1,
                      weight: 2,
                    }}
                    radius={7}
                  >
                    <Popup>
                      <strong>{poi.label}</strong>
                      <br />
                      {localize(poi.description, language)}
                    </Popup>
                  </CircleMarker>
                );
              })}
            {userLocation && (
              <>
                {typeof userLocation.accuracy === "number" && (
                  <Circle
                    center={[userLocation.latitude, userLocation.longitude]}
                    pathOptions={{
                      color: "#4f46e5",
                      fillColor: "#4f46e5",
                      fillOpacity: 0.08,
                      opacity: 0.25,
                      weight: 1,
                    }}
                    radius={userLocation.accuracy}
                  />
                )}
                <CircleMarker
                  center={[userLocation.latitude, userLocation.longitude]}
                  pathOptions={{
                    color: "#ffffff",
                    fillColor: "#4f46e5",
                    fillOpacity: 1,
                    opacity: 1,
                    weight: 3,
                  }}
                  radius={8}
                >
                  <Popup>{tx("Your current location", "Dein aktueller Standort")}</Popup>
                </CircleMarker>
              </>
            )}
            <FocusUserLocation location={userLocation} />
            <CloseMapPopupsOnLanguageChange language={language} />
            <TranslatedZoomControl language={language} />
          </MapContainer>

          <button
            className="absolute bottom-3 left-3 z-[650] inline-flex min-h-12 items-center gap-2 rounded-2xl bg-white/95 px-4 text-sm font-black text-indigo-600 shadow-xl shadow-slate-950/20 backdrop-blur transition-colors hover:bg-indigo-50 disabled:cursor-wait disabled:opacity-80"
            disabled={locationStatus === "locating"}
            onClick={findCurrentLocation}
            type="button"
          >
            <Navigation
              aria-hidden="true"
              className={["h-5 w-5", locationStatus === "locating" ? "animate-pulse" : ""].join(" ")}
              strokeWidth={2.5}
            />
            {locationStatus === "locating" ? tx("Locating", "Suchen") : tx("My location", "Mein Standort")}
          </button>

          {selectedMapDistrict && (
            <div className="absolute right-3 top-3 z-[650] max-w-[260px] rounded-2xl border border-white/80 bg-white/95 p-3 text-xs shadow-xl shadow-slate-950/15 backdrop-blur">
              <div className="font-black uppercase tracking-wide text-indigo-600">
                {tx("Local spots", "Lokale Spots")}
              </div>
              <div className="mt-1 font-black text-slate-950">{selectedMapDistrict.name}</div>
              <div className="mt-1 leading-5 text-slate-600">
                {tx(
                  "Illustrative cafes, restaurants, U-Bahn, S-Bahn, daily services, parks, health, and leisure spots are shown for the selected district.",
                  "Illustrative Cafes, Restaurants, U-Bahn, S-Bahn, Nahversorgung, Parks, Gesundheit und Freizeitorte werden fuer den gewaehlten Stadtteil gezeigt.",
                )}
              </div>
              <button
                className="mt-2 rounded-full bg-slate-100 px-3 py-1.5 font-black text-slate-700 transition-colors hover:bg-slate-200"
                onClick={() => setSelectedMapDistrict(null)}
                type="button"
              >
                {tx("Clear", "Ausblenden")}
              </button>
            </div>
          )}

          {(isLoadingBoundaries || boundaryLoadError) && (
            <div className="absolute inset-x-3 top-3 z-[500] rounded-2xl border border-white/80 bg-white/95 px-3 py-2 text-xs font-black text-slate-600 shadow-lg shadow-slate-950/10">
              {boundaryLoadError
                ? tx("District borders could not be loaded.", "Stadtteilgrenzen konnten nicht geladen werden.")
                : tx("Loading Hamburg district borders...", "Hamburger Stadtteilgrenzen werden geladen...")}
            </div>
          )}

          {locationMessage && (
            <div
              className={[
                "absolute inset-x-3 bottom-[4.75rem] z-[650] rounded-2xl border px-3 py-2 text-xs font-black shadow-lg shadow-slate-950/10 md:left-3 md:right-auto md:max-w-[320px]",
                locationStatus === "error"
                  ? "border-amber-200 bg-amber-50/95 text-amber-800"
                  : "border-indigo-100 bg-white/95 text-slate-600",
              ].join(" ")}
            >
              {locationMessage}
            </div>
          )}
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex flex-wrap gap-2">
            {legendItems.map((item) => (
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600"
                key={item.label.en}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {localize(item.label, language)}
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-black text-indigo-700">
              <img alt="" className="h-6 w-5 object-contain" src={`${mapIconBaseUrl}hauptbahnhof.png`} />
              {tx("Permanent Hamburg landmarks", "Feste Hamburg-Orte")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">
              <img alt="" className="h-6 w-5 object-contain" src={`${mapIconBaseUrl}cafe.png`} />
              {tx("District click spots", "Spots nach Stadtteil-Klick")}
            </span>
          </div>
        </div>

        {!isLoadingBoundaries && !boundaryLoadError && missingDistricts.length > 0 && (
          <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
            {tx("Missing GeoJSON borders for", "Fehlende GeoJSON-Grenzen fuer")}{" "}
            {missingDistricts.map((match) => match.district.name).join(", ")}.
          </div>
        )}
      </div>
    </section>
  );
}
