import React from 'react';

type ScoreGaugeProps = {
  score: number;
  maxScore: number;
  playerType: 'player1' | 'player2';
};

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, maxScore, playerType }) => {
  // コマ色
  const playerColor = playerType === 'player1' ? '#4D6869' : '#55B89C';
  // ピクセルアート風の枠色
  const borderColor = '#222';

  return (
    <div className="flex items-center">
      {[...Array(maxScore)].map((_, i) => (
        <div
          key={i}
          style={{
            width: 18,
            height: 18,
            background: i < score ? playerColor : '#fff',
            border: `2px solid ${borderColor}`,
            boxSizing: 'border-box',
            borderRadius: 3,
            marginLeft: i === 0 ? 0 : -2, // 枠線分だけ重ねて隙間なく
            boxShadow: '0 1px #888',
            imageRendering: 'pixelated',
            zIndex: 10 - i, // 重なり順で左が上
          }}
        />
      ))}
    </div>
  );
};

export default ScoreGauge; 