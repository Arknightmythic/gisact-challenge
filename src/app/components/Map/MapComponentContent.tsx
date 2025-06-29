'use client'

import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import { FeatureCollection } from '@/app/interfaces/geojs';


delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapComponentContent() {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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



 
  const geoJsonStyle = (feature: any) => {

    const totalWaste = (feature.properties['Sampah Plastik (kg)'] || 0) + 
                      (feature.properties['Sampah Organik (kg)'] || 0) + 
                      (feature.properties['sampah Anorganik (kg)'] || 0);
    
    let fillColor = '#green';
    if (totalWaste > 30) fillColor = '#ff0000'; 
    else if (totalWaste > 20) fillColor = '#ff8800'; 
    else fillColor = '#00ff00'; 
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
    
    // Add hover effects
    layer.on('mouseover', () => {
      layer.setStyle({
        weight: 4,
        opacity: 1,
        fillOpacity: 0.8
      });
    });
    
    layer.on('mouseout', () => {
      layer.setStyle(geoJsonStyle(feature));
    });

    layer.on('click', () => {
      console.log('Feature clicked:', props);
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
    <div className="w-full h-screen flex flex-col">
      {/* Status indicator */}
      <div className="flex-shrink-0 mb-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
        ✅ GeoJSON loaded successfully! Features: {geoData?.features?.length || 0}
      </div>
      
      <div className="flex-1 min-h-0">
        <MapContainer
          center={[-6.979, 107.589]} // Centered on your Indonesian data
          zoom={18} // Higher zoom to see the small polygon
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {geoData && (
            <GeoJSON
              data={geoData}
              style={geoJsonStyle}
              onEachFeature={onEachFeature}
            />
          )}
          
        </MapContainer>
      </div>
      
      {/* Data summary */}
      {geoData && (
        <div className="flex-shrink-0 mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
          <strong>Data Summary:</strong> {geoData.name} - {geoData.features?.length} feature(s)
        </div>
      )}
    </div>
  );
}