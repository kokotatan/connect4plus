import React, { useState, useEffect } from 'react';

interface PlayerInfo {
  name: string;
  avatar: string;
  score: number;
  isTurn: boolean;
  timer: number;
  isActive: boolean;
}

interface GameScreenProps {
  player1: PlayerInfo;
  player2: PlayerInfo;
  onColumnClick?: (columnIndex: number) => void;
  onGameEnd?: (winner: string | null) => void;
}

export default function GameScreen({ 
  player1,
  player2,
  onColumnClick,
  onGameEnd
}: GameScreenProps) {
  const [gameBoard, setGameBoard] = useState<(string | null)[][]>(
    Array(8).fill(null).map(() => Array(7).fill(null))
  );
  const [highlightedColumn, setHighlightedColumn] = useState<number | null>(null);

  // ゲームボードの列をクリックした時の処理
  const handleColumnClick = (columnIndex: number) => {
    onColumnClick?.(columnIndex);
  };

  // マウスホバー時のハイライト処理
  const handleColumnHover = (columnIndex: number) => {
    setHighlightedColumn(columnIndex);
  };

  const handleColumnLeave = () => {
    setHighlightedColumn(null);
  };

  // ゲームボードの列をレンダリング
  const renderColumn = (columnIndex: number) => {
    const column = gameBoard.map(row => row[columnIndex]);
    const isHighlighted = highlightedColumn === columnIndex;

    return (
      <div 
        key={columnIndex}
        className="w-10 h-96 relative"
        onClick={() => handleColumnClick(columnIndex)}
        onMouseEnter={() => handleColumnHover(columnIndex)}
        onMouseLeave={handleColumnLeave}
      >
        {/* ハイライト背景 */}
        <div className={`w-10 h-96 absolute transition-colors duration-200 ${
          isHighlighted ? 'bg-emerald-300' : 'bg-emerald-300'
        }`}></div>
        
        {/* 各セル */}
        {column.map((cell, rowIndex) => (
          <div 
            key={rowIndex}
            className="w-10 h-10 absolute bg-stone-50 rounded-full"
            style={{ top: `${rowIndex * 45}px` }}
          >
            {cell && (
              <div className={`w-10 h-10 rounded-full ${
                cell === 'player1' ? 'bg-red-500' : 'bg-blue-500'
              }`}></div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-center bg-stone-50">
      <div className="w-96 h-[953px] relative bg-white overflow-hidden rounded-2xl shadow-xl">
        {/* タイトルバー */}
        <div className="w-96 h-[953px] left-0 top-0 absolute">
          <div className="w-96 h-[953px] left-0 top-0 absolute bg-stone-50"></div>
          <div className="w-44 h-4 left-[103px] top-[42px] absolute text-center justify-start text-gray-500 text-xs font-semibold font-['Noto_Sans'] leading-snug">
            次世代方立体四目並べ
          </div>
          <div className="w-44 h-4 left-[103px] top-[19px] absolute text-center justify-start text-black text-2xl font-semibold font-['Noto_Sans'] leading-snug">
            connect4plus
          </div>
        </div>

        {/* Player1情報 */}
        <div className={`w-44 h-20 left-[20px] top-[76px] absolute ${player1.isTurn ? 'opacity-100' : 'opacity-70'}`}>
          {/* ターンインジケーター */}
          <div className={`w-24 h-1.5 left-[70px] top-[53px] absolute ${
            player1.isTurn ? 'bg-emerald-400' : 'bg-zinc-300'
          }`}></div>
          
          {/* タイマー */}
          <div className="w-20 h-5 left-[70px] top-[33px] absolute">
            <div className="w-11 h-3.5 left-0 top-0 absolute justify-center text-gray-600 text-xl font-semibold font-['Noto_Sans'] leading-loose">
              {Math.floor(player1.timer / 60).toString().padStart(2, '0')}:{(player1.timer % 60).toString().padStart(2, '0')}
            </div>
          </div>
          
          {/* オンライン状態 */}
          <div className="w-4 h-4 left-[121px] top-[31px] absolute">
            <div className={`w-4 h-4 left-0 top-0 absolute rounded-full ${
              player1.isActive ? 'bg-emerald-400' : 'bg-slate-600'
            }`}></div>
          </div>
          
          {/* スコアゲージ */}
          <div className="w-20 h-5 left-0 top-[66px] absolute">
            <div className="w-20 h-5 left-0 top-0 absolute bg-green-100 rounded-[50px]"></div>
            <div className="w-5 h-5 left-[19.43px] top-0 absolute bg-green-200"></div>
            <div className="w-7 h-5 left-0 top-0 absolute bg-green-200 rounded-[50px]"></div>
          </div>
          
          {/* アバター背景 */}
          <div className="w-16 h-16 left-[3px] top-0 absolute bg-emerald-100 rounded-full"></div>
          
          {/* アバター */}
          <img 
            className="w-16 h-16 left-[3px] top-0 absolute" 
            src={player1.avatar} 
            alt="Player 1 Avatar"
          />
          
          {/* プレイヤー名 */}
          <div className="w-28 h-7 left-[70px] top-[-2px] absolute">
            <div className="w-28 h-7 left-0 top-0 absolute justify-center text-black text-2xl font-semibold font-['Noto_Sans'] leading-[50px]">
              {player1.name}
            </div>
          </div>
        </div>

        {/* Player2情報 */}
        <div className={`w-44 h-24 left-[193px] top-[71px] absolute ${player2.isTurn ? 'opacity-100' : 'opacity-70'}`}>
          {/* スコアゲージ */}
          <div className="w-20 h-5 left-[102px] top-[71px] absolute">
            <div className="w-20 h-5 left-0 top-0 absolute bg-green-100 rounded-[50px]"></div>
            <div className="w-5 h-5 left-[19.43px] top-0 absolute bg-green-200"></div>
            <div className="w-7 h-5 left-0 top-0 absolute bg-green-200 rounded-[50px]"></div>
          </div>
          
          {/* ターンインジケーター */}
          <div className={`w-24 h-1.5 left-[23px] top-[58px] absolute ${
            player2.isTurn ? 'bg-emerald-400' : 'bg-zinc-300'
          }`}></div>
          
          {/* アバター背景 */}
          <div className="w-16 h-16 left-[118px] top-0 absolute bg-emerald-100 rounded-full"></div>
          
          {/* オンライン状態 */}
          <div className="w-4 h-4 left-[46px] top-[36px] absolute">
            <div className={`w-4 h-4 left-0 top-0 absolute rounded-full ${
              player2.isActive ? 'bg-emerald-400' : 'bg-slate-600'
            }`}></div>
          </div>
          
          {/* タイマー */}
          <div className="w-20 h-6 left-[69px] top-[36px] absolute">
            <div className="w-11 h-4 left-0 top-0 absolute text-right justify-center text-gray-600 text-xl font-semibold font-['Noto_Sans'] leading-loose">
              {Math.floor(player2.timer / 60).toString().padStart(2, '0')}:{(player2.timer % 60).toString().padStart(2, '0')}
            </div>
          </div>
          
          {/* アバター */}
          <img 
            className="w-16 h-16 left-[118px] top-0 absolute" 
            src={player2.avatar} 
            alt="Player 2 Avatar"
          />
          
          {/* プレイヤー名 */}
          <div className="w-28 h-7 left-[-2px] top-[2px] absolute">
            <div className="w-28 h-7 left-0 top-0 absolute text-right justify-center text-black text-2xl font-semibold font-['Noto_Sans'] leading-[50px]">
              {player2.name}
            </div>
          </div>
        </div>

        {/* ゲームボード */}
        <div className="w-80 h-96 left-[27px] top-[184px] absolute">
          <div className="w-80 h-96 left-0 top-0 absolute bg-green-100 rounded-[20px]"></div>
          
          {/* 7列のゲームボード */}
          {Array.from({ length: 7 }, (_, i) => renderColumn(i))}
        </div>

        {/* Game Start メッセージ */}
        <div className="w-72 h-80 left-[53px] top-[238px] absolute">
          <div className="w-72 h-72 left-0 top-[19px] absolute">
            <img 
              className="w-72 h-72 left-0 top-0 absolute" 
              src="https://placehold.co/286x286" 
              alt="Game Start Illustration"
            />
          </div>
          <div className="w-64 h-9 left-[17px] top-0 absolute text-center justify-start text-black text-4xl font-semibold font-['Noto_Sans'] leading-snug">
            Game Start!!!!!
          </div>
        </div>

        {/* Presented by */}
        <div className="w-64 h-3.5 left-[107px] top-[618px] absolute">
          <div className="w-64 h-3.5 left-0 top-0 absolute text-right justify-start text-gray-500 text-sm font-semibold font-['Noto_Sans'] leading-snug">
            Presented by Kotaro Design Lab.
          </div>
        </div>

        {/* 下部背景 */}
        <div className="w-96 h-72 left-0 top-[656px] absolute bg-zinc-300"></div>
      </div>
    </main>
  );
} 