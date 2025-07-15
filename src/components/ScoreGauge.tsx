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
  // 区画間のギャップ（2px）
  const gap = 2;
  // 区画幅を計算（全体幅からギャップ分を引いて分割）
  const blockWidth = (totalWidth - gap * (maxScore - 1)) / maxScore;

  return (
    <div className="flex items-center" style={{ width: totalWidth }}>
      {[...Array(maxScore)].map((_, i) => (
        <div
          key={i}
          style={{
            width: blockWidth,
            height: 18,
            background: i < score ? playerColor : '#fff',
            border: `2px solid ${borderColor}`,
            boxSizing: 'border-box',
            borderRadius: 3,
            marginRight: i < maxScore - 1 ? gap : 0, // 最後の区画以外にギャップを追加
            boxShadow: '0 1px #888',
            imageRendering: 'pixelated',
            flexShrink: 0, // 区画が縮まないようにする
          }}
        />
      ))}
    </div>
  );
}; 