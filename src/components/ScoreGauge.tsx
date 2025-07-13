import React from 'react';

type ScoreGaugeProps = {
  score: number;
  maxScore: number;
  playerType: 'player1' | 'player2';
};

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, maxScore, playerType }) => {
  // 色はコマ色と合わせる
  const playerColor = playerType === 'player1' ? '#4D6869' : '#55B89C';
  
  // スコアに基づいてゲージを生成
  const gauges = [];
  for (let i = 0; i < maxScore; i++) {
    const isFilled = i < score;
    gauges.push({
      color: isFilled ? playerColor : '#E5E7EB', // gray-200 for empty
      left: i * 12, // 12px間隔
      top: 0,
      outline: isFilled
    });
  }

  return (
    <div className="w-24 h-3 relative rounded-[3px] border border-purple-300 overflow-hidden">
      {gauges.map((g, i) => (
        <div
          key={i}
          className="w-6 h-3 absolute"
          style={{ left: g.left, top: g.top }}
        >
          <div className="w-6 h-3 left-0 top-0 absolute">
            <div
              className={`w-6 h-3 left-0 top-0 absolute rounded-[6px] transition-all duration-300 ${
                g.outline ? 'outline outline-1 outline-emerald-400' : ''
              }`}
              style={{ background: g.color }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScoreGauge; 