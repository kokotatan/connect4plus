import React from 'react';

type Badge = {
  text: string;
  left: number;
  top: number;
  rotate?: number;
};

type WinnerBadgeProps = {
  badges: Badge[];
};

export const WinnerBadge: React.FC<WinnerBadgeProps> = ({ badges }) => (
  <div className="w-80 h-40 relative rounded-[5px] border border-purple-500 overflow-hidden">
    {badges.map((b, i) => (
      <div
        key={i}
        className="w-32 h-16 absolute"
        style={{ left: b.left, top: b.top }}
      >
        <div
          className="w-28 h-10 absolute text-black text-3xl font-semibold font-['Noto_Sans'] leading-[50px] justify-start"
          style={{ transform: b.rotate ? `rotate(${b.rotate}deg)` : undefined }}
        >
          {b.text}
        </div>
      </div>
    ))}
  </div>
);

export default WinnerBadge; 