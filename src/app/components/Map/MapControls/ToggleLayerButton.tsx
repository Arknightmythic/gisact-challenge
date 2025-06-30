import { Eye, EyeOff } from 'lucide-react';

interface ToggleLayerButtonProps {
  isVisible: boolean;
  onToggle: () => void;
}

export function ToggleLayerButton({ isVisible, onToggle }: ToggleLayerButtonProps) {
  return (
    <button
      onClick={onToggle}
      className="bg-white hover:bg-gray-50 border border-gray-300 rounded-md p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      title={isVisible ? 'Hide Layer' : 'Show Layer'}
    >
      {isVisible ? (
        <Eye className="h-5 w-5 text-gray-600" />
      ) : (
        <EyeOff className="h-5 w-5 text-gray-600" />
      )}
    </button>
  );
}