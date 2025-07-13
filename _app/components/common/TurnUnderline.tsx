import React from 'react';

type Underline = {
  color: string;
  left: number;
  active?: boolean;
};

type TurnUnderlineProps = {
  underlines: Underline[];
};

export const TurnUnderline: React.FC<TurnUnderlineProps> = ({ underlines }) => (
  <div className="w-[564px] h-12 relative rounded-[5px] border border-purple-500 overflow-hidden">
    {underlines.map((u, i) => (
      <div
        key={i}
        className={`w-24 h-1.5 absolute`}
        style={{ left: u.left, top: 20 }}
      >
        <div
          className={`w-24 h-1.5 left-0 top-0 absolute ${u.active ? '' : ''}`}
          style={{ background: u.color }}
        ></div>
      </div>
    ))}
  </div>
);

export default TurnUnderline; 