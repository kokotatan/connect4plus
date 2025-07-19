import React from 'react';
import { CellState } from '../types/game';
import Cell from './Cell';
import { useTheme } from '../contexts/ThemeContext';

export type GameGridProps = {
  board: CellState[][];
  highlightedColumn?: number | null;
  lastMoveColumn?: number | null;
  lastMoveRow?: number | null;
  onColumnClick?: (col: number) => void;
  onColumnHover?: (col: number) => void;
  onColumnLeave?: () => void;
};

const BOARD_WIDTH = 7;
const BOARD_HEIGHT = 8;
const CELL_SIZE = 44; // px
const CELL_GAP = 4; // px
const BOARD_PADDING = 8; // px
const BOARD_PIXEL_WIDTH = BOARD_WIDTH * CELL_SIZE + (BOARD_WIDTH - 1) * CELL_GAP + BOARD_PADDING * 2;
const BOARD_PIXEL_HEIGHT = BOARD_HEIGHT * CELL_SIZE + (BOARD_HEIGHT - 1) * CELL_GAP + BOARD_PADDING * 2;

export const GameGrid: React.FC<GameGridProps> = ({
  board,
  highlightedColumn = null,
  lastMoveColumn = null,
  lastMoveRow = null,
  onColumnClick,
  onColumnHover,
  onColumnLeave,
}) => {
  const { colors } = useTheme();

  // ハイライトされた列の一番下の空セル位置を計算
  const getPreviewPosition = (col: number) => {
    for (let row = board.length - 1; row >= 0; row--) {
      if (board[row][col].state === 'empty') {
        return row;
      }
    }
    return -1; // 列が満杯
  };

  // プレイヤーの色を取得
  const getPlayerColor = (playerType: 'player1' | 'player2') => {
    return playerType === 'player1' ? colors.player1Color : colors.player2Color;
  };

  // プレビュー色を取得（現在のターンに応じて）
  const getPreviewColor = () => {
    // 現在のターンを判定（簡易的な方法）
    const totalMoves = board.flat().filter(cell => cell.state !== 'empty').length;
    const isPlayer1Turn = totalMoves % 2 === 0;
    return isPlayer1Turn ? colors.player1Color : colors.player2Color;
  };

  return (
    <div
      className="flex justify-center items-center"
      style={{
        width: BOARD_PIXEL_WIDTH,
        height: BOARD_PIXEL_HEIGHT,
        background: colors.boardBackground,
        borderRadius: 24,
        boxSizing: 'border-box',
        padding: BOARD_PADDING,
        boxShadow: '0 2px 12px #b0b0b033',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${BOARD_HEIGHT}, ${CELL_SIZE}px)`,
          gap: CELL_GAP,
          width: BOARD_WIDTH * CELL_SIZE + (BOARD_WIDTH - 1) * CELL_GAP,
          height: BOARD_HEIGHT * CELL_SIZE + (BOARD_HEIGHT - 1) * CELL_GAP,
          position: 'relative',
        }}
      >
        {/* 列全体のクリック可能なオーバーレイ */}
        {Array.from({ length: BOARD_WIDTH }, (_, colIdx) => {
          const isHighlighted = highlightedColumn === colIdx;
          
          return (
            <div
              key={`column-overlay-${colIdx}`}
              style={{
                position: 'absolute',
                left: colIdx * (CELL_SIZE + CELL_GAP),
                top: 0,
                width: CELL_SIZE,
                height: BOARD_HEIGHT * CELL_SIZE + (BOARD_HEIGHT - 1) * CELL_GAP,
                cursor: onColumnClick ? 'pointer' : 'default',
                zIndex: 10,
                background: isHighlighted ? `${getPreviewColor()}15` : 'transparent',
                borderRadius: 8,
                transition: 'background-color 0.2s ease',
              }}
              onClick={() => onColumnClick && onColumnClick(colIdx)}
              onMouseEnter={() => onColumnHover && onColumnHover(colIdx)}
              onMouseLeave={() => onColumnLeave && onColumnLeave()}
            />
          );
        })}
        
        {board.map((row, rowIdx) =>
          row.map((cell, colIdx) => {
            const isPreview = highlightedColumn === colIdx && rowIdx === getPreviewPosition(colIdx);
            const isLatestMove = lastMoveColumn === colIdx && lastMoveRow === rowIdx;
            
            return (
              <div
                key={`${rowIdx}-${colIdx}`}
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
                data-state={cell.state}
                data-type={cell.state === 'normal' ? cell.player : cell.state}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: colors.cellBackground,
                    borderRadius: '50%',
                    boxShadow: 'inset 0 2px 8px 0 #b0b0b0, 0 1px 2px #fff8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <Cell
                    state={cell}
                    isHighlighted={false}
                  />
                  {/* プレビュー表示（テーマ色でパルス） */}
                  {isPreview && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80%',
                        height: '80%',
                        borderRadius: '50%',
                        background: `${getPreviewColor()}33`,
                        border: `2px solid ${getPreviewColor()}66`,
                        animation: 'pulse 1s infinite',
                      }}
                    />
                  )}
                  {/* 最新のコマに白い点を表示 */}
                  {isLatestMove && cell.state !== 'empty' && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.9)',
                        boxShadow: '0 0 4px rgba(0, 0, 0, 0.3)',
                        zIndex: 5,
                      }}
                    />
                  )}
                </div>
  </div>
);
          })
        )}
      </div>
      
      {/* プレビュー用のCSSアニメーション */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.8;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 0.4;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};

export default GameGrid; 