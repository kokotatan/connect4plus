import React from 'react';

type RematchButtonProps = {
  text: string;
  onClick?: () => void;
};

export const RematchButton: React.FC<RematchButtonProps> = ({ text, onClick }) => (
  <button className="w-44 h-9 relative" onClick={onClick}>
    <div className="w-44 h-9 left-0 top-0 absolute bg-green-100 rounded-[50px]" />
    <div className="w-32 h-6 left-[13px] top-[6px] absolute text-center justify-center text-black text-xl font-normal font-['Noto_Sans'] leading-[50px]">
      {text}
    </div>
  </button>
);

export default RematchButton; 