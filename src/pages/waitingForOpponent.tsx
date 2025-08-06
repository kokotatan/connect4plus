import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { watchRoom, getPlayerInfo, RoomData } from '../utils/firebase';
import RulesPopup from '../components/RulesPopup';
import { BGMControlButton } from '../components/BGMControlButton';
import { useBGM } from '../contexts/BGMContext';
import { ref, set, onValue, off, update } from 'firebase/database';
import { db } from '../utils/firebase';
import { createEmptyBoard } from '../utils/gameLogic';
import { GameSettings, DEFAULT_GAME_SETTINGS } from '../types/game';
import { truncatePlayerName } from '../utils/textUtils';

const GRAYCAT_PLAYING = '/assets/Avater/PosingAvater/graycat_playing.png';
const TIGER_PLAYING = '/assets/Avater/PosingAvater/tiger_playing.png';
const GRAYCAT_CASTLE = '/assets/Avater/PosingAvater/graycatcastle.png';
const TIGER_CASTLE = '/assets/Avater/PosingAvater/tigercastle.png';
const CONNECT4_IMAGE = '/assets/photo/connect4.png';

const AVATAR_IMAGES = [
  GRAYCAT_PLAYING,
  GRAYCAT_CASTLE,
  TIGER_CASTLE,
  TIGER_PLAYING,
];
const AVATAR_WIDTH = 64; // px
const AVATAR_GAP = 16; // px
const setLength = AVATAR_IMAGES.length;
const setWidth = setLength * AVATAR_WIDTH + (setLength - 1) * AVATAR_GAP;

const keyframes = `
@keyframes marqueeAnim {
  0% { transform: translateX(0); }
  100% { transform: translateX(-${setWidth}px); }
}
`;

const marqueeStyle: React.CSSProperties = {
  width: setWidth,
  overflow: 'hidden',
  position: 'relative',
  height: AVATAR_WIDTH,
  marginBottom: 16,
};
const marqueeInnerStyle: React.CSSProperties = {
  display: 'flex',
  width: setWidth * 2,
  animation: `marqueeAnim 12s linear infinite`,
  alignItems: 'center',
};

