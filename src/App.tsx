import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import canada from "./data/canada.json";
import L from "leaflet";
import "leaflet.markercluster/dist/leaflet.markercluster.js";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useEffect, useRef, useState } from "react";
import "leaflet.markercluster";
import "./leaflet-icon";

type Service = {
  id: number;
  name: string;
  tags: string[];
  lat: number;
  lng: number;
};

const quebecBounds: L.LatLngBoundsExpression = [
  [44.0, -79.8],
  [62.6, -57.1],
];

const services: Service[] = [
  { id: 1, name: "Service 1", tags: ["tag1"], lat: 45.5088, lng: -73.5619 },
  { id: 2, name: "Service 2", tags: ["tag1"], lat: 46.8139, lng: -71.2082 },
  { id: 3, name: "Service 3", tags: ["tag2"], lat: 45.5017, lng: -73.5673 },
  { id: 4, name: "Service 4", tags: ["tag2"], lat: 46.82, lng: -71.242 },
  { id: 5, name: "Service 5", tags: ["tag3"], lat: 45.5155, lng: -73.572 },
  { id: 6, name: "Service 6", tags: ["tag1"], lat: 45.6066, lng: -73.7124 },
  { id: 7, name: "Service 7", tags: ["tag2"], lat: 45.4042, lng: -71.892 },
  { id: 8, name: "Service 8", tags: ["tag3"], lat: 46.3456, lng: -72.5477 },
  { id: 9, name: "Service 9", tags: ["tag1"], lat: 48.4284, lng: -71.068 },
  { id: 10, name: "Service 10", tags: ["tag2"], lat: 45.4765, lng: -75.7013 },
];

export default function App() {
  const quebec = {
    type: "FeatureCollection",
    features: canada.features.filter(
      (f: any) => f.properties.name === "Quebec",
    ),
  } as GeoJSON.FeatureCollection<GeoJSON.Geometry>;

  const [search, setSearch] = useState("");
  const markerRefs = useRef<{ [key: number]: L.Marker }>({});
  const markerClusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    null,
  );
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const filteredServices = services.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) &&
      (activeTags.length === 0 ||
        s.tags.some((tag) => activeTags.includes(tag))),
  );

  function MarkerCluster({ services }: { services: Service[] }) {
    const map = useMap();

    useEffect(() => {
      const markers = L.markerClusterGroup();

      markerClusterGroupRef.current = markers;

      services.forEach((s) => {
        const marker = L.marker([s.lat, s.lng]).bindPopup(s.name);
        markerRefs.current[s.id] = marker;
        markers.addLayer(marker);
      });

      map.addLayer(markers);

      return () => {
        map.removeLayer(markers);
      };
    }, [map, services]);

    return null;
  }

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };
  const allTags = Array.from(new Set(services.flatMap((s) => s.tags)));

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      {/* Left Sidebar */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "16px",
          overflowY: "auto",
          borderRight: "2px solid #ccc",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          width: "20%",
        }}
      >
        {/* Search Bar */}
        <div>
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "2px solid #ccc",
              width: "100%",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Tag Filters */}
        <div>
          <strong>Filter by tags</strong>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: "8px",
              gap: "4px",
            }}
          >
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "12px",
                    border: "1px solid #ccc",
                    backgroundColor: activeTags.includes(tag)
                      ? "#007aff"
                      : "white",
                    color: activeTags.includes(tag) ? "white" : "black",
                    cursor: "pointer",
                    fontWeight: 500,
                    transition: "0.2s",
                  }}
                >
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Services List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredServices.map((s) => (
            <div
              key={s.id}
              onClick={() => {
                setSelectedServiceId(s.id);
                const marker = markerRefs.current[s.id];
                const cluster = markerClusterGroupRef.current;
                if (marker && cluster) {
                  cluster.zoomToShowLayer(marker);
                }
              }}
              style={{
                padding: "12px 16px",
                borderRadius: "12px",
                // boxShadow:
                //   selectedServiceId === s.id
                //     ? "0 4px 12px rgba(0, 122, 255, 0.4)"
                //     : "0 2px 6px rgba(0,0,0,0.1)",
                backgroundColor:
                  selectedServiceId === s.id ? "#e6f0ff" : "#fff",
                border:
                  selectedServiceId === s.id
                    ? "1px solid #007aff"
                    : "1px solid #ddd",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <strong>{s.name}</strong>
              <div
                style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}
              >
                {s.tags.join(", ")}
              </div>
            </div>
          ))}
        </div>
      </div>

      <MapContainer
        center={[45.8836, -72.4875]}
        zoom={8}
        maxBounds={quebecBounds}
        minZoom={4}
        maxZoom={16}
        maxBoundsViscosity={1.0}
        style={{ flex: 1 }}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors © CARTO"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <GeoJSON
          data={quebec}
          style={{ color: "#000", weight: 2, fillOpacity: 0 }}
        />
        <MarkerCluster services={filteredServices} />
      </MapContainer>
    </div>
  );
}
