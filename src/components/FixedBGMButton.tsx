import React from 'react';
import { BGMControlButton } from './BGMControlButton';

interface FixedBGMButtonProps {
  className?: string;
}

export const FixedBGMButton: React.FC<FixedBGMButtonProps> = ({
  className = ''
}) => {
  return (
    <div className={`
      fixed bottom-4 right-4 z-50
      ${className}
    `}>
      <BGMControlButton 
        size="medium" 
        className="shadow-2xl hover:shadow-3xl"
      />
    </div>
  );
}; 