export default function WaitingForOpponentScreen() {
  // useState/useEffectを最上部にまとめる
  const [showRules, setShowRules] = useState(false);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gameStarting, setGameStarting] = useState(false);
  const [lotteryPhase, setLotteryPhase] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const router = useRouter();
  const { switchToGameBGM, fadeOut, fadeIn } = useBGM();
  const { roomId, player1Name, player2Name, winScore, timeLimit } = router.query;
  const playerInfo = getPlayerInfo();
  const mySessionId = playerInfo?.sessionId;
  const currentPlayerType = playerInfo?.isPlayer1 ? 'player1' : 'player2';
  const [readyState, setReadyState] = useState<{ player1: boolean; player2: boolean }>({ player1: false, player2: false });

  // デバッグ情報を出力
  console.log('プレイヤー情報:', {
    playerInfo: playerInfo,
    mySessionId: mySessionId,
    currentPlayerType: currentPlayerType,
    roomId: roomId
  });

  // ゲーム設定を構築（Firebaseから取得した設定を優先）
  const gameSettings: GameSettings = {
    winScore: roomData?.gameSettings?.winScore || (winScore ? parseInt(winScore as string) as 1 | 3 | 5 : DEFAULT_GAME_SETTINGS.winScore),
    timeLimit: roomData?.gameSettings?.timeLimit || (timeLimit as 'none' | '30s' | '1m') || DEFAULT_GAME_SETTINGS.timeLimit,
  };

  // ルーム監視
  useEffect(() => {
    if (!roomId || typeof roomId !== 'string') {
      alert('ルームIDが無効です');
      router.push('/');
      return;
}
    // ルーム監視開始
    const unsubscribe = watchRoom(roomId, (data: RoomData | null) => {
      console.log('watchRoom data:', data); // デバッグ用
      console.log('mySessionId:', mySessionId); // デバッグ用
      if (data) {
        console.log('ルームデータ更新:', {
          player1: data.player1,
          player2: data.player2,
          status: data.status,
          hasPlayer2: !!data.player2,
          player2HasSessionId: !!(data.player2 && data.player2.sessionId)
        });
        setRoomData(data);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [roomId, router, mySessionId]);

  // ready監視
  useEffect(() => {
    if (!roomId) return;
    const readyRef = ref(db, `rooms/${roomId}/ready`);
    const unsubscribe = onValue(readyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setReadyState({
          player1: !!data.player1,
          player2: !!data.player2
        });
        
        // 両者が準備完了かつゲーム開始していない場合のみ処理
        if (data.player1 && data.player2 && roomData && roomData.player1 && roomData.player2 && !gameStarting) {
          console.log('両者準備完了、ゲーム開始処理を開始');
          
          // ゲームスタート前にフェードアウト
          fadeOut(1000); // 1秒でフェードアウト
          
          // ゲーム開始時にBGMを切り替え
          switchToGameBGM();
          
          // ゲーム開始前にゲーム状態をリセット
          const gameStateRef = ref(db, `rooms/${roomId}/gameState`);
          const initialBoard = createEmptyBoard();
          const firstTurn = Math.random() < 0.5 ? 'player1' : 'player2';
          
          set(gameStateRef, {
            board: initialBoard,
            currentTurn: firstTurn,
            firstTurn: firstTurn, // 抽選結果を明示的に保存
            player1Score: 0,
            player2Score: 0,
            player1Name: roomData.player1.name || '',
            player2Name: roomData.player2.name || '',
            gameOver: false,
            winner: null
          }).then(() => {
            console.log('ゲーム状態初期化完了');
            setGameStarting(true);
            setTimeout(() => {
              setLotteryPhase(true);
              setSelectedPlayer(firstTurn);
            }, 1500);
            setTimeout(() => {
              // ゲーム開始時にフェードイン
              setTimeout(() => {
                fadeIn(2000); // 2秒でフェードイン
              }, 100);
              
              router.push(`/game?roomId=${roomId}&player1Name=${encodeURIComponent(roomData.player1.name || '')}&player2Name=${encodeURIComponent(roomData.player2?.name || '')}&firstTurn=${firstTurn}&winScore=${gameSettings.winScore}&timeLimit=${gameSettings.timeLimit}`);
            }, 4000);
          }).catch((error) => {
            console.error('ゲーム状態初期化エラー:', error);
          });
        }
      } else {
        setReadyState({ player1: false, player2: false });
      }
    });
    return () => off(readyRef);
  }, [roomId, roomData, gameStarting, router, switchToGameBGM, fadeOut, fadeIn]);

  // 2人揃ってゲームスタートボタンが表示される時にBGMを切り替え
  useEffect(() => {
    if (roomData && roomData.player2 && !gameStarting) {
      console.log('2人揃いました、ゲームBGMに切り替え');
      switchToGameBGM();
    }
  }, [roomData, gameStarting, switchToGameBGM]);

  // ページ離脱時にルーム削除（作成者のみ）
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (roomId && typeof roomId === 'string' && player1Name) {
        // deleteRoom(roomId); // deleteRoomはfirebase.tsから削除されたため、この行は削除
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [roomId, player1Name]);

  // ゲームスタートボタン押下
  const handleReady = () => {
    if (!roomId || !currentPlayerType) return;
    const readyRef = ref(db, `rooms/${roomId}/ready`);
    update(readyRef, {
      [currentPlayerType]: true
    });
  };

  // ここから条件付きreturn
  if (isLoading) {
    return (
      <Layout>
        <div className="w-full flex flex-col items-center justify-center min-h-screen">
          <div className="text-lg font-semibold text-gray-600">ルームに接続中...</div>
        </div>
      </Layout>
    );
  }

  if (!roomData) {
    return (
      <Layout>
        <div className="w-full flex flex-col items-center justify-center min-h-screen">
          <div className="text-lg font-semibold text-red-600">ルームが見つかりません</div>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-2 bg-emerald-400 text-white rounded-full font-semibold"
          >
            ホームに戻る
          </button>
        </div>
      </Layout>
    );
  }

  if (gameStarting) {
    return (
      <Layout>
        <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-emerald-100 to-white p-2 sm:p-0">
          <div className="text-center w-full max-w-xs sm:max-w-md mx-auto flex flex-col items-center">
            <div className="text-4xl sm:text-6xl font-extrabold text-emerald-600 mb-2 sm:mb-4 animate-bounce leading-tight">GAME START!</div>
            <div className="text-lg sm:text-2xl font-bold text-gray-700 mb-1 sm:mb-2 leading-tight">ゲーム開始！</div>
            {/* both_fighting画像を表示 */}
            <img src="/assets/Avater/PosingAvater/both_fighting.png" alt="両者ファイティング" className="w-28 h-28 sm:w-40 sm:h-40 object-contain mx-auto mb-2 sm:mb-4" />
            {/* 抽選演出 */}
            <div className="mb-4 sm:mb-6 w-full flex flex-col items-center">
              <div className="text-base sm:text-xl font-bold text-gray-700 mb-1 sm:mb-2">
                {lotteryPhase ? '先手が決まりました！' : '先手を抽選中...'}
              </div>
              <div className="flex justify-center items-center gap-4 sm:gap-8 mb-2 sm:mb-4 w-full">
                <div className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-base sm:text-lg font-bold transition-all duration-500 ${lotteryPhase && selectedPlayer === 'player1' ? 'bg-emerald-400 text-white scale-110 shadow-lg' : 'bg-gray-200 text-gray-600'}`} title={roomData?.player1.name}>{truncatePlayerName(roomData?.player1.name || '')}</div>
                <div className="text-lg sm:text-2xl font-bold text-gray-400">VS</div>
                <div className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-base sm:text-lg font-bold transition-all duration-500 ${lotteryPhase && selectedPlayer === 'player2' ? 'bg-emerald-400 text-white scale-110 shadow-lg' : 'bg-gray-200 text-gray-600'}`} title={roomData?.player2?.name}>{truncatePlayerName(roomData?.player2?.name || '')}</div>
              </div>
              <div className={`w-10 h-10 sm:w-16 sm:h-16 border-4 border-emerald-400 border-t-transparent rounded-full mx-auto ${lotteryPhase ? 'animate-pulse' : 'animate-spin'}`}></div>
            </div>
          </div>
          
          {/* 固定BGMコントロールボタン */}
          <div className="fixed bottom-4 right-4 z-50">
            <BGMControlButton size="medium" className="shadow-2xl hover:shadow-3xl" />
          </div>
        </div>
      </Layout>
    );
  }

  // player2がいない場合のみ「対戦相手の参加を待っています。」画面
  if (!roomData.player2) {
  return (
    <Layout>
      <style>{keyframes}</style>
      {/* タイトル・サブタイトル */}
        <div className="w-full flex flex-col items-center mb-2 mt-2 sm:mb-4">
          <h2 className="text-lg sm:text-2xl font-semibold text-black text-center leading-snug mb-1">対戦相手が参加するのを待っています</h2>
          <p className="text-xs sm:text-sm text-gray-500 font-semibold text-center leading-snug">お友達が参加するとゲームが始まります</p>
          {/* ルール説明ボタン */}
          <button
            onClick={() => setShowRules(true)}
            className="mt-2 sm:mt-4 px-4 py-2 bg-emerald-400 text-white rounded-full text-sm font-semibold shadow hover:bg-emerald-500 transition-colors"
          >
            📖 ルール説明
          </button>
      </div>
      {/* メインカード */}
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-xs sm:w-80 flex flex-col items-center px-3 sm:px-6 py-4 sm:py-6 mb-2 sm:mb-4">
        {/* 待機メッセージ */}
          <div className="text-black text-base sm:text-lg font-semibold text-center leading-snug mb-2">
            お友達がこのルームに参加するのを待っています。
          </div>
        {/* 横スクロールアバター（シームレス） */}
          <div style={marqueeStyle} className="mb-2 sm:mb-4">
          <div style={marqueeInnerStyle}>
            {[...AVATAR_IMAGES, ...AVATAR_IMAGES].map((src, i, arr) => {
              // gapを最後の画像以外にだけ適用
              const isLast = (i + 1) % setLength === 0;
              return (
                <img
                  key={i}
                  src={src}
                  alt={`avatar-${i}`}
                  style={{
                    width: AVATAR_WIDTH,
                    height: AVATAR_WIDTH,
                    objectFit: 'contain',
                    marginRight: isLast ? 0 : AVATAR_GAP,
                  }}
                />
              );
            })}
          </div>
        </div>
          {/* プレイヤー情報表示 */}
          <div className="text-base sm:text-lg text-black font-semibold text-center leading-snug mb-1">
            {truncatePlayerName(roomData.player1.name)}
        </div>
        {/* ルームID表示 */}
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-gray-500 text-xs font-semibold leading-snug">ルームID:</span>
          <span className="text-blue-500 text-base font-semibold leading-snug">{roomId}</span>
        </div>
          {/* 参加状況 */}
          <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
            この画面のまま、しばらくお待ちください。
          </div>
          {/* タイトルに戻るボタン */}
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-2 bg-gray-400 text-white rounded-full text-sm font-semibold shadow hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors min-h-[44px]"
            aria-label="タイトル画面に戻る"
          >
            タイトルに戻る
          </button>
        </div>
        {/* Connect4画像を白枠の下に配置 */}
        <div className="flex justify-center items-center w-full mt-2 mb-2">
          <img src={CONNECT4_IMAGE} alt="Connect4" className="w-28 h-28 sm:w-40 sm:h-40 object-contain" />
        </div>
        
        {/* ルール説明ポップアップ */}
        <RulesPopup isVisible={showRules} onClose={() => setShowRules(false)} />
        
        {/* 固定BGMコントロールボタン */}
        <div className="fixed bottom-4 right-4 z-50">
          <BGMControlButton size="medium" className="shadow-2xl hover:shadow-3xl" />
        </div>
        
      </Layout>
    );
  }

  // セッションIDの検証（プレイヤー2が参加している場合のみ）
  // プレイヤー2が参加した直後はsessionIdがまだ設定されていない可能性があるため、より安全な検証を行う
  const isPlayer1 = mySessionId === roomData.player1.sessionId;
  const isPlayer2 = roomData.player2 && roomData.player2.sessionId && mySessionId === roomData.player2.sessionId;
  
  // プレイヤー2が参加した直後は、プレイヤー1のセッションIDのみで検証
  const isValidSession = roomData.player1.sessionId && (
    isPlayer1 || 
    (roomData.player2 && isPlayer2) ||
    (roomData.player2 && !roomData.player2.sessionId && isPlayer1) // プレイヤー2が参加した直後は一時的にプレイヤー1のセッションIDのみで検証
  );
  
  console.log('セッションID検証詳細:', {
    player1SessionId: roomData.player1.sessionId,
    player2SessionId: roomData.player2?.sessionId,
    mySessionId: mySessionId,
    isPlayer1: isPlayer1,
    isPlayer2: isPlayer2,
    isValidSession: isValidSession,
    currentPlayerType: currentPlayerType,
    player2Joined: !!roomData.player2,
    player2HasSessionId: !!(roomData.player2 && roomData.player2.sessionId)
  });
  
  if (!isValidSession) {
    console.log('セッションID検証エラー:', {
      player1SessionId: roomData.player1.sessionId,
      player2SessionId: roomData.player2?.sessionId,
      mySessionId: mySessionId,
      isPlayer1Match: isPlayer1,
      isPlayer2Match: isPlayer2
    });
    return (
      <Layout>
        <div className="w-full flex flex-col items-center justify-center min-h-screen">
          <div className="text-lg font-semibold text-red-600">セッション情報が無効です</div>
          <div className="text-sm text-gray-600 mt-2">
            プレイヤー1: {roomData.player1.sessionId}<br/>
            プレイヤー2: {roomData.player2?.sessionId || '未設定'}<br/>
            自分のセッション: {mySessionId}
          </div>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-2 bg-emerald-400 text-white rounded-full font-semibold"
          >
            ホームに戻る
          </button>
        </div>
      </Layout>
    );
  }

  // 2人揃ったら「ゲームスタート」ボタンを表示
  if (roomData.player2) {
    return (
      <Layout>
        <style>{keyframes}</style>
        {/* タイトル・サブタイトル */}
        <div className="w-full flex flex-col items-center mb-2 mt-2 sm:mb-4">
          <h2 className="text-lg sm:text-2xl font-semibold text-black text-center leading-snug mb-1">対戦相手が参加しました！</h2>
          <p className="text-xs sm:text-sm text-gray-500 font-semibold text-center leading-snug">2人揃いました！ゲームスタートを押してください</p>
        </div>
        {/* メインカード */}
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-xs sm:w-80 flex flex-col items-center px-3 sm:px-6 py-4 sm:py-6 mb-2 sm:mb-4">
          {/* 横スクロールアバター（シームレス） */}
          <div style={marqueeStyle} className="mb-2 sm:mb-4">
            <div style={marqueeInnerStyle}>
              {[...AVATAR_IMAGES, ...AVATAR_IMAGES].map((src, i, arr) => {
                const isLast = (i + 1) % setLength === 0;
                return (
                  <img
                    key={i}
                    src={src}
                    alt={`avatar-${i}`}
                    style={{
                      width: AVATAR_WIDTH,
                      height: AVATAR_WIDTH,
                      objectFit: 'contain',
                      marginRight: isLast ? 0 : AVATAR_GAP,
                    }}
                  />
                );
              })}
            </div>
          </div>
          {/* プレイヤー情報表示 */}
          <div className="text-base sm:text-lg text-black font-semibold text-center leading-snug mb-1">
            {truncatePlayerName(roomData.player1.name)}
            {roomData.player2 && `、${roomData.player2.name}`}
          </div>
          {/* ルームID表示 */}
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-gray-500 text-xs font-semibold leading-snug">ルームID:</span>
            <span className="text-blue-500 text-base font-semibold leading-snug">{roomId}</span>
          </div>
          {/* 参加状況 */}
          <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
            2人揃いました！両方の「ゲームスタート」ボタンが押されるとゲームが始まります。
          </div>
          {/* ゲームスタートボタン */}
          {currentPlayerType && !readyState[currentPlayerType] && (
            <button
              onClick={handleReady}
              className="mt-4 sm:mt-8 px-6 sm:px-8 py-2 sm:py-3 bg-emerald-400 text-white rounded-full text-base sm:text-xl font-bold shadow hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors w-full min-h-[44px]"
              aria-label="ゲームを開始する準備ができました"
            >
              ゲームスタート
            </button>
          )}
          {/* 準備状況表示 */}
          <div className="flex gap-2 sm:gap-8 mt-4 sm:mt-6 w-full justify-center">
            <div className={`px-3 sm:px-6 py-2 sm:py-3 rounded-xl text-base sm:text-lg font-bold ${readyState.player1 ? 'bg-emerald-400 text-white' : 'bg-gray-200 text-gray-500'}`} title={roomData?.player1.name}>{truncatePlayerName(roomData?.player1.name || '')} {readyState.player1 ? '✔' : ''}</div>
            <div className={`px-3 sm:px-6 py-2 sm:py-3 rounded-xl text-base sm:text-lg font-bold ${readyState.player2 ? 'bg-emerald-400 text-white' : 'bg-gray-200 text-gray-500'}`} title={roomData?.player2?.name}>{truncatePlayerName(roomData?.player2?.name || '---')} {readyState.player2 ? '✔' : ''}</div>
          </div>
          {/* タイトルに戻るボタン */}
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-2 bg-gray-400 text-white rounded-full text-sm font-semibold shadow hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors min-h-[44px]"
            aria-label="タイトル画面に戻る"
          >
            タイトルに戻る
          </button>
      </div>
      {/* Connect4画像を白枠の下に配置 */}
      <div className="flex justify-center items-center w-full mt-2 mb-2">
          <img src={CONNECT4_IMAGE} alt="Connect4" className="w-28 h-28 sm:w-40 sm:h-40 object-contain" />
      </div>
        {/* ルール説明ポップアップ */}
        <RulesPopup isVisible={showRules} onClose={() => setShowRules(false)} />
        
        {/* 固定BGMコントロールボタン */}
        <div className="fixed bottom-4 right-4 z-50">
          <BGMControlButton size="medium" className="shadow-2xl hover:shadow-3xl" />
        </div>
        
    </Layout>
  );
  }

  // 2人揃ったら即ゲーム開始アニメーション（return不要、useEffectで遷移）
  // 画面は「対戦相手が参加しました！」などのまま、アニメーション→遷移
} 