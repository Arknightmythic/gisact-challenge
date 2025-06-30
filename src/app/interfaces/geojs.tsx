

export interface FeatureCollection {
  type: "FeatureCollection";
  name: string;
  features: Feature[];
}

export interface Feature {
  type: "Feature";
  properties: FeatureProperties;
  geometry: Geometry;
}

export interface FeatureProperties {
  Id: number;
  Shape_Leng: number;
  Shape_Area: number;
  Estimasi: number;
  RTNew: string;
  "Sampah Plastik (kg)": number;
  "Sampah Organik (kg)": number;
  "sampah Anorganik (kg)": number;
}

export interface Geometry {
  type: "MultiPolygon";
  coordinates: number[][][][];
}
