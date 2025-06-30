"use client";

import { useEffect, useState, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import { FeatureCollection } from "@/app/interfaces/geojs";
import { SearchBar } from "./MapSearch/SearchBar";
import { SearchResults } from "./MapSearch/SearchResults";
import { ZoomControls } from "./MapControls/ZoomControls";
import { GithubIcon } from "lucide-react";

import { GeoJSONLayer } from "./GeoJSONLayer";
import { BaseMapSelector } from "./MapControls/BaseMapSelectot";

// Base map configurations
const baseMaps = {
  light: {
    name: "Light",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  dark: {
    name: "Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  satellite: {
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  },
};

export function MapComponent() {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentBaseMap, setCurrentBaseMap] =
    useState<keyof typeof baseMaps>("light");
  const mapRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    console.log("Attempting to fetch GeoJSON data...");

    fetch("/data/dummy-data-for-test.geojson")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setGeoData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading GeoJSON:", error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const zoomIn = () => mapRef.current?.zoomIn();
  const zoomOut = () => mapRef.current?.zoomOut();

  const handleSearch = (term: string) => {
    setSearchTerm(term);

    if (!term.trim() || !geoData) {
      setSearchResults([]);
      return;
    }

    const results = geoData.features.filter((feature) => {
      const props = feature.properties;
      const searchableText = [
        props.RTNew,
        props.Id?.toString(),
        props.Estimasi?.toString(),
        props["Sampah Plastik (kg)"]?.toString(),
        props["Sampah Organik (kg)"]?.toString(),
        props["sampah Anorganik (kg)"]?.toString(),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(term.toLowerCase());
    });

    setSearchResults(results);
  };

  const handleBaseMapChange = (key: string) => {
    if (key in baseMaps) {
      setCurrentBaseMap(key as keyof typeof baseMaps);
    }
  };

  const navigateToFeature = (feature: any) => {
    if (mapRef.current && feature.geometry) {
      const geoJsonLayer = L.geoJSON(feature);
      const bounds = geoJsonLayer.getBounds();
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });

      if (geoJsonLayerRef.current) {
        geoJsonLayerRef.current.eachLayer((layer: any) => {
          if (layer.feature?.properties.Id === feature.properties.Id) {
            setTimeout(() => {
              layer.openPopup();
            }, 300);
          }
        });
      }

      setSearchResults([]);
      setSearchTerm("");
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-black">data load success...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="font-semibold">Error loading map data:</p>
          <p className="text-sm mt-1">{error}</p>
          <p className="text-xs mt-2 text-gray-500">
            Check if the file exists at: /data/dummy-data-for-test.geojson
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col relative">
      <div className="p-4 bg-white shadow-md flex flex-row justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <SearchBar
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Cari RT, ID, atau Estimasi"
          />
          <SearchResults
            results={searchResults}
            onSelect={navigateToFeature}
            onClose={() => setSearchResults([])}
          />
        </div>
        <span className="bg-black text-white px-3 py-2 rounded-md flex items-center gap-2 self-start">
          <GithubIcon className="w-4 h-4" />
          <h1 className="text-sm font-medium">by Albert</h1>
        </span>
      </div>

      <div className="flex-1 min-h-0 relative">
        <MapContainer
          center={[-6.979, 107.589]}
          zoom={18}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
          zoomControl={false}
        >
          <TileLayer
            key={currentBaseMap}
            url={baseMaps[currentBaseMap].url}
            attribution={baseMaps[currentBaseMap].attribution}
          />

          {geoData && (
            <GeoJSONLayer
              data={geoData}
              layerRef={(ref) => {
                if (ref) {
                  geoJsonLayerRef.current = ref;
                }
              }}
            />
          )}
        </MapContainer>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] flex gap-2 bg-white p-2 rounded-md shadow-md">
          <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} />
          <BaseMapSelector
            baseMaps={baseMaps}
            currentBaseMap={currentBaseMap}
            onChange={handleBaseMapChange}
          />
        </div>
      </div>
    </div>
  );
}
