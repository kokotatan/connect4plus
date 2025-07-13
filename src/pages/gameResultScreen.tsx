import React from 'react';

interface PlayerInfo {
  name: string;
  avatar: string;
  score: number;
  isTurn: boolean;
  timer: number;
  isActive: boolean;
  type: 'graycat' | 'tiger';
}

interface GameResultScreenProps {
  player1: PlayerInfo;
  player2: PlayerInfo;
  gameResult: 'win' | 'lose' | 'draw';
  winner?: string;
  onRematch?: () => void;
  gameBoard?: any[][]; // 最終的なゲームボードの状態
}

export default function GameResultScreen({ 
  player1,
  player2,
  gameResult,
  winner,
  onRematch,
  gameBoard
}: GameResultScreenProps) {
  // ゲームボードの列をレンダリング（結果表示用）
  const renderColumn = (columnIndex: number) => {
    return (
      <div key={columnIndex} className="w-10 h-96 relative">
        {/* ハイライト背景 */}
        <div className="w-10 h-96 absolute bg-emerald-300"></div>
        
        {/* 各セル（結果表示用） */}
        {Array.from({ length: 8 }, (_, rowIndex) => (
          <div 
            key={rowIndex}
            className="w-10 h-10 absolute bg-stone-50 rounded-full"
            style={{ top: `${rowIndex * 45}px` }}
          >
            {/* 実際のゲームボードの状態に応じてセルを表示 */}
            {gameBoard && gameBoard[rowIndex] && gameBoard[rowIndex][columnIndex] && (
              <div className={`w-10 h-10 rounded-full ${
                gameBoard[rowIndex][columnIndex].state === 'empty' ? 'bg-stone-50' :
                gameBoard[rowIndex][columnIndex].state === 'normal' ? 
                  (gameBoard[rowIndex][columnIndex].player === 'player1' ? 'bg-blue-800' : 'bg-green-700') :
                'bg-stone-50'
              }`}></div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // スコアゲージのレンダリング
  const renderScoreGauge = (score: number) => {
    const filledWidth = Math.min(score, 3) * (20 / 3); // 20pxを3分割
    
    return (
      <div className="w-20 h-5 relative">
        <div className="w-20 h-5 absolute bg-green-100 rounded-[50px]"></div>
        <div className="w-5 h-5 left-[19.43px] top-0 absolute bg-green-200"></div>
        <div 
          className="h-5 absolute bg-green-200 rounded-[50px] transition-all duration-300"
          style={{ width: `${filledWidth}px` }}
        ></div>
      </div>
    );
  };

  // 結果メッセージの取得
  const getResultMessage = () => {
    switch (gameResult) {
      case 'win':
        return `${winner}の勝利!!!!`;
      case 'lose':
        return `${winner}の勝利!!!!`;
      case 'draw':
        return 'Draw!!!!';
      default:
        return '';
    }
  };

  // 結果アバターの表示
  const renderResultAvatars = () => {
    if (gameResult === 'draw') {
      return (
        <>
          {/* Player1アバター */}
          <div className="w-24 h-24 left-[44px] top-[380px] absolute">
            <img 
              className="w-24 h-24 left-0 top-0 absolute" 
              src={player1.avatar} 
              alt="Player 1 Avatar"
            />
          </div>
          {/* Player2アバター */}
          <div className="w-24 h-24 left-[246px] top-[380px] absolute">
            <img 
              className="w-24 h-24 left-0 top-0 absolute" 
              src={player2.avatar} 
              alt="Player 2 Avatar"
            />
          </div>
        </>
      );
    } else {
      // 勝利者のアバターのみ表示
      const winnerPlayer = winner === player1.name ? player1 : player2;
      return (
        <div className="w-24 h-24 left-[145px] top-[380px] absolute">
          <img 
            className="w-24 h-24 left-0 top-0 absolute" 
            src={winnerPlayer.avatar} 
            alt="Winner Avatar"
          />
        </div>
      );
    }
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
        <div className="w-44 h-20 left-[20px] top-[76px] absolute opacity-70">
          {/* ターンインジケーター */}
          <div className="w-24 h-1.5 left-[70px] top-[53px] absolute bg-zinc-300"></div>
          
          {/* タイマー */}
          <div className="w-20 h-5 left-[70px] top-[33px] absolute">
            <div className="w-11 h-3.5 left-0 top-0 absolute justify-center text-gray-600 text-xl font-semibold font-['Noto_Sans'] leading-loose">
              {Math.floor(player1.timer / 60).toString().padStart(2, '0')}:{(player1.timer % 60).toString().padStart(2, '0')}
            </div>
          </div>
          
          {/* オンライン状態 */}
          <div className="w-4 h-4 left-[121px] top-[31px] absolute">
            <div className="w-4 h-4 left-0 top-0 absolute bg-slate-600 rounded-full"></div>
          </div>
          
          {/* スコアゲージ */}
          <div className="w-20 h-5 left-0 top-[66px] absolute">
            {renderScoreGauge(player1.score)}
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
        <div className="w-44 h-24 left-[193px] top-[71px] absolute opacity-70">
          {/* スコアゲージ */}
          <div className="w-20 h-5 left-[102px] top-[71px] absolute">
            {renderScoreGauge(player2.score)}
          </div>
          
          {/* ターンインジケーター */}
          <div className="w-24 h-1.5 left-[23px] top-[58px] absolute bg-zinc-300"></div>
          
          {/* アバター背景 */}
          <div className="w-16 h-16 left-[118px] top-0 absolute bg-emerald-100 rounded-full"></div>
          
          {/* オンライン状態 */}
          <div className="w-4 h-4 left-[46px] top-[36px] absolute">
            <div className="w-4 h-4 left-0 top-0 absolute bg-emerald-400 rounded-full"></div>
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

        {/* リマッチボタン */}
        <button 
          onClick={onRematch}
          className="w-44 h-9 left-[21px] top-[573px] absolute bg-green-100 rounded-[50px] hover:bg-green-200 transition-colors"
        >
          <div className="w-32 h-6 left-[13px] top-[6px] absolute text-center justify-center text-black text-xl font-normal font-['Noto_Sans'] leading-[50px]">
            もう一度遊ぶ
          </div>
        </button>

        {/* Presented by */}
        <div className="w-64 h-3.5 left-[107px] top-[618px] absolute">
          <div className="w-64 h-3.5 left-0 top-0 absolute text-right justify-start text-gray-500 text-sm font-semibold font-['Noto_Sans'] leading-snug">
            Presented by Kotaro Design Lab.
          </div>
        </div>

        {/* 下部背景 */}
        <div className="w-96 h-72 left-0 top-[656px] absolute bg-zinc-300"></div>

        {/* 結果ポップアップ */}
        <div className="w-96 h-[672px] left-0 top-0 absolute overflow-hidden">
          {/* 結果アバター */}
          {renderResultAvatars()}
          
          {/* 結果メッセージ */}
          <div className="w-72 h-14 left-[57px] top-[325px] absolute">
            <div className="w-72 h-14 left-0 top-0 absolute text-center justify-start text-black text-6xl font-semibold font-['Noto_Sans'] leading-[50px]">
              {getResultMessage()}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 