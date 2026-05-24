import L, { type Layer, type PathOptions } from "leaflet";
import { useEffect, useMemo, useState } from "react";
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";
import { Layers, MapPinned, Navigation } from "lucide-react";
import districtBoundariesUrl from "../data/districts.geojson?url";
import type { DistrictMatch } from "../types/District";

type MapViewProps = {
  matches: DistrictMatch[];
};

type BoundaryProperties = {
  Stadtteil?: string;
  districtId?: string;
  districtName?: string;
  isHighlighted?: boolean;
  isTopMatch?: boolean;
  matchScore?: number;
  rank?: number;
  shortDescription?: string;
};

type DistrictBoundaryFeature = Feature<Polygon | MultiPolygon, BoundaryProperties>;
type DistrictBoundaryCollection = FeatureCollection<Polygon | MultiPolygon, BoundaryProperties>;

type BoundaryMatch = {
  match: DistrictMatch;
  rank: number;
};

type TopBoundaryCount = 10 | 25 | 50 | "all";

const emptyDistrictBoundaries: DistrictBoundaryCollection = {
  type: "FeatureCollection",
  features: [],
};

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
      weight: 1,
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
    weight: isTopMatch ? 3 : 2,
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
  const description = properties.shortDescription ?? "No summary available.";
  const statusText = properties.isHighlighted
    ? "Shown in current top set"
    : "Scored, outside the current top set";
  const statusColor = properties.isHighlighted ? "#16a34a" : "#64748b";

  return `
    <div style="min-width:190px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="font-size:12px;font-weight:800;text-transform:uppercase;color:#4f46e5;letter-spacing:.04em;">${rank} match</div>
      <strong style="display:block;margin-top:3px;font-size:16px;color:#0f172a;">${escapeHtml(districtName)}</strong>
      <div style="margin-top:6px;font-weight:800;color:#16a34a;">${score}% match</div>
      <div style="margin-top:6px;line-height:1.45;color:#334155;">${escapeHtml(description)}</div>
      <div style="margin-top:6px;color:${statusColor};font-size:12px;font-weight:800;">${statusText}</div>
    </div>
  `;
}

function attachBoundaryInteractions(feature: DistrictBoundaryFeature, layer: Layer) {
  const pathLayer = layer as L.Path;

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
        weight: isHighlighted ? 4 : 2,
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
        isHighlighted,
        isTopMatch: isHighlighted && rank <= 3,
        matchScore: match.score,
        rank,
        shortDescription: match.district.shortDescription,
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

function FitMapToBoundaries({ data }: { data: DistrictBoundaryCollection }) {
  const map = useMap();

  useEffect(() => {
    if (!data.features.length) return;

    const bounds = L.geoJSON(data).getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        maxZoom: 12,
        padding: [26, 26],
      });
    }
  }, [data, map]);

  return null;
}

export function MapView({ matches }: MapViewProps) {
  const [topBoundaryCount, setTopBoundaryCount] = useState<TopBoundaryCount>(25);
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
            center={[53.5511, 9.9937]}
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
            <FitMapToBoundaries data={boundaryCollection} />
          </MapContainer>

          {(isLoadingBoundaries || boundaryLoadError) && (
            <div className="absolute inset-x-3 top-3 z-[500] rounded-2xl border border-white/80 bg-white/95 px-3 py-2 text-xs font-black text-slate-600 shadow-lg shadow-slate-950/10">
              {boundaryLoadError ? "District borders could not be loaded." : "Loading Hamburg district borders..."}
            </div>
          )}
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
            <Navigation aria-hidden="true" className="h-4 w-4 text-indigo-500" />
            All scored values are local demo data; border geometry comes from the local Hamburg GeoJSON file.
          </div>
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
