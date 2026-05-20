import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import type { DistrictMatch } from "../types/District";

type MapViewProps = {
  matches: DistrictMatch[];
};

const defaultIcon = L.divIcon({
  className: "district-marker",
  html: "<span></span>",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const highlightedIcon = L.divIcon({
  className: "district-marker district-marker-highlight",
  html: "<span></span>",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export function MapView({ matches }: MapViewProps) {
  const topDistrictIds = matches.slice(0, 3).map((match) => match.district.id);

  return (
    <section className="map-panel">
      <div className="map-copy">
        <h2>Map view</h2>
        <p>Top recommendations are highlighted. Markers use district centers for this prototype.</p>
      </div>
      <MapContainer center={[53.5511, 9.9937]} className="district-map" scrollWheelZoom={false} zoom={11}>
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
