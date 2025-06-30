import React from 'react';

interface LegendProps {
  isVisible: boolean;
}

export const Legend: React.FC<LegendProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="
      absolute 
      bottom-4 left-4 
      md:bottom-4 md:left-4 
      sm:right-4 sm:left-auto sm:bottom-16
      z-[1000] 
      bg-white/90 backdrop-blur-sm 
      p-3 rounded-md shadow-md
      md:max-w-[180px] max-w-[100px]
      text-black
    ">
      <h4 className="text-sm font-semibold mb-2">Indeks Jumlah Sampah (kg)</h4>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-[#00ff00]"></div>
          <span className="text-xs">≤ 20</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-[#ff8800]"></div>
          <span className="text-xs">20 - 30</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-[#ff0000]"></div>
          <span className="text-xs">≥ 30</span>
        </div>
      </div>
    </div>
  );
};