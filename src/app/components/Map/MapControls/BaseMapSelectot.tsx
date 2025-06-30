import { Layers } from 'lucide-react';
import { useState } from 'react';

interface BaseMap {
  name: string;
  url: string;
  attribution: string;
}

interface BaseMapSelectorProps {
  baseMaps: Record<string, BaseMap>;
  currentBaseMap: string;
  onChange: (key: string) => void;
}

export function BaseMapSelector({ baseMaps, currentBaseMap, onChange }: BaseMapSelectorProps) {
  const [showSelector, setShowSelector] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowSelector(!showSelector);
        }}
        className="bg-white hover:bg-gray-50 border border-gray-300 rounded-md p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        title="Change Base Map"
      >
        <Layers className="h-5 w-5 text-gray-600" />
      </button>
      
      {showSelector && (
        <>
          <div 
            className="fixed inset-0 z-[999]" 
            onClick={() => setShowSelector(false)}
          />
          <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-300 rounded-md shadow-lg min-w-32 z-[1001]">
            {Object.entries(baseMaps).map(([key, map]) => (
              <button
                key={key}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(key);
                  setShowSelector(false);
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
  );
}