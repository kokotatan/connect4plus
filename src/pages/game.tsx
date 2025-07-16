import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import GamePlayScreen from '../components/GamePlayScreen';
import { watchRoom, deleteRoom, RoomData } from '../utils/firebase';
import { GameSettings, DEFAULT_GAME_SETTINGS } from '../types/game';

export default function GamePage() {
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { roomId, player1Name, player2Name, firstTurn, winScore, timeLimit } = router.query;

  // ゲーム設定を構築
  const gameSettings: GameSettings = {
    winScore: winScore ? parseInt(winScore as string) as 1 | 3 | 5 : DEFAULT_GAME_SETTINGS.winScore,
    timeLimit: (timeLimit as 'none' | '30s' | '1m') || DEFAULT_GAME_SETTINGS.timeLimit,
  };

  useEffect(() => {
    if (!roomId || typeof roomId !== 'string') {
      alert('ルームIDが無効です');
      router.push('/');
      return;
    }

    // ルーム監視開始
    const unsubscribe = watchRoom(roomId, (data: RoomData | null) => {
      if (data) {
        setRoomData(data);
        setIsLoading(false);

        // ゲーム終了時
        if (data.status === 'finished') {
          // ゲーム終了処理
        }
      }
    });

    // クリーンアップ
    return () => {
      unsubscribe();
    };
  }, [roomId, router]);

  // ページ離脱時にルーム削除
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (roomId && typeof roomId === 'string') {
        deleteRoom(roomId);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [roomId]);

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-screen">
        <div className="text-lg font-semibold text-gray-600">ゲームを読み込み中...</div>
      </div>
    );
  }

  if (!roomData || !roomData.player2) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-screen">
        <div className="text-lg font-semibold text-red-600">対戦相手が見つかりません</div>
        <button
          onClick={() => router.push('/')}
          className="mt-4 px-6 py-2 bg-emerald-400 text-white rounded-full font-semibold"
        >
          ホームに戻る
        </button>
      </div>
    );
  }

  // プレイヤー情報を設定（firstTurnパラメータを優先）
  const initialTurn = firstTurn === 'player1' ? 'player1' : 'player2';
  // Firebaseに保存されたfirstTurnを優先、なければURLパラメータを使用
  const savedFirstTurn = roomData.gameState?.firstTurn;
  const currentTurn = roomData.gameState?.currentTurn || savedFirstTurn || initialTurn;
  
  const player1 = {
    name: roomData.player1.name,
    avatar: '/assets/Avater/Avater/normal_graycat.png',
    score: roomData.gameState?.player1Score || 0,
    isTurn: currentTurn === 'player1',
    timer: 0,
    isActive: true,
    type: 'graycat' as const,
  };

  const player2 = {
    name: roomData.player2.name,
    avatar: '/assets/Avater/Avater/normal_tiger.png',
    score: roomData.gameState?.player2Score || 0,
    isTurn: currentTurn === 'player2',
    timer: 0,
    isActive: true,
    type: 'tiger' as const,
  };

  return (
    <GamePlayScreen 
      player1={player1} 
      player2={player2} 
      roomId={roomId as string}
      isOnlineMode={true}
      gameSettings={gameSettings}
    />
  );
} 