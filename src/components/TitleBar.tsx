import React from 'react';

type TitleBarProps = {
  title: string;
  subtitle: string;
  presentedBy?: string;
};

export const TitleBar: React.FC<TitleBarProps> = ({ title, subtitle, presentedBy }) => (
  <div className="w-[898px] h-[1225px] relative rounded-[5px] border border-purple-500 overflow-hidden">
    <div className="w-44 h-10 left-[123px] top-[20px] absolute">
      <div className="w-44 h-4 left-0 top-[23px] absolute text-center justify-start text-gray-500 text-xs font-semibold font-['Noto_Sans'] leading-snug">{subtitle}</div>
      <div className="w-44 h-4 left-0 top-0 absolute text-center justify-start text-black text-2xl font-semibold font-['Noto_Sans'] leading-snug">{title}</div>
    </div>
    <div className="w-96 h-[953px] left-[20px] top-[182px] absolute">
      <div className="w-96 h-[953px] left-0 top-0 absolute bg-emerald-50"></div>
      <div className="w-44 h-4 left-[103px] top-[42px] absolute text-center justify-start text-gray-500 text-xs font-semibold font-['Noto_Sans'] leading-snug">{subtitle}</div>
      <div className="w-44 h-4 left-[103px] top-[19px] absolute text-center justify-start text-black text-2xl font-semibold font-['Noto_Sans'] leading-snug">{title}</div>
      {presentedBy && (
        <div className="w-64 h-3.5 left-[103px] top-[841px] absolute">
          <div className="w-64 h-3.5 left-0 top-0 absolute text-right justify-start text-gray-500 text-sm font-semibold font-['Noto_Sans'] leading-snug">{presentedBy}</div>
        </div>
      )}
    </div>
    <div className="w-96 h-[953px] left-[478px] top-[182px] absolute">
      <div className="w-96 h-[953px] left-0 top-0 absolute bg-stone-50"></div>
      <div className="w-44 h-4 left-[103px] top-[42px] absolute text-center justify-start text-gray-500 text-xs font-semibold font-['Noto_Sans'] leading-snug">{subtitle}</div>
      <div className="w-44 h-4 left-[103px] top-[19px] absolute text-center justify-start text-black text-2xl font-semibold font-['Noto_Sans'] leading-snug">{title}</div>
    </div>
  </div>
);

export default TitleBar; 