import React from 'react';

type ResultPanelProps = {
  children: React.ReactNode;
  width?: number | string;
  height?: number | string;
};

export const ResultPanel: React.FC<ResultPanelProps> = ({ children, width = '1449px', height = '712px' }) => (
  <div
    className="relative rounded-[5px] border border-purple-500 overflow-hidden"
    style={{ width, height }}
  >
    {children}
  </div>
);

export default ResultPanel; 