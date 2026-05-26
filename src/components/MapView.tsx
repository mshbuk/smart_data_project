import { type Layer, type Path, type PathOptions } from "leaflet";
import { useEffect, useMemo, useState } from "react";
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";
import { Circle, CircleMarker, GeoJSON, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import { Layers, MapPinned, Navigation } from "lucide-react";
import districtBoundariesUrl from "../data/districts.geojson?url";
import type { DistrictMatch } from "../types/District";

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

type TopBoundaryCount = 10 | 25 | 50 | "all";

const emptyDistrictBoundaries: DistrictBoundaryCollection = {
  type: "FeatureCollection",
  features: [],
};

const hamburgAltstadtCenter: [number, number] = [53.55062, 9.9955];
const topBoundaryOptions: TopBoundaryCount[] = [10, 25, 50, "all"];

const legendItems = [
  { label: "Top 3", color: "#16a34a" },
  { label: "Shown 80+", color: "#0ea5e9" },
  { label: "Shown 70+", color: "#7c3aed" },
  { label: "Shown lower", color: "#f97316" },
  { label: "Outside top", color: "#cbd5e1" },
];

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

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function getPopupQualityLabel(dataQuality?: string) {
  if (dataQuality === "sourced") return { label: "Sourced", color: "#047857", background: "#ecfdf5" };
  if (dataQuality === "partially-sourced") return { label: "Partial", color: "#b45309", background: "#fffbeb" };
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

function createBoundaryPopup(feature: DistrictBoundaryFeature) {
  const properties = feature.properties ?? {};
  const boundaryName = properties.Stadtteil ?? "District";
  const districtName = properties.districtName ?? boundaryName;
  const hasMatch = typeof properties.matchScore === "number";

  if (!hasMatch) {
    return `
      <div style="min-width:190px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        <div style="font-size:12px;font-weight:800;text-transform:uppercase;color:#64748b;letter-spacing:.04em;">Hamburg boundary</div>
        <strong style="display:block;margin-top:3px;font-size:16px;color:#0f172a;">${escapeHtml(boundaryName)}</strong>
        <div style="margin-top:6px;line-height:1.45;color:#334155;">This district is available in the GeoJSON layer, but does not have demo scoring data yet.</div>
      </div>
    `;
  }

  const score = properties.matchScore ?? 0;
  const rank = properties.rank ? `#${properties.rank}` : "Recommended";
  const statusText = properties.isHighlighted
    ? "Shown in current top set"
    : "Scored, outside the current top set";
  const statusColor = properties.isHighlighted ? "#16a34a" : "#64748b";
  const quality = getPopupQualityLabel(properties.dataQuality);
  const metrics = [
    typeof properties.rentPerSqm === "number" &&
    (properties.sourceSummary?.includes("Miet-Check") || properties.dataQuality === "placeholder")
      ? createPopupMetric(
          "Rent",
          `EUR ${properties.rentPerSqm.toFixed(2)}`,
          properties.sourceSummary?.includes("Miet-Check") ? "per sqm" : "demo / sqm",
        )
      : null,
    typeof properties.population === "number"
      ? createPopupMetric("Residents", formatNumber(properties.population), "2024")
      : null,
    typeof properties.population === "number" && typeof properties.populationDensity === "number"
      ? createPopupMetric("Density", formatNumber(properties.populationDensity), "per km²")
      : null,
    typeof properties.crimeCases2024 === "number"
      ? createPopupMetric("PKS", formatNumber(properties.crimeCases2024), "cases 2024")
      : null,
  ].filter(Boolean).join("");
  const missingSources = properties.missingSources?.length
    ? `<div style="margin-top:8px;border-radius:12px;background:#fffbeb;padding:7px 9px;color:#92400e;font-size:11px;font-weight:800;">Missing: ${escapeHtml(properties.missingSources.join(", "))}</div>`
    : "";

  return `
    <div style="min-width:230px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="font-size:12px;font-weight:800;text-transform:uppercase;color:#4f46e5;letter-spacing:.04em;">${rank} match</div>
      <strong style="display:block;margin-top:3px;font-size:16px;color:#0f172a;">${escapeHtml(districtName)}</strong>
      <div style="margin-top:7px;display:flex;align-items:center;gap:7px;flex-wrap:wrap;">
        <span style="border-radius:999px;background:#ecfdf5;color:#16a34a;padding:5px 9px;font-size:12px;font-weight:900;">${score}% match</span>
        <span style="border-radius:999px;background:${quality.background};color:${quality.color};padding:5px 9px;font-size:12px;font-weight:900;">${quality.label}</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:9px;">${metrics}</div>
      ${missingSources}
      <div style="margin-top:6px;color:${statusColor};font-size:12px;font-weight:800;">${statusText}</div>
    </div>
  `;
}

function attachBoundaryInteractions(feature: DistrictBoundaryFeature, layer: Layer) {
  const pathLayer = layer as Path;

  layer.bindPopup(createBoundaryPopup(feature));
  layer.on({
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

export function MapView({ matches }: MapViewProps) {
  const [topBoundaryCount, setTopBoundaryCount] = useState<TopBoundaryCount>(25);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [locationMessage, setLocationMessage] = useState("");
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
    .join("|");

  const findCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      setLocationMessage("Current location is not available in this browser.");
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
        setLocationMessage("Your location is now shown on the map.");
      },
      () => {
        setLocationStatus("error");
        setLocationMessage("Location permission was not granted, so the map stayed centered on Hamburg.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60_000,
        timeout: 10_000,
      },
    );
  };

  return (
    <section className="overflow-hidden rounded-[1.6rem] border border-white/80 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-start md:p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <MapPinned aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-black text-slate-950">Map view</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Every Hamburg district from the GeoJSON is shown as its own border. The current top matches are highlighted.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">
          <Layers aria-hidden="true" className="h-4 w-4 text-indigo-500" />
          {isLoadingBoundaries
            ? "Loading borders"
            : `${boundaryCollection.features.length} borders / ${highlightedBoundaryCount} highlighted`}
        </div>
      </div>

      <div className="px-3 pb-3 md:px-5 md:pb-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wide text-slate-500">Show top</span>
          {topBoundaryOptions.map((option) => {
            const isActive = topBoundaryCount === option;
            const label = option === "all" ? "All" : String(option);

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

        <div className="relative overflow-hidden rounded-[1.35rem]">
          <MapContainer
            center={hamburgAltstadtCenter}
            className="h-[70vh] max-h-[560px] min-h-[430px] w-full"
            scrollWheelZoom={false}
            zoom={11}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <GeoJSON
              data={boundaryCollection}
              key={boundaryLayerKey}
              onEachFeature={(feature, layer) => attachBoundaryInteractions(feature as DistrictBoundaryFeature, layer)}
              style={(feature) => getBoundaryStyle(feature as DistrictBoundaryFeature)}
            />
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
                  <Popup>Your current location</Popup>
                </CircleMarker>
              </>
            )}
            <FocusUserLocation location={userLocation} />
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
            {locationStatus === "locating" ? "Locating" : "My location"}
          </button>

          {(isLoadingBoundaries || boundaryLoadError) && (
            <div className="absolute inset-x-3 top-3 z-[500] rounded-2xl border border-white/80 bg-white/95 px-3 py-2 text-xs font-black text-slate-600 shadow-lg shadow-slate-950/10">
              {boundaryLoadError ? "District borders could not be loaded." : "Loading Hamburg district borders..."}
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
                key={item.label}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        {!isLoadingBoundaries && !boundaryLoadError && missingDistricts.length > 0 && (
          <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
            Missing GeoJSON borders for {missingDistricts.map((match) => match.district.name).join(", ")}.
          </div>
        )}
      </div>
    </section>
  );
}
