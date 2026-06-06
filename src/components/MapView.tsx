import L, { type Layer, type Path, type PathOptions } from "leaflet";
import { useEffect, useMemo, useState } from "react";
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";
import { Circle, CircleMarker, GeoJSON, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Layers, MapPinned, Navigation } from "lucide-react";
import districtBoundariesUrl from "../data/districts.geojson?url";
import mapSpots from "../data/mapSpots.json";
import type { DistrictMatch } from "../types/District";
import type { MapSpot } from "../types/Event";
import { useI18n, type Language } from "../i18n";

type MapViewProps = {
  matches: DistrictMatch[];
  onOpenDetails: (districtId: string) => void;
  onToggleSave: (districtId: string) => void;
  savedDistrictIds: string[];
};

type BoundaryProperties = {
  Stadtteil?: string;
  crimeCases2024?: number;
  dataQuality?: string;
  districtId?: string;
  districtName?: string;
  isHighlighted?: boolean;
  isSaved?: boolean;
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
  emoji?: string;
  icon: string;
  label: string;
  latitude: number;
  longitude: number;
};

type LocalSpotTemplate = {
  description: LocalizedText;
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
const databaseMapSpots = mapSpots as MapSpot[];
const topBoundaryOptions: TopBoundaryCount[] = [10, 25, 50, "all"];

const permanentLandmarks: Landmark[] = [
  {
    description: { en: "Hamburg city hall at Rathausmarkt", de: "Hamburger Rathaus am Rathausmarkt" },
    icon: "rathaus.png",
    label: "Hamburg Rathaus",
    latitude: 53.55009,
    longitude: 9.991636,
  },
  {
    description: { en: "Harbor and cultural landmark", de: "Hafen- und Kulturmarke" },
    icon: "elbphilharmonie.png",
    label: "Elbphilharmonie",
    latitude: 53.541328,
    longitude: 9.984355,
  },
  {
    description: { en: "Hamburg Airport HAM", de: "Flughafen Hamburg HAM" },
    icon: "flughafen.png",
    label: "Flughafen HAM",
    latitude: 53.630402,
    longitude: 9.98823,
  },
  {
    description: { en: "University of Hamburg main campus", de: "Hauptcampus der Universität Hamburg" },
    icon: "university.png",
    label: "Universität Hamburg",
    latitude: 53.5668,
    longitude: 9.9837,
  },
  {
    description: { en: "HAW Hamburg central Berliner Tor campus", de: "Zentraler Campus Berliner Tor der HAW Hamburg" },
    icon: "university.png",
    label: "HAW Hamburg",
    latitude: 53.556278,
    longitude: 10.021972,
  },
  {
    description: { en: "TU Hamburg campus in Harburg", de: "TU Hamburg Campus in Harburg" },
    icon: "university.png",
    label: "TU Hamburg",
    latitude: 53.46097,
    longitude: 9.96993,
  },
  {
    description: { en: "Main rail and HVV interchange", de: "Zentraler Bahn- und HVV-Knoten" },
    icon: "hbf.jpg",
    label: "Hauptbahnhof",
    latitude: 53.552723,
    longitude: 10.006697,
  },
];

const legendItems: Array<{ label: LocalizedText; color: string }> = [
  { label: { en: "Top 3 district matches", de: "Top-3-Stadtteile nach Passung" }, color: "#16a34a" },
  { label: { en: "80%+ profile fit", de: "80%+ Profilpassung" }, color: "#0ea5e9" },
  { label: { en: "70-79% profile fit", de: "70-79% Profilpassung" }, color: "#7c3aed" },
  { label: { en: "Below 70% profile fit", de: "Unter 70% Profilpassung" }, color: "#f97316" },
  { label: { en: "Not in selected top set", de: "Nicht in der gewählten Top-Auswahl" }, color: "#cbd5e1" },
];

const iconLegendItems: Array<{ icon: string; label: LocalizedText }> = [
  { icon: "rathaus.png", label: { en: "Rathaus", de: "Rathaus" } },
  { icon: "elbphilharmonie.png", label: { en: "Elbphilharmonie", de: "Elbphilharmonie" } },
  { icon: "flughafen.png", label: { en: "Airport", de: "Flughafen" } },
  { icon: "hbf.jpg", label: { en: "Main station", de: "Hauptbahnhof" } },
  { icon: "university.png", label: { en: "University", de: "Hochschule" } },
  { icon: "bus-stop.jpeg", label: { en: "Transit stop", de: "ÖPNV-Halt" } },
  { icon: "cafe.png", label: { en: "Cafe", de: "Café" } },
  { icon: "bar.png", label: { en: "Bar", de: "Bar" } },
  { icon: "kita.png", label: { en: "Daycare / playground", de: "Kita / Spielplatz" } },
  { icon: "school.png", label: { en: "School", de: "Schule" } },
  { icon: "library.png", label: { en: "Library / green point", de: "Bibliothek / Grünpunkt" } },
];

const iconEmojiMap: Record<string, string> = {
  "bar.png": "🍻",
  "bus-stop.jpeg": "🚌",
  "cafe.png": "☕",
  "elbphilharmonie.png": "🎼",
  "flughafen.png": "✈️",
  "hbf.jpg": "🚆",
  "kita.png": "🏫",
  "library.png": "🌳",
  "rathaus.png": "🏛️",
  "school.png": "🎓",
  "university.png": "🎓",
};

function getEmojiForIcon(icon: string) {
  return iconEmojiMap[icon] ?? "📍";
}

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
  const districtId = properties.districtId;
  const rank = properties.rank ? `#${properties.rank}` : language === "de" ? "Empfohlen" : "Recommended";
  const statusText = properties.isHighlighted
    ? language === "de"
      ? "In der aktuellen Top-Auswahl sichtbar"
      : "Shown in current top set"
    : language === "de"
      ? "Bewertet, außerhalb der aktuellen Top-Auswahl"
      : "Scored, outside the current top set";
  const statusColor = properties.isHighlighted ? "#16a34a" : "#64748b";
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
          language === "de" ? "Fälle 2024" : "cases 2024",
        )
      : null,
  ].filter(Boolean).join("");
  const missingSources = properties.missingSources?.length
    ? `<div style="margin-top:8px;border-radius:12px;background:#fffbeb;padding:7px 9px;color:#92400e;font-size:11px;font-weight:800;">${language === "de" ? "Fehlt" : "Missing"}: ${escapeHtml(properties.missingSources.join(", "))}</div>`
    : "";
  const actions = districtId
    ? `
      <div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:10px;">
        <button
          class="district-map-save-button"
          type="button"
          style="align-items:center;border:0;border-radius:999px;background:${properties.isSaved ? "#fff1f2" : "#eef2ff"};color:${properties.isSaved ? "#e11d48" : "#0f172a"};cursor:pointer;display:inline-flex;font-size:12px;font-weight:900;gap:5px;padding:7px 10px;"
        >
          ${properties.isSaved ? "♥" : "♡"} ${properties.isSaved ? (language === "de" ? "Gespeichert" : "Saved") : (language === "de" ? "Speichern" : "Save")}
        </button>
        <button
          class="district-map-details-button"
          type="button"
          style="border:0;border-radius:999px;background:#0f172a;color:#fff;cursor:pointer;font-size:12px;font-weight:900;padding:7px 10px;"
        >
          ${language === "de" ? "Mehr Infos" : "More info"}
        </button>
      </div>
    `
    : "";

  return `
    <div style="min-width:230px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="font-size:12px;font-weight:800;text-transform:uppercase;color:#0f172a;letter-spacing:.04em;">${rank} ${language === "de" ? "Treffer" : "match"}</div>
      <strong style="display:block;margin-top:3px;font-size:16px;color:#0f172a;">${escapeHtml(districtName)}</strong>
      <div style="margin-top:7px;display:flex;align-items:center;gap:7px;flex-wrap:wrap;">
        <span style="border-radius:999px;background:#ecfdf5;color:#16a34a;padding:5px 9px;font-size:12px;font-weight:900;">${score}% ${language === "de" ? "Passung" : "match"}</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:9px;">${metrics}</div>
      ${missingSources}
      <div style="margin-top:6px;color:${statusColor};font-size:12px;font-weight:800;">${statusText}</div>
      ${actions}
    </div>
  `;
}

