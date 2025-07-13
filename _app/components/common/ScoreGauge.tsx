import React from 'react';

type Gauge = {
  color: string;
  left: number;
  top: number;
  outline?: boolean;
};

type ScoreGaugeProps = {
  gauges: Gauge[];
};

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ gauges }) => (
  <div className="w-64 h-36 relative rounded-[5px] border border-purple-500 overflow-hidden">
    {gauges.map((g, i) => (
      <div
        key={i}
        className="w-20 h-5 absolute"
        style={{ left: g.left, top: g.top }}
      >
        <div className="w-20 h-5 left-0 top-0 absolute">
          <div
            className={`w-20 h-5 left-0 top-0 absolute rounded-[50px] ${g.outline ? 'outline outline-1 outline-emerald-400' : ''}`}
            style={{ background: g.color }}
          ></div>
        </div>
      </div>
    ))}
  </div>
);

export default ScoreGauge; 