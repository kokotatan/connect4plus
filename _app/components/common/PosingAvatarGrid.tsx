import React from 'react';

type PosingAvatarGridProps = {
  images: string[];
};

export const PosingAvatarGrid: React.FC<PosingAvatarGridProps> = ({ images }) => {
  // Figmaの絶対配置に合わせた座標リスト
  const positions = [
    { left: 132, top: 60, w: 96, h: 96 },
    { left: 20, top: 20, w: 112, h: 176 },
    { left: 25, top: 169, w: 112, h: 176 },
    { left: 132, top: 175, w: 112, h: 176, rotate: 180 },
    { left: 243, top: 72, w: 112, h: 112, rotate: 180 },
    { left: 249, top: 196, w: 80, h: 128 },
    { left: 430, top: 117, w: 160, h: 160 },
  ];
  return (
    <div className="w-[747px] h-80 relative rounded-[5px] border border-purple-500 overflow-hidden">
      {images.slice(0, 7).map((src, i) => (
        <div
          key={i}
          className={`absolute`}
          style={{
            left: positions[i].left,
            top: positions[i].top,
            width: positions[i].w,
            height: positions[i].h,
            transform: positions[i].rotate ? `rotate(${positions[i].rotate}deg)` : undefined,
          }}
        >
          <img
            className="absolute"
            src={src}
            alt={`posing-avatar-${i}`}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      ))}
    </div>
  );
};

export default PosingAvatarGrid; 