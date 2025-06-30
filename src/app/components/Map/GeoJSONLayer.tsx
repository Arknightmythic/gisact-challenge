import { GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import { FeatureCollection } from '@/app/interfaces/geojs';

interface GeoJSONLayerProps {
  data: FeatureCollection;
  layerRef: (ref: L.GeoJSON) => void;
  isVisible: boolean;
}

export function GeoJSONLayer({ data, layerRef, isVisible }: GeoJSONLayerProps) {
  const geoJsonStyle = (feature: any) => {
    if (!isVisible) return { opacity: 0, fillOpacity: 0 };

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
    
    if (isVisible) {
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
    } else {
      layer.off('mouseover');
      layer.off('mouseout');
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <GeoJSON
      data={data}
      style={geoJsonStyle}
      onEachFeature={onEachFeature}
      ref={layerRef}
    />
  );
}