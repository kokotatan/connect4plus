import React from 'react';
import { CellState } from '../types/game';

type CellProps = {
  state: CellState;
  isHighlighted?: boolean;
};

export const Cell: React.FC<CellProps> = ({ state, isHighlighted = false }) => {
  // 色設計（ご指定の色）
  const COLORS = {
    graycat: '#4D6869',   // Graycat
    tiger: '#55B89C',     // Tiger
    win: '#9747FF',       // 勝利時
    board: '#D9F2E1',     // 盤面背景
    accent: '#EF7DB4',    // アクセント
    empty: '#F9FFF9',     // 空
  };

  const getCellColor = () => {
    switch (state.state) {
      case 'empty':
        return COLORS.empty;
      case 'normal':
        return state.player === 'player1' ? COLORS.graycat : COLORS.tiger;
      case 'drop':
        return state.player === 'player1' ? COLORS.graycat : COLORS.tiger;
      case 'star':
        return COLORS.win;
      default:
        return COLORS.empty;
    }
  };

  return (
    <div className="w-10 h-10 relative">
      <div
        className={`w-10 h-10 rounded-full transition-all duration-300 ${
          state.state === 'drop' ? 'animate-bounce' : ''
        } ${isHighlighted && state.state === 'empty' ? 'outline outline-2 outline-emerald-500' : ''}`}
        style={{ 
          background: getCellColor(),
          opacity: state.state === 'empty' ? 0.3 : 1
        }}
      ></div>
    </div>
  );
};

export default Cell; 