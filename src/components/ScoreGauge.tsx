import React from 'react';
import { PlayerCharacterType } from '../types/game';
import { useTheme } from '../contexts/ThemeContext';

type ScoreGaugeProps = {
  score: number;
  maxScore: number;
  playerType: PlayerCharacterType;
};

export default function ScoreGauge({ score, maxScore, playerType }: ScoreGaugeProps) {
  const { colors } = useTheme();
  
  // プレイヤータイプに応じた色を取得
  const getPlayerColor = () => {
    if (playerType === 'graycat') {
      return colors.player1Color;
    } else if (playerType === 'tiger' || playerType === 'ai') {
      return colors.player2Color;
    }
    return colors.player1Color; // デフォルト
  };

  const playerColor = getPlayerColor();

  // 全体幅を固定（ユーザー情報の枠に合わせて）
  const totalWidth = 80;
  const height = 18;

  return (
    <div 
      className="flex items-center justify-center" 
      style={{ 
        width: totalWidth, 
        height: height,
        border: `2px solid ${colors.scoreGaugeBorder}`,
        borderRadius: 3,
        boxShadow: '0 1px #888',
        imageRendering: 'pixelated',
        overflow: 'hidden',
        background: colors.scoreGaugeBackground
      }}
    >
      {[...Array(maxScore)].map((_, i) => (
      <div
        key={i}
          style={{
            width: totalWidth / maxScore,
            height: '100%',
            background: i < score ? playerColor : colors.scoreGaugeBackground,
            borderRight: i < maxScore - 1 ? `1px solid ${colors.scoreGaugeBorder}` : 'none',
            boxSizing: 'border-box',
            flexShrink: 0,
          }}
        />
    ))}
  </div>
);
}; 