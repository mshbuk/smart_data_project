import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import type { DistrictMatch } from "../types/District";

type MapViewProps = {
  matches: DistrictMatch[];
};

const markerDotClass = "h-2 w-2 rounded-full bg-white";
const defaultMarkerClass =
  "grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-[#245b49] shadow-lg";
const highlightedMarkerClass =
  "grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-[#f0c84b] shadow-lg";

const defaultIcon = L.divIcon({
  className: "",
  html: `<div class="${defaultMarkerClass}"><span class="${markerDotClass}"></span></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const highlightedIcon = L.divIcon({
  className: "",
  html: `<div class="${highlightedMarkerClass}"><span class="${markerDotClass}"></span></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export function MapView({ matches }: MapViewProps) {
  const topDistrictIds = matches.slice(0, 3).map((match) => match.district.id);

  return (
    <section className="rounded-lg border border-[#d8e3e8] bg-white p-4 shadow-[0_10px_28px_rgba(27,53,74,0.08)]">
      <div className="mb-3">
        <h2 className="m-0 text-xl font-extrabold text-[#172737]">Map view</h2>
        <p className="mt-1 leading-6 text-[#62707d]">Top recommendations are highlighted. Markers use district centers for this prototype.</p>
      </div>
      <MapContainer
        center={[53.5511, 9.9937]}
        className="h-[72vh] max-h-[540px] min-h-[420px] w-full overflow-hidden rounded-lg"
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
              icon={isHighlighted ? highlightedIcon : defaultIcon}
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
      {/* Real Hamburg district GeoJSON boundaries could be loaded here later and rendered as Leaflet GeoJSON layers instead of center-point markers. */}
    </section>
  );
}
