import React from 'react';

type DrawLabelProps = {
  text: string;
};

export const DrawLabel: React.FC<DrawLabelProps> = ({ text }) => (
  <div className="w-72 h-14 text-center justify-start text-black text-6xl font-semibold font-['Noto_Sans'] leading-[50px]">
    {text}
  </div>
);

export default DrawLabel; 