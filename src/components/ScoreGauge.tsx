import React from 'react';
import { PlayerCharacterType } from '../types/game';

type ScoreGaugeProps = {
  score: number;
  maxScore: number;
  playerType: PlayerCharacterType;
};

export default function ScoreGauge({ score, maxScore, playerType }: ScoreGaugeProps) {
  let playerColor = '#4D6869'; // デフォルト色
  if (playerType === 'graycat') playerColor = '#4D6869';
  if (playerType === 'tiger') playerColor = '#55B89C';
  if (playerType === 'ai') playerColor = '#55B89C';
  // ピクセルアート風の枠色
  const borderColor = '#222';

  // 全体幅を固定（80px）
  const totalWidth = 80;
  const height = 18;

  return (
    <div 
      className="flex items-center" 
      style={{ 
        width: totalWidth, 
        height: height,
        border: `2px solid ${borderColor}`,
        borderRadius: 3,
        boxShadow: '0 1px #888',
        imageRendering: 'pixelated',
        overflow: 'hidden'
      }}
    >
      {[...Array(maxScore)].map((_, i) => (
        <div
          key={i}
          style={{
            width: totalWidth / maxScore,
            height: '100%',
            background: i < score ? playerColor : '#fff',
            borderRight: i < maxScore - 1 ? `1px solid ${borderColor}` : 'none',
            boxSizing: 'border-box',
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}; 