function createEmojiMapIcon(emoji: string, size = 34) {
  return L.divIcon({
    className: "district-finder-map-emoji-icon",
    html: `
      <span style="
        align-items:center;
        background:#fff;
        border:1px solid rgba(15,23,42,.12);
        border-radius:999px;
        box-shadow:0 8px 20px rgba(15,23,42,.22);
        display:flex;
        font-size:${Math.round(size * 0.54)}px;
        height:${size}px;
        justify-content:center;
        width:${size}px;
      ">
        ${emoji}
      </span>
    `,
    iconAnchor: [size / 2, size / 2],
    iconSize: [size, size],
    popupAnchor: [0, -size / 2],
  });
}

function buildSpot(
  label: string,
  icon: string,
  latitude: number,
  longitude: number,
  description: LocalizedText,
): LocalSpotTemplate {
  return { description, icon, label, latitude, longitude };
}

const exactLocalSpotTemplatesByDistrict: Record<string, LocalSpotTemplate[]> = {
  dulsberg: [
    buildSpot("U Straßburger Straße", "bus-stop.jpeg", 53.58275, 10.06769, {
      en: "U-Bahn station in Dulsberg.",
      de: "U-Bahn-Station in Dulsberg.",
    }),
    buildSpot("U Alter Teichweg", "bus-stop.jpeg", 53.58684, 10.06436, {
      en: "U-Bahn station in Dulsberg.",
      de: "U-Bahn-Station in Dulsberg.",
    }),
    buildSpot("S Friedrichsberg", "bus-stop.jpeg", 53.57617, 10.0578, {
      en: "S-Bahn station near Dulsberg.",
      de: "S-Bahn-Station bei Dulsberg.",
    }),
    buildSpot("Straßburger Platz", "bus-stop.jpeg", 53.5811, 10.06184, {
      en: "HVV stop in Dulsberg.",
      de: "HVV-Haltestelle in Dulsberg.",
    }),
    buildSpot("U Straßburger Straße", "bus-stop.jpeg", 53.58177, 10.06777, {
      en: "HVV stop in Dulsberg.",
      de: "HVV-Haltestelle in Dulsberg.",
    }),
    buildSpot("U Alter Teichweg", "bus-stop.jpeg", 53.58724, 10.0641, {
      en: "HVV stop in Dulsberg.",
      de: "HVV-Haltestelle in Dulsberg.",
    }),
    buildSpot("Krausestraße", "bus-stop.jpeg", 53.58, 10.05767, {
      en: "HVV stop in Dulsberg.",
      de: "HVV-Haltestelle in Dulsberg.",
    }),
    buildSpot("Tilsiter Straße", "bus-stop.jpeg", 53.58872, 10.07848, {
      en: "HVV stop in Dulsberg.",
      de: "HVV-Haltestelle in Dulsberg.",
    }),
    buildSpot("Wachtelstraße", "bus-stop.jpeg", 53.58848, 10.05297, {
      en: "HVV stop in Dulsberg.",
      de: "HVV-Haltestelle in Dulsberg.",
    }),
    buildSpot("Lämmersieth (Mitte)", "bus-stop.jpeg", 53.58421, 10.05385, {
      en: "HVV stop in Dulsberg.",
      de: "HVV-Haltestelle in Dulsberg.",
    }),
    buildSpot("Friedrichsberg", "bus-stop.jpeg", 53.57601, 10.05777, {
      en: "HVV stop in Dulsberg.",
      de: "HVV-Haltestelle in Dulsberg.",
    }),
    buildSpot("Olivaer Straße", "bus-stop.jpeg", 53.58303, 10.05621, {
      en: "HVV stop in Dulsberg.",
      de: "HVV-Haltestelle in Dulsberg.",
    }),
    buildSpot("Café Kofje", "cafe.png", 53.57919, 10.06658, {
      en: "Cafe spot in Dulsberg.",
      de: "Café-Spot in Dulsberg.",
    }),
    buildSpot("Cafe MAY", "cafe.png", 53.57776, 10.06274, {
      en: "Cafe spot in Dulsberg.",
      de: "Café-Spot in Dulsberg.",
    }),
    buildSpot("Familiencafé Krümel", "cafe.png", 53.5811, 10.06126, {
      en: "Family cafe in Dulsberg.",
      de: "Familiencafé in Dulsberg.",
    }),
    buildSpot("Dulsbar", "bar.png", 53.58223, 10.06398, {
      en: "Bar in Dulsberg.",
      de: "Bar in Dulsberg.",
    }),
    buildSpot("Cheers", "bar.png", 53.58175, 10.06533, {
      en: "Bar in Dulsberg.",
      de: "Bar in Dulsberg.",
    }),
  ],
  cranz: [
    buildSpot("Kita Este GmbH", "kita.png", 53.52899, 9.77462, {
      en: "Daycare in Cranz.",
      de: "Kita in Cranz.",
    }),
    buildSpot("Grundschule Cranz", "school.png", 53.52969, 9.77385, {
      en: "Primary school in Cranz.",
      de: "Grundschule in Cranz.",
    }),
    buildSpot("Aussichtspunkt Estemündung", "library.png", 53.53648, 9.79061, {
      en: "Nature viewpoint near the Este estuary.",
      de: "Natur-Aussichtspunkt an der Estemündung.",
    }),
    buildSpot("Altes Estesperrwerk", "library.png", 53.53297, 9.77657, {
      en: "Waterside nature and local landmark.",
      de: "Wasserlage und lokaler Naturanker.",
    }),
    buildSpot("Uferweg Cranzer Elbdeich", "library.png", 53.53817, 9.77909, {
      en: "Waterside walking route in Cranz.",
      de: "Uferweg am Cranzer Elbdeich.",
    }),
    buildSpot("Spielplatz Cranzer Elbdeich", "kita.png", 53.53817, 9.77909, {
      en: "Playground at Cranzer Elbdeich.",
      de: "Spielplatz am Cranzer Elbdeich.",
    }),
  ],
  finkenwerder: [
    buildSpot("DRK-Kita Elbhalle", "kita.png", 53.53376, 9.8656, {
      en: "Daycare in Finkenwerder.",
      de: "Kita in Finkenwerder.",
    }),
    buildSpot("Ev. KiTa Finkenwerder", "kita.png", 53.52718, 9.86654, {
      en: "Daycare in Finkenwerder.",
      de: "Kita in Finkenwerder.",
    }),
    buildSpot("Kita Uhlenhoffweg", "kita.png", 53.52939, 9.87768, {
      en: "Daycare in Finkenwerder.",
      de: "Kita in Finkenwerder.",
    }),
    buildSpot("Elbkinder-Kita Jeverländer Weg", "kita.png", 53.5295, 9.88144, {
      en: "Daycare in Finkenwerder.",
      de: "Kita in Finkenwerder.",
    }),
    buildSpot("Airbus-Kita Beluga", "kita.png", 53.5334, 9.84601, {
      en: "Daycare in Finkenwerder.",
      de: "Kita in Finkenwerder.",
    }),
    buildSpot("Kinderstube-Hamburg", "kita.png", 53.53573, 9.87622, {
      en: "Daycare in Finkenwerder.",
      de: "Kita in Finkenwerder.",
    }),
    buildSpot("Westerschule Finkenwerder", "school.png", 53.52779, 9.86288, {
      en: "Primary school in Finkenwerder.",
      de: "Grundschule in Finkenwerder.",
    }),
    buildSpot("Aueschule Finkenwerder", "school.png", 53.5277, 9.88485, {
      en: "Primary school in Finkenwerder.",
      de: "Grundschule in Finkenwerder.",
    }),
    buildSpot("Stadtteilschule Finkenwerder", "school.png", 53.53216, 9.87586, {
      en: "District school in Finkenwerder.",
      de: "Stadtteilschule in Finkenwerder.",
    }),
    buildSpot("Gymnasium Finkenwerder", "school.png", 53.53239, 9.87373, {
      en: "Secondary school in Finkenwerder.",
      de: "Gymnasium in Finkenwerder.",
    }),
    buildSpot("Rüschpark", "library.png", 53.54124, 9.86326, {
      en: "Green space in Finkenwerder.",
      de: "Grünfläche in Finkenwerder.",
    }),
    buildSpot("Gorch-Fock-Park", "library.png", 53.54069, 9.86793, {
      en: "Green space in Finkenwerder.",
      de: "Grünfläche in Finkenwerder.",
    }),
    buildSpot("Naturschutzgebiet Finkenwerder Süderelbe", "library.png", 53.51821, 9.83547, {
      en: "Nature reserve in Finkenwerder.",
      de: "Naturschutzgebiet in Finkenwerder.",
    }),
    buildSpot("Naturschutzgebiet Westerweiden", "library.png", 53.52352, 9.83739, {
      en: "Nature reserve in Finkenwerder.",
      de: "Naturschutzgebiet in Finkenwerder.",
    }),
    buildSpot("Spielplatz im Rüschpark", "kita.png", 53.53599, 9.86029, {
      en: "Playground in Finkenwerder.",
      de: "Spielplatz in Finkenwerder.",
    }),
    buildSpot("Spielplatz Focksweg", "kita.png", 53.53566, 9.87727, {
      en: "Playground in Finkenwerder.",
      de: "Spielplatz in Finkenwerder.",
    }),
    buildSpot("Spielplatz Tweeflunken", "kita.png", 53.53477, 9.86313, {
      en: "Playground in Finkenwerder.",
      de: "Spielplatz in Finkenwerder.",
    }),
    buildSpot("Spielplatz Landscheideweg", "kita.png", 53.52707, 9.87868, {
      en: "Playground in Finkenwerder.",
      de: "Spielplatz in Finkenwerder.",
    }),
  ],
};

