import React from 'react';

type TimerProps = {
  time1: string;
  time2: string;
};

export const Timer: React.FC<TimerProps> = ({ time1, time2 }) => (
  <div className="w-32 h-20 relative rounded-[5px] border border-purple-500 overflow-hidden">
    <div className="w-20 h-6 left-[32px] top-[11px] absolute">
      <div className="w-11 h-4 left-0 top-0 absolute justify-center text-gray-600 text-xl font-semibold font-['Noto_Sans'] leading-loose">{time1}</div>
    </div>
    <div className="w-20 h-6 left-[32px] top-[37px] absolute">
      <div className="w-11 h-4 left-0 top-0 absolute justify-center text-gray-500 text-xl font-semibold font-['Noto_Sans'] leading-loose">{time2}</div>
    </div>
  </div>
);

export default Timer; 