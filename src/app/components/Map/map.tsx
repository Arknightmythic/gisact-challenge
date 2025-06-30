'use client'

import dynamic from 'next/dynamic';


const DynamicMapComponent = dynamic(() => import('./MapPage'), {
  ssr: false,
});

export default function MapComponent() {
  return <DynamicMapComponent />;
}