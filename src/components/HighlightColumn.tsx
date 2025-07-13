import React from 'react';

type HighlightColumnProps = {
  color: string;
  left: number;
};

export const HighlightColumn: React.FC<HighlightColumnProps> = ({ color, left }) => (
  <div className="w-10 h-96 absolute" style={{ left, top: 20 }}>
    <div className="w-10 h-96 left-0 top-0 absolute rounded-[5px]" style={{ background: color }}></div>
  </div>
);

export default HighlightColumn; 