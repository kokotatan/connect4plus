import React from 'react';

type GameGridProps = {
  columns: React.ReactNode[];
};

export const GameGrid: React.FC<GameGridProps> = ({ columns }) => (
  <div className="w-80 h-96 relative">
    <div className="w-80 h-96 left-0 top-0 absolute bg-green-100 rounded-[20px]" />
    {columns}
  </div>
);

export default GameGrid; 