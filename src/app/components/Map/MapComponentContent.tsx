'use client'

import { useEffect, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import { Search, Plus, Minus, Layers } from 'lucide-react';
import { FeatureCollection } from '@/app/interfaces/geojs';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});


const baseMaps = {
  light: {
    name: 'Light',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  dark: {
    name: 'Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }
};

export default function MapComponentContent() {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentBaseMap, setCurrentBaseMap] = useState<keyof typeof baseMaps>('light');
  const [showBaseMapSelector, setShowBaseMapSelector] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    console.log('Attempting to fetch GeoJSON data...');

    fetch('/data/dummy-data-for-test.geojson')
      .then(response => {
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('GeoJSON data loaded successfully:', data);
        console.log('Number of features:', data.features?.length);
        setGeoData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading GeoJSON:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  
  const zoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

 
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (!term.trim() || !geoData) {
      setSearchResults([]);
      return;
    }

    const results = geoData.features.filter(feature => {
      const props = feature.properties;
    
      const searchableText = [
        props.RTNew,
        props.Id?.toString(),
        props.Estimasi?.toString(),
        props['Sampah Plastik (kg)']?.toString(),
        props['Sampah Organik (kg)']?.toString(),
        props['sampah Anorganik (kg)']?.toString()
      ].join(' ').toLowerCase();
      
      return searchableText.includes(term.toLowerCase());
    });

    setSearchResults(results);
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
      setSearchTerm('');
    }
  };

  const geoJsonStyle = (feature: any) => {
    const totalWaste = (feature.properties['Sampah Plastik (kg)'] || 0) + 
                      (feature.properties['Sampah Organik (kg)'] || 0) + 
                      (feature.properties['sampah Anorganik (kg)'] || 0);
    
    let fillColor = '#00ff00';
    if (totalWaste > 30) fillColor = '#ff0000'; 
    else if (totalWaste > 20) fillColor = '#ff8800'; 
    
    return {
      color: '#333',
      weight: 1,
      opacity: 1,
      fillColor: fillColor,
      fillOpacity: 0.6
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const props = feature.properties;

    let popupContent = `
      <div style="min-width: 200px;">
        <h3 style="margin: 0 0 10px 0; color: #333;">${props.RTNew || 'RT Data'}</h3>
        <hr style="margin: 10px 0;">
        <p><strong>ID:</strong> ${props.Id}</p>
        <p><strong>Estimasi:</strong> ${props.Estimasi}</p>
        <hr style="margin: 10px 0;">
        <h4 style="margin: 5px 0; color: #666;">Data Sampah:</h4>
        <p><strong>🗑️ Sampah Plastik:</strong> ${props['Sampah Plastik (kg)']} kg</p>
        <p><strong>🥬 Sampah Organik:</strong> ${props['Sampah Organik (kg)']} kg</p>
        <p><strong>🏺 Sampah Anorganik:</strong> ${props['sampah Anorganik (kg)']} kg</p>
        <hr style="margin: 10px 0;">
        <p><strong>📏 Shape Length:</strong> ${props.Shape_Leng?.toFixed(6)}</p>
        <p><strong>📐 Shape Area:</strong> ${props.Shape_Area?.toFixed(2)}</p>
      </div>
    `;
    
    layer.bindPopup(popupContent);
    
    layer.on('mouseover', () => {
      layer.setStyle({
        weight: 4,
        opacity: 1,
        fillOpacity: 0.8
      });
      layer.bringToFront();
    });
    
    layer.on('mouseout', () => {
      layer.setStyle(geoJsonStyle(feature));
    });
  };

  if (loading) {
    return (
      <div className="h-96 w-full bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p>Loading map data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-96 w-full bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="font-semibold">Error loading map data:</p>
          <p className="text-sm mt-1">{error}</p>
          <p className="text-xs mt-2 text-gray-500">Check if the file exists at: /data/dummy-data-for-test.geojson</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col relative">
      <div className="flex-shrink-0 p-4 bg-white shadow-md">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Cari RT, ID, atau Estimasi"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-black placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          
          {searchResults.length > 0 && (
            <>
              <div 
                className="fixed inset-0 z-[998]" 
                onClick={() => setSearchResults([])}
              />
              <div className="absolute top-full left-7 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto z-[999]">
                {searchResults.map((feature, index) => (
                  <div
                    key={index}
                    onClick={() => navigateToFeature(feature)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-500">
                      {feature.properties.RTNew || 'RT Data'}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {feature.properties.Id} | Estimasi: {feature.properties.Estimasi}
                    </div>
                    <div className="text-xs text-gray-500">
                      Plastik: {feature.properties['Sampah Plastik (kg)']}kg | 
                      Organik: {feature.properties['Sampah Organik (kg)']}kg | 
                      Anorganik: {feature.properties['sampah Anorganik (kg)']}kg
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        <MapContainer
          center={[-6.979, 107.589]}
          zoom={18}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          zoomControl={false}
        >
          <TileLayer
            key={currentBaseMap}
            url={baseMaps[currentBaseMap].url}
            attribution={baseMaps[currentBaseMap].attribution}
          />
          
          {geoData && (
            <GeoJSON
              data={geoData}
              style={geoJsonStyle}
              onEachFeature={onEachFeature}
              ref={(ref) => {
                if (ref) {
                  geoJsonLayerRef.current = ref;
                }
              }}
            />
          )}
        </MapContainer>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] flex gap-2 bg-white p-2 rounded-md shadow-md">
          <div className="flex gap-2">
            <button
              onClick={zoomIn}
              className="bg-white hover:bg-gray-50 border border-gray-300 rounded-md p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Zoom In"
            >
              <Plus className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={zoomOut}
              className="bg-white hover:bg-gray-50 border border-gray-300 rounded-md p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Zoom Out"
            >
              <Minus className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowBaseMapSelector(!showBaseMapSelector);
              }}
              className="bg-white hover:bg-gray-50 border border-gray-300 rounded-md p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Change Base Map"
            >
              <Layers className="h-5 w-5 text-gray-600" />
            </button>
            
            {showBaseMapSelector && (
              <>
                <div 
                  className="fixed inset-0 z-[999]" 
                  onClick={() => setShowBaseMapSelector(false)}
                />
                <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-300 rounded-md shadow-lg min-w-32 z-[1001]">
                  {Object.entries(baseMaps).map(([key, map]) => (
                    <button
                      key={key}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentBaseMap(key as keyof typeof baseMaps);
                        setShowBaseMapSelector(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 first:rounded-t-md last:rounded-b-md ${
                        currentBaseMap === key ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      {map.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}