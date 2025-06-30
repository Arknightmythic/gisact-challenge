import { Plus, Minus } from 'lucide-react';

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function ZoomControls({ onZoomIn, onZoomOut }: ZoomControlsProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onZoomIn}
        className="bg-white hover:bg-gray-50 border border-gray-300 rounded-md p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        title="Zoom In"
      >
        <Plus className="h-5 w-5 text-gray-600" />
      </button>
      <button
        onClick={onZoomOut}
        className="bg-white hover:bg-gray-50 border border-gray-300 rounded-md p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        title="Zoom Out"
      >
        <Minus className="h-5 w-5 text-gray-600" />
      </button>
    </div>
  );
}