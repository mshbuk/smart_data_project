import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { MapPinned, Navigation } from "lucide-react";
import type { DistrictMatch } from "../types/District";

type MapViewProps = {
  matches: DistrictMatch[];
};

function getMarkerColor(score: number, isHighlighted: boolean) {
  if (isHighlighted) return "#16a34a";
  if (score >= 80) return "#0ea5e9";
  if (score >= 70) return "#7c3aed";
  return "#f97316";
}

function createScoreIcon(score: number, isHighlighted: boolean) {
  const size = isHighlighted ? 54 : 44;
  const color = getMarkerColor(score, isHighlighted);

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:${size}px;
        height:${size}px;
        border-radius:9999px;
        background:${color};
        border:4px solid white;
        box-shadow:0 18px 30px rgba(15,23,42,0.22);
        color:white;
        display:grid;
        place-items:center;
        font:800 ${isHighlighted ? 17 : 15}px/1 system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      ">${score}</div>
    `,
    iconAnchor: [size / 2, size / 2],
    iconSize: [size, size],
  });
}

export function MapView({ matches }: MapViewProps) {
  const topDistrictIds = matches.slice(0, 3).map((match) => match.district.id);

  return (
    <section className="overflow-hidden rounded-[1.6rem] border border-white/80 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="flex items-start gap-3 p-4 md:p-5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
          <MapPinned aria-hidden="true" className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-black text-slate-950">Map view</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Top recommendations are shown with larger green score markers.
          </p>
        </div>
      </div>

      <div className="px-3 pb-3 md:px-5 md:pb-5">
        <MapContainer
          center={[53.5511, 9.9937]}
          className="h-[70vh] max-h-[560px] min-h-[430px] w-full overflow-hidden rounded-[1.35rem]"
          scrollWheelZoom={false}
          zoom={11}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {matches.map((match) => {
            const { district } = match;
            const isHighlighted = topDistrictIds.includes(district.id);

            return (
              <Marker
                icon={createScoreIcon(match.score, isHighlighted)}
                key={district.id}
                position={[district.latitude, district.longitude]}
              >
                <Popup>
                  <strong>{district.name}</strong>
                  <br />
                  {match.score}% match
                  <br />
                  {district.shortDescription}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
          <Navigation aria-hidden="true" className="h-4 w-4 text-indigo-500" />
          Center-point markers keep the prototype lightweight.
        </div>
      </div>
      {/* Real Hamburg district GeoJSON boundaries could be loaded here later and rendered as Leaflet GeoJSON layers instead of center-point markers. */}
    </section>
  );
}
