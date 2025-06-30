interface SearchResultsProps {
  results: any[];
  onSelect: (feature: any) => void;
  onClose: () => void;
}

export function SearchResults({ results, onSelect, onClose }: SearchResultsProps) {
  if (results.length === 0) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-[998]" 
        onClick={onClose}
      />
      <div className="absolute top-full left-7 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto z-[999]">
        {results.map((feature, index) => (
          <div
            key={index}
            onClick={() => onSelect(feature)}
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
  );
}