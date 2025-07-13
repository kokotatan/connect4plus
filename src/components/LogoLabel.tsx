import React from 'react';

type LogoLabelProps = {
  mainText: string;
  subText?: string;
};

export const LogoLabel: React.FC<LogoLabelProps> = ({ mainText, subText }) => (
  <div className="w-72 h-24 relative rounded-[5px] border border-purple-500 overflow-hidden">
    <div className="w-64 h-3.5 left-[20px] top-[20px] absolute">
      <div className="w-64 h-3.5 left-0 top-0 absolute text-right justify-start text-gray-500 text-sm font-semibold font-['Noto_Sans'] leading-snug">{mainText}</div>
    </div>
    {subText && (
      <div className="w-28 h-3.5 left-[157px] top-[58px] absolute">
        <div className="w-28 h-3.5 left-0 top-0 absolute text-right justify-start text-gray-500 text-sm font-semibold font-['Noto_Sans'] leading-snug">{subText}</div>
      </div>
    )}
  </div>
);

export default LogoLabel; 