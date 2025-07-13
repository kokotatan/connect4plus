import React from 'react';

type CellProps = {
  color: string;
  outline?: boolean;
  outlineColor?: string;
  left: number;
};

export const Cell: React.FC<CellProps> = ({ color, outline, outlineColor, left }) => (
  <div className="w-10 h-10 absolute" style={{ left, top: 20 }}>
    <div
      className={`w-10 h-10 left-0 top-0 absolute rounded-full ${outline ? 'outline outline-4 outline-offset-[-2px]' : ''}`}
      style={{ background: color, outlineColor }}
    ></div>
  </div>
);

export default Cell; 