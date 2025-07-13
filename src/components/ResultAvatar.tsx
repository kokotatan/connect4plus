import React from 'react';

type ResultAvatarImage = {
  src: string;
  left: number;
  top: number;
  w: number;
  h: number;
};

type ResultAvatarProps = {
  images: ResultAvatarImage[];
};

export const ResultAvatar: React.FC<ResultAvatarProps> = ({ images }) => (
  <div className="w-[596px] h-[592px] relative rounded-[5px] border border-purple-500 overflow-hidden">
    {images.map((img, i) => (
      <div
        key={i}
        className="absolute"
        style={{ left: img.left, top: img.top, width: img.w, height: img.h }}
      >
        <img className="absolute" src={img.src} alt={`result-avatar-${i}`} style={{ width: '100%', height: '100%' }} />
      </div>
    ))}
  </div>
);

export default ResultAvatar; 