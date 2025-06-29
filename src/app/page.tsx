
'use client';

import Image from "next/image";
import MapComponent from "./components/Map/map";




export default function Home() {
  return (
    <div className="h-screen w-full">
      <MapComponent />
    </div>
  );
}
