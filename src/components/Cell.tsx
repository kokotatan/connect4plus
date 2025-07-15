import React, { useEffect, useRef, useState } from 'react';
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

  // 星セル消去時のフェードアニメーション
  const [fadeOut, setFadeOut] = useState(false);
  const prevState = useRef(state.state);
  useEffect(() => {
    if (prevState.current === 'star' && state.state === 'empty') {
      setFadeOut(true);
      const timer = setTimeout(() => setFadeOut(false), 400);
      return () => clearTimeout(timer);
    }
    prevState.current = state.state;
  }, [state.state]);

  return (
    <div className="w-10 h-10 relative">
      <div
        className={`w-10 h-10 rounded-full transition-all duration-300 ${
          state.state === 'drop' ? 'animate-bounce' : ''
        } ${isHighlighted && state.state === 'empty' ? 'outline outline-2 outline-emerald-500' : ''}`}
        style={{ 
          background: getCellColor(),
          opacity: state.state === 'empty' && fadeOut ? 0 : (state.state === 'empty' ? 0.3 : 1),
          transition: fadeOut ? 'opacity 0.4s' : undefined,
          // 星セルの場合、より目立つ効果を追加
          ...(state.state === 'star' && {
            boxShadow: '0 0 20px rgba(151, 71, 255, 0.8), inset 0 0 10px rgba(151, 71, 255, 0.3)',
            animation: 'starPulse 1.5s ease-in-out infinite',
            transform: 'scale(1.1)',
          })
        }}
      >
        {state.state === 'star' && (
          <>
            {/* 星のアイコン */}
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                filter: 'drop-shadow(0 0 4px rgba(151, 71, 255, 0.8))'
              }}
              fill="#FFFFFF"
              className="animate-pulse"
            >
              <polygon points="12,2 15,9 22,9.5 17,14.5 18.5,22 12,18 5.5,22 7,14.5 2,9.5 9,9" />
            </svg>
            {/* 光る効果 */}
            <div 
              className="absolute inset-0 rounded-full animate-ping"
              style={{
                background: 'radial-gradient(circle, rgba(151, 71, 255, 0.4) 0%, transparent 70%)',
                animation: 'starGlow 2s ease-in-out infinite'
              }}
            />
          </>
        )}
      </div>
      
      {/* 星セル用のCSSアニメーション */}
      {state.state === 'star' && (
        <style jsx>{`
          @keyframes starPulse {
            0%, 100% {
              transform: scale(1.1);
              box-shadow: 0 0 20px rgba(151, 71, 255, 0.8), inset 0 0 10px rgba(151, 71, 255, 0.3);
            }
            50% {
              transform: scale(1.2);
              box-shadow: 0 0 30px rgba(151, 71, 255, 1), inset 0 0 15px rgba(151, 71, 255, 0.5);
            }
          }
          
          @keyframes starGlow {
            0%, 100% {
              opacity: 0.6;
              transform: scale(1);
            }
            50% {
              opacity: 1;
              transform: scale(1.1);
            }
          }
        `}</style>
      )}
    </div>
  );
};

export default Cell; 