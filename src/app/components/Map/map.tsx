'use client'

import dynamic from 'next/dynamic';

// Dynamically import the actual map component with no SSR
const DynamicMapComponent = dynamic(() => import('./MainMap'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p>Loading map...</p>
      </div>
    </div>
  )
});

export default function MapComponent() {
  return <DynamicMapComponent />;
}