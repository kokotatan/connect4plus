import React from 'react';
import { CellState } from '../types/game';
import Cell from './Cell';

export type GameGridProps = {
  board: CellState[][];
  highlightedColumn?: number | null;
  onColumnClick?: (col: number) => void;
  onColumnHover?: (col: number) => void;
  onColumnLeave?: () => void;
};

// カスタムカラー
const CELL_BG = '#F9FFF9';
const BOARD_BG = '#D9F2E1';
const BOARD_BORDER = '#55B89C';

const COLUMN_LEFT = [14, 59, 104, 149, 194, 239, 284]; // px
const CELL_TOP = [0, 45, 90, 135, 180, 225, 270, 315]; // px

export const GameGrid: React.FC<GameGridProps> = ({
  board,
  highlightedColumn = null,
  onColumnClick,
  onColumnHover,
  onColumnLeave,
}) => (
  <div className="w-80 h-96 relative" style={{ background: BOARD_BG, borderRadius: 20, border: `2px solid ${BOARD_BORDER}` }}>
    {/* 背景 */}
    <div className="w-80 h-96 left-0 top-0 absolute" style={{ background: BOARD_BG, borderRadius: 20 }} />
    {/* 各列 */}
    {board[0].map((_, colIdx) => (
      <div
        key={colIdx}
        className="w-10 h-96 absolute"
        style={{ left: COLUMN_LEFT[colIdx], top: 12, zIndex: 2, cursor: onColumnClick ? 'pointer' : 'default' }}
        onClick={() => onColumnClick && onColumnClick(colIdx)}
        onMouseEnter={() => onColumnHover && onColumnHover(colIdx)}
        onMouseLeave={() => onColumnLeave && onColumnLeave()}
      >
        <div className="w-10 h-96 left-0 top-0 absolute">
          {/* 各セル */}
          {board.map((row, rowIdx) => (
            <div
              key={rowIdx}
              className="w-10 h-10 absolute"
              style={{ top: CELL_TOP[rowIdx] }}
              data-state={row[colIdx].state}
              data-type={row[colIdx].state === 'normal' ? row[colIdx].player : row[colIdx].state}
            >
              <div className="w-10 h-10 left-0 top-0 absolute" style={{ background: CELL_BG, borderRadius: '50%' }}>
                <Cell
                  state={row[colIdx]}
                  isHighlighted={highlightedColumn === colIdx}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default GameGrid; 