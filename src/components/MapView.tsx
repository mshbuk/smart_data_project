import L, { type Layer, type Path, type PathOptions } from "leaflet";
import { useEffect, useMemo, useState } from "react";
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";
import { Circle, CircleMarker, GeoJSON, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Info, Navigation, Search } from "lucide-react";
import districtBoundariesUrl from "../data/districts.geojson?url";
import mapSpots from "../data/mapSpots.json";
import type { DistrictMatch } from "../types/District";
import type { MapSpot } from "../types/Event";
import { useI18n, type Language } from "../i18n";

type MapViewProps = {
  focusedDistrictId?: string | null;
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
  isFocused?: boolean;
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

const emptyDistrictBoundaries: DistrictBoundaryCollection = {
  type: "FeatureCollection",
  features: [],
};

const hamburgAltstadtCenter: [number, number] = [53.55062, 9.9955];
const databaseMapSpots = mapSpots as MapSpot[];

const legendItems: Array<{ label: LocalizedText; color: string }> = [
  { label: { en: "Top district", de: "Top-Stadtteil" }, color: "#0f172a" },
  { label: { en: "Good match", de: "Gute Passung" }, color: "#64748b" },
  { label: { en: "Selected district", de: "Ausgewählt" }, color: "#111827" },
  { label: { en: "Other districts", de: "Weitere Stadtteile" }, color: "#d1d5db" },
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
  if (isTopMatch) return "#0f172a";
  if (score >= 80) return "#475569";
  if (score >= 70) return "#94a3b8";
  return "#cbd5e1";
}

function getBoundaryStyle(feature?: DistrictBoundaryFeature): PathOptions {
  const hasMatch = typeof feature?.properties?.matchScore === "number";
  const isFocused = Boolean(feature?.properties?.isFocused);

  if (!hasMatch || !feature?.properties?.isHighlighted) {
    return {
      color: "#d1d5db",
      fillColor: "#f8fafc",
      fillOpacity: 0.36,
      opacity: 0.78,
      weight: 0.65,
    };
  }

  const score = feature.properties?.matchScore ?? 0;
  const isTopMatch = Boolean(feature?.properties?.isTopMatch);
  const color = isFocused ? "#111827" : getBoundaryColor(score, isTopMatch);

  return {
    color,
    fillColor: color,
    fillOpacity: isFocused ? 0.34 : isTopMatch ? 0.24 : 0.18,
    opacity: 0.95,
    weight: isFocused ? 2.6 : isTopMatch ? 1.8 : 1.1,
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
    ? properties.isFocused
      ? language === "de"
        ? "Ausgewählter Stadtteil"
        : "Selected district"
      : language === "de"
      ? "In der aktuellen Top-Auswahl sichtbar"
      : "Shown in current top set"
    : language === "de"
      ? "Bewertet, außerhalb der aktuellen Top-Auswahl"
      : "Scored, outside the current top set";
  const statusColor = properties.isFocused ? "#111827" : properties.isHighlighted ? "#475569" : "#64748b";
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
  focusedDistrictId: string | null,
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
    const isFocused = match.district.id === focusedDistrictId;
    const isHighlighted = rank <= highlightedRankLimit || isFocused;

    return {
      ...feature,
      properties: {
        ...feature.properties,
        districtId: match.district.id,
        districtName: match.district.name,
        crimeCases2024: match.district.crimeCases2024,
        dataQuality: match.district.dataQuality,
        isFocused,
        isHighlighted,
        isSaved: savedDistrictIdSet.has(match.district.id),
        isTopMatch: rank <= 3,
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

function FocusSelectedDistrict({ district }: { district: SelectedMapDistrict | null }) {
  const map = useMap();

  useEffect(() => {
    if (!district) return;

    map.setView([district.latitude, district.longitude], Math.max(map.getZoom(), 12), {
      animate: true,
    });
  }, [district, map]);

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

export function MapView({
  focusedDistrictId = null,
  matches,
  onOpenDetails,
  onToggleSave,
  savedDistrictIds,
}: MapViewProps) {
  const { language, tx } = useI18n();
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [locationMessage, setLocationMessage] = useState("");
  const [query, setQuery] = useState("");
  const [selectedMapDistrict, setSelectedMapDistrict] = useState<SelectedMapDistrict | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const { boundaries: rawDistrictBoundaries, hasError: boundaryLoadError } = useDistrictBoundaries();
  const highlightedRankLimit = 3;
  const boundaryCollection = useMemo(
    () => buildBoundaryCollection(rawDistrictBoundaries, matches, highlightedRankLimit, savedDistrictIds, focusedDistrictId),
    [focusedDistrictId, highlightedRankLimit, matches, rawDistrictBoundaries, savedDistrictIds],
  );
  const isLoadingBoundaries = rawDistrictBoundaries.features.length === 0 && !boundaryLoadError;
  const matchedDistrictIds = new Set(
    boundaryCollection.features
      .map((feature) => feature.properties?.districtId)
      .filter((districtId): districtId is string => Boolean(districtId)),
  );
  const missingDistricts = matches.filter((match) => !matchedDistrictIds.has(match.district.id));
  const boundaryLayerKey = boundaryCollection.features
    .map(
      (feature) =>
        `${feature.properties?.districtId}:${feature.properties?.matchScore}:${feature.properties?.isHighlighted}:${feature.properties?.isFocused}:${feature.properties?.Stadtteil}`,
    )
    .join("|")
    .concat(`:${language}:${focusedDistrictId ?? ""}:${savedDistrictIds.join(",")}`);
  const localSpots = useMemo(
    () => (selectedMapDistrict ? buildLocalSpots(selectedMapDistrict, language) : []),
    [language, selectedMapDistrict],
  );
  const filteredMatches = query.trim()
    ? matches.filter((match) => match.district.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8)
    : [];
  useEffect(() => {
    if (!focusedDistrictId) return;

    const focusedMatch = matches.find((match) => match.district.id === focusedDistrictId);
    if (!focusedMatch) return;

    setSelectedMapDistrict({
      latitude: focusedMatch.district.latitude,
      longitude: focusedMatch.district.longitude,
      name: focusedMatch.district.name,
    });
  }, [focusedDistrictId, matches]);

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
    <section className="grid gap-4">
      <p className="text-sm text-muted-foreground">{tx("Your top districts at a glance.", "Deine Top-Stadtteile auf einen Blick.")}</p>

      <div className="relative">
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 shadow-card">
          <Search aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={tx("Search district...", "Stadtteil suchen...")}
            value={query}
          />
        </div>
        {filteredMatches.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-[1000] mt-1 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            {filteredMatches.map((match) => (
              <button
                className="block w-full px-4 py-2 text-left text-sm hover:bg-muted"
                key={match.district.id}
                onClick={() => {
                  setSelectedMapDistrict({
                    latitude: match.district.latitude,
                    longitude: match.district.longitude,
                    name: match.district.name,
                  });
                  setQuery("");
                }}
                type="button"
              >
                {match.district.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
      <div className="p-3 md:p-4">
        <div className="relative overflow-hidden rounded-[1.35rem]">
          <MapContainer
            center={hamburgAltstadtCenter}
            className="h-[420px] w-full"
            scrollWheelZoom={false}
            zoomControl={false}
            zoom={11}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
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
            <FocusSelectedDistrict district={selectedMapDistrict} />
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

        <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {tx(
            "Click a district to see bars, schools, parks and more.",
            "Klicke auf einen Stadtteil, um Bars, Schulen, Parks & mehr zu sehen.",
          )}
        </p>

        <div className="mt-4 space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {tx("Top", "Top")} 3
          </h3>
          {matches.slice(0, 3).map((match, index) => {
            const isSelected =
              selectedMapDistrict &&
              normalizeDistrictName(selectedMapDistrict.name) === normalizeDistrictName(match.district.name);

            return (
              <article
                className={[
                  "grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border p-3 transition",
                  isSelected ? "border-primary bg-primary-soft" : "border-border bg-card",
                ].join(" ")}
                key={match.district.id}
              >
                <button
                  className="flex min-w-0 items-center gap-3 text-left"
                  onClick={() =>
                    setSelectedMapDistrict({
                      latitude: match.district.latitude,
                      longitude: match.district.longitude,
                      name: match.district.name,
                    })
                  }
                  type="button"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{match.district.name}</span>
                    <span className="text-xs font-semibold text-muted-foreground tabular-nums">{match.score}% Match</span>
                  </span>
                </button>
                <button
                  className="rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm"
                  onClick={() => onOpenDetails(match.district.id)}
                  type="button"
                >
                  {tx("Details", "Details")}
                </button>
              </article>
            );
          })}
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-background p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {tx("Legend", "Legende")}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs font-medium text-muted-foreground">
            {legendItems.map((item) => (
              <span className="inline-flex items-center gap-2" key={item.label.en}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {localize(item.label, language)}
              </span>
            ))}
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
