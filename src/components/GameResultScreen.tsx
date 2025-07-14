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
  gameBoard: any[][]; // 最終的なゲームボードの状態
}

export default function GameResultScreen({ 
  player1,
  player2,
  gameResult,
  winner,
  onRematch,
  gameBoard
}: GameResultScreenProps) {
  // 結果アバター・テキストのレイアウト
  const isDraw = gameResult === 'draw';
  const isPlayer1Win = winner === player1.name;
  const isPlayer2Win = winner === player2.name;

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-stone-50">
      <div className="w-[500px] flex flex-col items-center mt-8 mb-2">
        <div className="text-3xl font-bold text-black">connect4plus</div>
        <div className="text-xs text-gray-500 mt-1">次世代方立体四目並べ</div>
      </div>
      {/* ゲーム盤面（終了時のまま） */}
      <div className="relative flex flex-col items-center">
        <div className="mb-2">
          <div className="w-80 h-96 relative">
            <div className="w-80 h-96 left-0 top-0 absolute rounded-[20px]" style={{ background: '#D9F2E1' }} />
            {/* 7列8行のセル */}
            {gameBoard[0].map((_, colIdx) => (
              <div key={colIdx} className="w-10 h-96 absolute" style={{ left: 14 + 45 * colIdx, top: 12 }}>
                <div className="w-10 h-96 left-0 top-0 absolute">
                  {gameBoard.map((row, rowIdx) => (
                    <div key={rowIdx} className="w-10 h-10 absolute" style={{ top: 45 * rowIdx }}>
                      <div className="w-10 h-10 left-0 top-0 absolute rounded-full" style={{ background: row[colIdx].state === 'empty' ? '#F9FFF9' : row[colIdx].player === 'player1' ? '#4D6869' : '#55B89C', opacity: row[colIdx].state === 'empty' ? 0.3 : 1 }}></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* 結果表示レイヤー */}
        <div className="absolute left-0 top-0 w-80 h-96 pointer-events-none">
          {/* 勝ち・負け・引き分けのアバター・テキスト配置 */}
          {isDraw ? (
            <>
              <div data-emotion="normal" data-result="draw" data-type="graycat" className="w-24 h-24 left-[44px] top-[180px] absolute">
                <img className="w-24 h-24 left-0 top-0 absolute" src={player1.avatar} />
              </div>
              <div data-emotion="normal" data-result="draw" data-type="tiger" className="w-24 h-24 left-[246px] top-[180px] absolute">
                <img className="w-24 h-24 left-0 top-0 absolute" src={player2.avatar} />
              </div>
              <div className="w-72 h-14 left-[57px] top-[125px] absolute">
                <div className="w-72 h-14 left-0 top-0 absolute text-center justify-start text-black text-6xl font-semibold font-['Noto_Sans'] leading-[50px]">Draw!!!!</div>
              </div>
            </>
          ) : isPlayer1Win ? (
            <>
              <div data-emotion="happy" data-result="win" data-type="graycat" className="w-64 h-64 left-[16px] top-[62px] absolute">
                <img className="w-64 h-64 left-0 top-0 absolute" src={player1.avatar} />
              </div>
              <div data-emotion="crying" data-result="lose" data-type="tiger" className="w-16 h-16 left-[264px] top-[207px] absolute">
                <img className="w-16 h-16 left-0 top-0 absolute" src={player2.avatar} />
              </div>
              <div data-result="graycat" data-visible="true" className="w-32 h-16 left-0 top-[31px] absolute">
                <div className="w-28 h-10 left-0 top-[30.90px] absolute origin-top-left rotate-[-15deg] justify-start text-black text-3xl font-semibold font-['Noto_Sans'] leading-[50px]">Winner!!</div>
              </div>
              <div data-result="tiger" data-visible="false" className="w-32 h-16 left-[290px] top-[157px] absolute">
                <div className="w-20 h-10 left-[10.76px] top-0 absolute origin-top-left rotate-[15deg] justify-start text-black text-3xl font-semibold font-['Noto_Sans'] leading-[50px]">lose...</div>
              </div>
            </>
          ) : (
            <>
              <div data-emotion="crying" data-result="lose" data-type="graycat" className="w-16 h-16 left-[47px] top-[207px] absolute">
                <img className="w-16 h-16 left-0 top-0 absolute" src={player1.avatar} />
              </div>
              <div data-emotion="happy" data-result="win" data-type="tiger" className="w-64 h-64 left-[113px] top-[49px] absolute">
                <img className="w-64 h-64 left-0 top-0 absolute" src={player2.avatar} />
              </div>
              <div data-result="graycat" data-visible="false" className="w-32 h-16 left-0 top-[244px] absolute">
                <div className="w-20 h-10 left-[35px] top-[21.47px] absolute origin-top-left rotate-[-15deg] justify-start text-black text-3xl font-semibold font-['Noto_Sans'] leading-[50px]">lose...</div>
              </div>
              <div data-result="tiger" data-visible="true" className="w-32 h-16 left-[271px] top-[30px] absolute">
                <div className="w-28 h-10 left-[10.76px] top-0 absolute origin-top-left rotate-[15deg] justify-start text-black text-3xl font-semibold font-['Noto_Sans'] leading-[50px]">Winner!!</div>
              </div>
            </>
          )}
        </div>
        {/* 再戦ボタン */}
        <div className="flex justify-center w-full mt-4">
          <button onClick={onRematch} className="px-8 py-2 bg-emerald-400 text-white rounded-full text-lg font-semibold shadow hover:bg-emerald-500 transition-colors">
            もう一度遊ぶ
          </button>
        </div>
      </div>
      {/* Presented by */}
      <div className="w-full flex justify-center mt-4 mb-2">
        <div className="text-sm text-gray-500 font-semibold">Presented by Kotaro Design Lab.</div>
      </div>
    </div>
  );
} 