function localizeSpot(template: LocalSpotTemplate, language: Language): LocalSpot {
  return {
    description: localize(template.description, language),
    emoji: getEmojiForIcon(template.icon),
    icon: template.icon,
    label: template.label,
    latitude: template.latitude,
    longitude: template.longitude,
  };
}

function buildLocalSpots(district: SelectedMapDistrict, language: Language): LocalSpot[] {
  const districtSuffix = language === "de" ? `in ${district.name}` : `in ${district.name}`;
  const databaseSpots = databaseMapSpots.filter(
    (spot) => normalizeDistrictName(spot.district) === normalizeDistrictName(district.name),
  );
  const exactSpots = exactLocalSpotTemplatesByDistrict[normalizeDistrictName(district.name)];

  if (databaseSpots.length) {
    return databaseSpots.map((spot) => ({
      description: localize(spot.description, language),
      emoji: spot.emoji,
      icon: spot.type,
      label: spot.name,
      latitude: spot.latitude,
      longitude: spot.longitude,
    }));
  }

  if (exactSpots) {
    return exactSpots.map((spot) => localizeSpot(spot, language));
  }

  return [
    {
      description:
        language === "de"
          ? "Illustrativer Café-Spot für den Alltag im gewählten Stadtteil."
          : "Illustrative cafe spot for daily life in the selected district.",
      emoji: "☕",
      icon: "cafe.png",
      label: language === "de" ? `Kiez-Café ${districtSuffix}` : `Neighborhood cafe ${districtSuffix}`,
      latitude: district.latitude + 0.0042,
      longitude: district.longitude - 0.0048,
    },
    {
      description:
        language === "de"
          ? "Zweiter Café-Anker, damit das Viertel nicht wie ein einzelner Punkt wirkt."
          : "Second cafe anchor so the district reads less like a single point.",
      emoji: "☕",
      icon: "cafe.png",
      label: language === "de" ? `Coffee Corner ${districtSuffix}` : `Coffee corner ${districtSuffix}`,
      latitude: district.latitude - 0.0036,
      longitude: district.longitude + 0.0066,
    },
    {
      description:
        language === "de"
          ? "Bar oder Abendtreff für lebendigere Viertel."
          : "Bar or evening hangout for livelier districts.",
      emoji: "🍻",
      icon: "bar.png",
      label: language === "de" ? `Abendtreff ${districtSuffix}` : `Evening spot ${districtSuffix}`,
      latitude: district.latitude + 0.0013,
      longitude: district.longitude + 0.0072,
    },
    {
      description:
        language === "de"
          ? "Bibliotheks- oder Lernort als ruhiger Alltagsanker."
          : "Library or study point as a quieter daily-life anchor.",
      emoji: "🌳",
      icon: "library.png",
      label: language === "de" ? `Bibliothek ${districtSuffix}` : `Library ${districtSuffix}`,
      latitude: district.latitude - 0.0062,
      longitude: district.longitude - 0.0011,
    },
    {
      description:
        language === "de"
          ? "ÖPNV-Haltestelle als Orientierung für Wege ohne Auto."
          : "Transit stop marker for car-free movement.",
      emoji: "🚌",
      icon: "bus-stop.jpeg",
      label: language === "de" ? `ÖPNV-Halt ${districtSuffix}` : `Transit stop ${districtSuffix}`,
      latitude: district.latitude - 0.0045,
      longitude: district.longitude - 0.0038,
    },
    {
      description:
        language === "de"
          ? "Zweiter Mobilitätsanker für bessere Orientierung im Stadtteil."
          : "Second mobility anchor for better district orientation.",
      emoji: "🚌",
      icon: "bus-stop.jpeg",
      label: language === "de" ? `Bus-Halt ${districtSuffix}` : `Bus stop ${districtSuffix}`,
      latitude: district.latitude + 0.0068,
      longitude: district.longitude + 0.0016,
    },
    {
      description:
        language === "de"
          ? "Kita-Spot für Familienorientierung."
          : "Daycare marker for family-oriented scanning.",
      emoji: "🏫",
      icon: "kita.png",
      label: language === "de" ? `Kita ${districtSuffix}` : `Daycare ${districtSuffix}`,
      latitude: district.latitude - 0.0024,
      longitude: district.longitude + 0.0048,
    },
    {
      description:
        language === "de"
          ? "Schul-Spot für Familienorientierung."
          : "School marker for family-oriented scanning.",
      emoji: "🎓",
      icon: "school.png",
      label: language === "de" ? `Schule ${districtSuffix}` : `School ${districtSuffix}`,
      latitude: district.latitude + 0.003,
      longitude: district.longitude - 0.0084,
    },
    {
      description:
        language === "de"
          ? "Uni- oder Hochschulanker als Bildungsorientierung."
          : "University marker as an education anchor.",
      emoji: "🎓",
      icon: "university.png",
      label: language === "de" ? `Hochschule ${districtSuffix}` : `University ${districtSuffix}`,
      latitude: district.latitude + 0.0054,
      longitude: district.longitude + 0.0052,
    },
    {
      description:
        language === "de"
          ? "Grünfläche oder kleiner Park als Aufenthaltsort."
          : "Green area or small park as a local outdoor anchor.",
      emoji: "🌳",
      icon: "library.png",
      label: language === "de" ? `Grünfläche ${districtSuffix}` : `Green space ${districtSuffix}`,
      latitude: district.latitude + 0.0085,
      longitude: district.longitude - 0.0031,
    },
    {
      description:
        language === "de"
          ? "Spielplatz oder ruhiger Aufenthaltsort für Familien."
          : "Playground or calm outdoor point for families.",
      emoji: "🛝",
      icon: "kita.png",
      label: language === "de" ? `Spielplatz ${districtSuffix}` : `Playground ${districtSuffix}`,
      latitude: district.latitude - 0.008,
      longitude: district.longitude + 0.0071,
    },
    {
      description:
        language === "de"
          ? "Bar oder Abendtreff für lebendige Viertel."
          : "Bar or evening hangout for livelier districts.",
      emoji: "🍻",
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
  onOpenDetails: (districtId: string) => void,
  onToggleSave: (districtId: string) => void,
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
    popupopen: () => {
      const districtId = feature.properties?.districtId;
      const popupLayer = layer as Layer & { getPopup?: () => L.Popup | undefined };
      const popupElement = popupLayer.getPopup?.()?.getElement();

      if (!districtId || !popupElement) return;

      popupElement.querySelector(".district-map-save-button")?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggleSave(districtId);
      });
      popupElement.querySelector(".district-map-details-button")?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        onOpenDetails(districtId);
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
  savedDistrictIds: string[],
): DistrictBoundaryCollection {
  const lookup = new Map<string, BoundaryMatch>();
  const savedDistrictIdSet = new Set(savedDistrictIds);

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
        isSaved: savedDistrictIdSet.has(match.district.id),
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

export function MapView({ matches, onOpenDetails, onToggleSave, savedDistrictIds }: MapViewProps) {
  const { language, tx } = useI18n();
  const [topBoundaryCount, setTopBoundaryCount] = useState<TopBoundaryCount>(25);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [locationMessage, setLocationMessage] = useState("");
  const [selectedMapDistrict, setSelectedMapDistrict] = useState<SelectedMapDistrict | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const { boundaries: rawDistrictBoundaries, hasError: boundaryLoadError } = useDistrictBoundaries();
  const highlightedRankLimit = topBoundaryCount === "all" ? Number.POSITIVE_INFINITY : topBoundaryCount;
  const boundaryCollection = useMemo(
    () => buildBoundaryCollection(rawDistrictBoundaries, matches, highlightedRankLimit, savedDistrictIds),
    [highlightedRankLimit, matches, rawDistrictBoundaries, savedDistrictIds],
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
    .concat(`:${language}:${savedDistrictIds.join(",")}`);
  const localSpots = useMemo(
    () => (selectedMapDistrict ? buildLocalSpots(selectedMapDistrict, language) : []),
    [language, selectedMapDistrict],
  );

  const findCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      setLocationMessage(tx("Current location is not available in this browser.", "Dein Standort ist in diesem Browser nicht verfügbar."));
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

  return (
    <section className="grid gap-7">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
        <h2 className="text-2xl font-black text-slate-950">{tx("How the map works", "So funktioniert die Karte")}</h2>
        <div className="mt-6 grid gap-5">
          {[
            [tx("Top districts", "Top Stadtteile"), tx("Based on your priorities", "Basierend auf deinen Prioritäten"), "#10b981"],
            [tx("Explore map", "Karte erkunden"), tx("Discover landmarks and factors", "Sehenswürdigkeiten & Faktoren entdecken"), "#0f172a"],
            [tx("Choose district", "Stadtteil wählen"), tx("Details and ratings at a glance", "Details & Bewertungen im Überblick"), "#0ea5e9"],
            [tx("Find apartments", "Wohnungen finden"), tx("Continue to partner platforms", "Weiter zu Partnerplattformen"), "#334155"],
          ].map(([title, copy, color], index) => (
            <div className="grid grid-cols-[3rem_1fr] gap-4" key={title}>
              <span
                className="grid h-10 w-10 place-items-center rounded-full text-lg font-black text-white"
                style={{ backgroundColor: color }}
              >
                {index + 1}
              </span>
              <span>
                <span className="block text-lg font-black text-slate-950">{title}</span>
                <span className="block text-base font-medium leading-tight text-slate-500">{copy}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
        <h2 className="text-2xl font-black text-slate-950">📍 {tx("Your top districts", "Deine Top Stadtteile")}</h2>
        <div className="mt-6 grid gap-4">
          {matches.slice(0, 3).map((match, index) => (
            <button
              className={[
                "grid min-h-16 grid-cols-[3.5rem_1fr_auto] items-center gap-4 rounded-[1.55rem] border px-5 text-left transition-colors",
                index === 0 ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white hover:bg-slate-50",
              ].join(" ")}
              key={match.district.id}
              onClick={() => onOpenDetails(match.district.id)}
              type="button"
            >
              <span
                className={[
                  "grid h-10 w-10 place-items-center rounded-full text-lg font-black text-white",
                  index === 0 ? "bg-emerald-500" : index === 1 ? "bg-slate-500" : "bg-amber-500",
                ].join(" ")}
              >
                {index + 1}
              </span>
              <span>
                <span className="block text-2xl font-black text-slate-950">{match.district.name}</span>
                <span className="block text-base font-medium text-slate-500">{match.score}% Match</span>
              </span>
              <span className="text-2xl font-black text-slate-950">{match.score}%</span>
            </button>
          ))}
        </div>
      </div>

      <section className="overflow-hidden rounded-[1.6rem] border border-white/80 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-start md:p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15">
            <MapPinned aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-black text-slate-950">{tx("Map view", "Kartenansicht")}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {tx(
                "Every Hamburg district from the GeoJSON is shown as its own border. Permanent landmarks stay visible, and clicking a district opens its match details.",
                "Jeder Hamburger Stadtteil aus dem GeoJSON wird als eigene Fläche gezeigt. Wichtige Orte bleiben sichtbar, und ein Klick auf einen Stadtteil öffnet die Passungsdetails.",
              )}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">
          <Layers aria-hidden="true" className="h-4 w-4 text-slate-500" />
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
                  isActive ? "bg-slate-950 text-white shadow-lg shadow-slate-950/15" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
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
                attachBoundaryInteractions(
                  feature as DistrictBoundaryFeature,
                  layer,
                  language,
                  setSelectedMapDistrict,
                  onOpenDetails,
                  onToggleSave,
                )
              }
              style={(feature) => getBoundaryStyle(feature as DistrictBoundaryFeature)}
            />
            {permanentLandmarks.map((landmark) => (
              <Marker
                icon={createEmojiMapIcon(getEmojiForIcon(landmark.icon), 38)}
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
                icon={createEmojiMapIcon(spot.emoji ?? getEmojiForIcon(spot.icon), 29)}
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
            {userLocation && (
              <>
                {typeof userLocation.accuracy === "number" && (
                  <Circle
                    center={[userLocation.latitude, userLocation.longitude]}
                    pathOptions={{
                      color: "#0f172a",
                      fillColor: "#0f172a",
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
                    fillColor: "#0f172a",
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
            className="absolute bottom-3 left-3 z-[650] inline-flex min-h-12 items-center gap-2 rounded-2xl bg-white/95 px-4 text-sm font-black text-slate-950 shadow-xl shadow-slate-950/20 backdrop-blur transition-colors hover:bg-slate-50 disabled:cursor-wait disabled:opacity-80"
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
                  : "border-slate-200 bg-white/95 text-slate-600",
              ].join(" ")}
            >
              {locationMessage}
            </div>
          )}
        </div>

        <div className="mt-3 grid gap-3">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500">
              {tx("District match colors", "Farben der Stadtteil-Passung")}
            </p>
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
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500">
              {tx("Map icons", "Karten-Icons")}
            </p>
            <div className="flex flex-wrap gap-2">
              {iconLegendItems.map((item) => (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600"
                  key={item.icon}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
                    {getEmojiForIcon(item.icon)}
                  </span>
                  {localize(item.label, language)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {!isLoadingBoundaries && !boundaryLoadError && missingDistricts.length > 0 && (
          <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
            {tx("Missing GeoJSON borders for", "Fehlende GeoJSON-Grenzen für")}{" "}
            {missingDistricts.map((match) => match.district.name).join(", ")}.
          </div>
        )}
      </div>
      </section>
    </section>
  );
}
