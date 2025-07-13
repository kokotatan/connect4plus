import React from 'react';

type AvatarGridProps = {
  images: string[];
};

export const AvatarGrid: React.FC<AvatarGridProps> = ({ images }) => {
  // Figmaの絶対配置に合わせた座標リスト
  const positions = [
    { left: 244, top: 20 },
    { left: 132, top: 20 },
    { left: 20, top: 20 },
    { left: 20, top: 85 },
    { left: 132, top: 85 },
    { left: 244, top: 84 },
  ];
  return (
    <div className="w-[644px] h-40 relative rounded-[5px] border border-purple-500 overflow-hidden">
      {images.slice(0, 6).map((src, i) => (
        <div
          key={i}
          className="w-16 h-16 absolute"
          style={{ left: positions[i].left, top: positions[i].top }}
        >
          <img className="w-16 h-16 absolute" src={src} alt={`avatar-${i}`} />
        </div>
      ))}
    </div>
  );
};

export default AvatarGrid; 