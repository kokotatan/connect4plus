import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { AILevel, getAllAICharacters, getAICharacter } from '../utils/aiLogic';
import { generateRoomId, createRoom, joinRoom, checkRoomExists, testFirebaseConnection } from '../utils/firebase';
import RulesPopup from '../components/RulesPopup';
import AICharacterPopup from '../components/AICharacterPopup';
import GameSettingsPanel from '../components/GameSettingsPanel';
import { BGMControlButton } from '../components/BGMControlButton';
import { ThemeSelector } from '../components/ThemeSelector';
import { GameSettings, DEFAULT_GAME_SETTINGS } from '../types/game';
import { useBGM } from '../contexts/BGMContext';
import { useTheme } from '../contexts/ThemeContext';

export default function HomePage() {
  const [player1Name, setPlayer1Name] = useState('');
  const [roomId, setRoomId] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [aiPlayerName, setAiPlayerName] = useState('');
  const [aiLevel, setAiLevel] = useState<AILevel>(AILevel.BEGINNER);
  const [showRules, setShowRules] = useState(false);
  const [showCharacterPopup, setShowCharacterPopup] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<AILevel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean | null>(null);
  const [gameSettings, setGameSettings] = useState<GameSettings>(DEFAULT_GAME_SETTINGS);
  const router = useRouter();
  const { switchToHomeBGM, fadeIn } = useBGM();
  const { currentTheme } = useTheme();

  // 招待URLから来た場合は/joinRoomにリダイレクト
  useEffect(() => {
    if (router.isReady && router.query.roomId && typeof router.query.roomId === 'string') {
      router.replace(`/joinRoom?roomId=${router.query.roomId}`);
    }
  }, [router.isReady, router.query.roomId]);

  // URLパラメータから名前を復元し、AI戦セクションにスクロール
  useEffect(() => {
    if (router.isReady) {
      // 名前の復元
      if (router.query.playerName && typeof router.query.playerName === 'string') {
        setAiPlayerName(decodeURIComponent(router.query.playerName));
      }
      
      // ゲーム設定の復元
      if (router.query.winScore && typeof router.query.winScore === 'string') {
        const winScore = parseInt(router.query.winScore) as 1 | 3 | 5;
        if ([1, 3, 5].includes(winScore)) {
          setGameSettings(prev => ({ ...prev, winScore }));
        }
      }
      
      if (router.query.timeLimit && typeof router.query.timeLimit === 'string') {
        const timeLimit = router.query.timeLimit as 'none' | '30s' | '1m';
        if (['none', '30s', '1m'].includes(timeLimit)) {
          setGameSettings(prev => ({ ...prev, timeLimit }));
        }
      }
      
      // AI戦セクションへのスクロール
      if (router.query.scrollToAI === 'true') {
        setTimeout(() => {
          document.getElementById('ai-title')?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
      }
    }
  }, [router.isReady, router.query.playerName, router.query.scrollToAI, router.query.winScore, router.query.timeLimit]);

  // Firebase接続テスト
  useEffect(() => {
    const testConnection = async () => {
      try {
        const connected = await testFirebaseConnection();
        setFirebaseConnected(connected);
        console.log('Firebase接続状態:', connected);
      } catch (error) {
        console.error('Firebase接続テストエラー:', error);
        setFirebaseConnected(false);
      }
    };
    testConnection();
  }, []);

  // URLパラメータからルームIDを取得
  useEffect(() => {
    if (router.query.roomId && typeof router.query.roomId === 'string') {
      setRoomId(router.query.roomId.toUpperCase());
    }
  }, [router.query.roomId]);

  // アバター画像パス
  const graycatMuscle = '/assets/Avater/PosingAvater/graycat_muscle.png';
  const graycatTraining = '/assets/Avater/PosingAvater/graycat_training.png';
  const tigerMuscle = '/assets/Avater/PosingAvater/tiger_muscle.png';
  const tigerTraining = '/assets/Avater/PosingAvater/tiger_training.png';

  const handleCreateRoom = async () => {
    if (player1Name.trim()) {
      setIsLoading(true);
      try {
        const newRoomId = generateRoomId();
        // テーマ設定とゲーム設定を含めてルームを作成
        await createRoom(newRoomId, player1Name.trim(), currentTheme, gameSettings);
        console.log('ルーム作成完了:', { roomId: newRoomId, playerName: player1Name.trim(), theme: currentTheme, gameSettings });
        // ゲーム設定を含めてroomCreatedに遷移
        router.push(`/roomCreated?roomId=${newRoomId}&player1Name=${encodeURIComponent(player1Name.trim())}&winScore=${gameSettings.winScore}&timeLimit=${gameSettings.timeLimit}`);
      } catch (error) {
        alert('ルーム作成エラー: ' + (error instanceof Error ? error.message : String(error)));
        setIsLoading(false);
      }
    }
  };

  const handleJoinRoom = async () => {
    if (roomId.trim() && player2Name.trim()) {
      setIsLoading(true);
      try {
        const exists = await checkRoomExists(roomId.trim());
        if (!exists) {
          alert('ルームが存在していません。');
          return;
        }
        
        await joinRoom(roomId.trim(), player2Name.trim());
        router.push(`/waitingForOpponent?roomId=${roomId.trim()}&player2Name=${encodeURIComponent(player2Name.trim())}`);
      } catch (error) {
        console.error('ルーム参加エラー:', error);
        if (error instanceof Error) {
          alert(error.message);
      } else {
          alert('ルーム参加に失敗しました。もう一度お試しください。');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleStartAIGame = () => {
    if (aiPlayerName.trim()) {
      router.push(`/aiGame?playerName=${encodeURIComponent(aiPlayerName.trim())}&aiLevel=${aiLevel}&winScore=${gameSettings.winScore}&timeLimit=${gameSettings.timeLimit}`);
    }
  };

  const handleShowCharacterDetails = (level: AILevel) => {
    setSelectedCharacter(level);
    setShowCharacterPopup(true);
  };

  const aiCharacters = getAllAICharacters();

  return (
    <>
      <Head>
        <title>Connect4Plus - 次世代型立体四目並べ | 無料オンラインゲーム</title>
        <meta name="description" content="Connect4Plusは次世代型立体四目並べゲームです。オンライン対戦、AI対戦、オフライン対戦が楽しめます。無料でプレイ可能、スマホ・PC対応。" />
        <meta name="keywords" content="四目並べ,connect4,オンラインゲーム,AI対戦,無料ゲーム,パズルゲーム,対戦ゲーム,スマホゲーム" />
        <link rel="canonical" href="https://connect4plus.vercel.app/" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-emerald-100 to-white flex flex-col justify-center items-center font-noto py-6 px-2">
      <div className="w-full max-w-md flex flex-col items-center gap-2">
        <div className="mb-2">
          <h1 className="text-4xl font-extrabold text-black text-center tracking-tight drop-shadow-sm">connect4plus</h1>
          <p className="text-lg text-gray-500 font-semibold text-center mt-1">次世代型立体四目並べ</p>
          {/* Firebase接続状態表示 */}
          {firebaseConnected !== null && (
            <div className={`text-sm font-semibold text-center mt-2 ${firebaseConnected ? 'text-green-600' : 'text-red-600'}`}>
              {firebaseConnected ? '🟢 オンライン接続済み' : '🔴 オフライン状態'}
            </div>
          )}
        </div>

        {/* ページ内移動ボタン */}
        <div className="flex flex-row gap-2 w-full max-w-md mb-0">
          <button
            onClick={() => document.getElementById('online-title')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-1 px-3 py-2 bg-blue-300 text-white rounded-full text-sm font-semibold shadow hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors min-h-[44px]"
            aria-label="オンライン対戦セクションに移動"
          >
            オンライン戦
          </button>
          <button
            onClick={() => document.getElementById('ai-title')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-1 px-3 py-2 bg-purple-300 text-white rounded-full text-sm font-semibold shadow hover:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-colors min-h-[44px]"
            aria-label="AI対戦セクションに移動"
          >
            AI戦
          </button>
          <button
            onClick={() => document.getElementById('offline-title')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-1 px-3 py-2 bg-orange-300 text-white rounded-full text-sm font-semibold shadow hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors min-h-[44px]"
            aria-label="オフライン対戦セクションに移動"
          >
            オフライン戦
          </button>
        </div>

        {/* ルール説明ボタン */}
        <button
          onClick={() => setShowRules(true)}
          className="w-full max-w-md px-4 py-1.5 bg-emerald-300 text-white rounded-full text-sm font-semibold shadow hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-colors min-h-[36px] mb-0"
          aria-label="ゲームルールを表示"
        >
          ルール説明
        </button>

        {/* 区切り線 */}
        <div className="w-full max-w-md border-t border-gray-300 my-2"></div>

        {/* オンライン対戦タイトル */}
        <div id="online-title" className="w-full text-center mb-0">
          <h2 className="text-2xl font-bold text-blue-600">オンライン対戦</h2>
        </div>
        {/* 新規ルーム作成カード */}
        <div id="online-battle" className="bg-gradient-to-br from-white via-emerald-50 to-emerald-100 rounded-3xl shadow-xl py-8 px-7 w-full flex flex-col items-center gap-4 mb-1">
          <p className="text-lg text-black font-bold text-center">新規でルームを作成する方はこちら</p>
          <div className="w-full flex flex-col items-center gap-2">
            <label className="block w-full text-lg font-bold text-gray-800 text-center mb-1">名前を入力してください。</label>
            <div className="flex w-full justify-between items-end mb-2">
              <img src={graycatMuscle} alt="User 1" className="w-28 h-32 object-contain -ml-2" />
              <img src={graycatTraining} alt="User 1 Training" className="w-20 h-20 object-contain -mr-2" />
            </div>
            <input
              type="text"
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value)}
              placeholder="User 1"
              className="w-full max-w-xs h-12 bg-gray-50 rounded-xl border-2 border-gray-200 px-4 text-lg font-bold focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition placeholder-gray-400 mb-2"
            />
            <button
              onClick={handleCreateRoom}
              disabled={!player1Name.trim() || isLoading || firebaseConnected === false}
              className="w-full max-w-xs h-12 bg-gradient-to-r from-lime-400 to-emerald-400 text-white text-lg font-extrabold tracking-wide rounded-xl shadow hover:scale-105 active:scale-95 hover:from-lime-500 hover:to-emerald-500 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed drop-shadow-md"
            >
              {isLoading ? '作成中...' : firebaseConnected === false ? '接続エラー' : 'ルームを作成する。'}
            </button>
          </div>
        </div>
        {/* 既存ルーム参加カード */}
        <div className="bg-gradient-to-br from-white via-emerald-50 to-emerald-100 rounded-3xl shadow-xl py-8 px-7 w-full flex flex-col items-center gap-4 mb-4">
          <p className="text-lg text-black font-bold text-center">既存のルームに参加する方はこちら</p>
          <div className="w-full flex flex-col items-center gap-2">
            <label className="block w-full text-lg font-bold text-gray-800 text-center mb-1">ルームIDを入力してください。</label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              placeholder="RoomID"
              className="w-full max-w-xs h-12 bg-gray-50 rounded-xl border-2 border-gray-200 px-4 text-base font-semibold focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition placeholder-gray-400 mb-2"
            />
            <label className="block w-full text-lg font-bold text-gray-800 text-center mb-1">名前を入力してください。</label>
            <div className="flex w-full justify-between items-end mb-2">
              <img src={tigerMuscle} alt="User 2" className="w-28 h-32 object-contain -ml-2" />
              <img src={tigerTraining} alt="User 2 Training" className="w-20 h-20 object-contain -mr-2" />
            </div>
            <input
              type="text"
              value={player2Name}
              onChange={(e) => setPlayer2Name(e.target.value)}
              placeholder="User 2"
              className="w-full max-w-xs h-12 bg-gray-50 rounded-xl border-2 border-gray-200 px-4 text-lg font-bold focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition placeholder-gray-400 mb-2"
            />
            <button
              onClick={handleJoinRoom}
              disabled={!roomId.trim() || !player2Name.trim() || isLoading || firebaseConnected === false}
              className="w-full max-w-xs h-12 bg-gradient-to-r from-lime-400 to-emerald-400 text-white text-lg font-extrabold tracking-wide rounded-xl shadow hover:scale-105 active:scale-95 hover:from-lime-500 hover:to-emerald-500 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed drop-shadow-md"
            >
              {isLoading ? '参加中...' : firebaseConnected === false ? '接続エラー' : 'ゲームに参加する。'}
            </button>
          </div>
        </div>

        {/* AI対戦タイトル */}
        <div id="ai-title" className="w-full text-center mb-2">
          <h2 className="text-2xl font-bold text-purple-600">AI対戦</h2>
        </div>
        {/* AI戦カード */}
        <div id="ai-battle" className="bg-gradient-to-br from-white via-purple-50 to-purple-100 rounded-3xl shadow-xl py-8 px-7 w-full flex flex-col items-center gap-4 mb-4">
          <p className="text-lg text-black font-bold text-center">AIと対戦する方はこちら</p>
          <div className="w-full flex flex-col items-center gap-2">
            <label className="block w-full text-lg font-bold text-gray-800 text-center mb-1">あなたの名前を入力してください。</label>
            <div className="flex w-full justify-between items-end mb-2">
              <img src={graycatMuscle} alt="Player" className="w-28 h-32 object-contain -ml-2" />
              {(() => {
                const selectedChar = getAICharacter(aiLevel);
                return (
                  <img 
                    src={selectedChar?.avatar || graycatMuscle} 
                    alt="AI" 
                    className="w-28 h-32 object-contain -mr-2" 
                  />
                );
              })()}
            </div>
            <input
              type="text"
              value={aiPlayerName}
              onChange={(e) => setAiPlayerName(e.target.value)}
              placeholder="あなたの名前"
              className="w-full max-w-xs h-12 bg-gray-50 rounded-xl border-2 border-gray-200 px-4 text-lg font-bold focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition placeholder-gray-400 mb-2"
            />
            
            <label className="block w-full text-lg font-bold text-gray-800 text-center mb-1">対戦するAIキャラクターを選択してください。</label>
            
            {/* AIキャラクター選択 */}
            <select
              value={aiLevel}
              onChange={(e) => setAiLevel(e.target.value as AILevel)}
              className="w-full max-w-xs h-12 bg-gray-50 rounded-xl border-2 border-gray-200 px-4 text-lg font-bold focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition mb-2"
            >
              {aiCharacters.map((character) => (
                <option key={character.id} value={character.id}>
                  {character.name}
                </option>
              ))}
            </select>
            
            {/* 選択されたキャラクターの一言説明 */}
            {(() => {
              const selectedChar = getAICharacter(aiLevel);
              if (!selectedChar) return null;
              
              return (
                <div className="w-full max-w-xs text-center mb-2">
                  <p className="text-sm text-gray-600 font-semibold mb-1">「{selectedChar.nickname}」</p>
                  <p className="text-xs text-gray-500">{selectedChar.levelDescription}</p>
                  <button
                    onClick={() => handleShowCharacterDetails(selectedChar.id)}
                    className="mt-2 px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-semibold hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors min-h-[32px]"
                    aria-label={`${selectedChar.name}の詳細を表示`}
                  >
                    詳細を見る
                  </button>
                </div>
              );
            })()}
            
            <button
              onClick={handleStartAIGame}
              disabled={!aiPlayerName.trim()}
              className="w-full max-w-xs h-12 bg-gradient-to-r from-purple-400 to-pink-400 text-white text-lg font-extrabold tracking-wide rounded-xl shadow hover:scale-105 active:scale-95 hover:from-purple-500 hover:to-pink-500 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed drop-shadow-md"
            >
              AIと対戦開始
            </button>
          </div>
        </div>

        {/* オフライン対戦タイトル */}
        <div id="offline-title" className="w-full text-center mb-2">
          <h2 className="text-2xl font-bold text-orange-600">オフライン対戦</h2>
        </div>
        {/* オフライン戦カード */}
        <div id="offline-battle" className="bg-gradient-to-br from-white via-orange-50 to-orange-100 rounded-3xl shadow-xl py-8 px-7 w-full flex flex-col items-center gap-4 mb-4">
          <p className="text-lg text-black font-bold text-center">オフラインで対戦する方はこちら</p>
          <div className="w-full flex flex-col items-center gap-2">
            <div className="flex w-full justify-between items-end mb-2">
              <img src={graycatMuscle} alt="Player 1" className="w-28 h-32 object-contain -ml-2" />
              <img src={tigerMuscle} alt="Player 2" className="w-28 h-32 object-contain -mr-2" />
            </div>
            <p className="text-sm text-gray-600 font-semibold text-center mb-2">
              スマホやタブレットを中心に向かい合って<br />
              交互にコマを置いて対戦できます
            </p>
            <button
              onClick={() => router.push('/offline-game')}
              className="w-full max-w-xs h-12 bg-gradient-to-r from-orange-400 to-red-400 text-white text-lg font-extrabold tracking-wide rounded-xl shadow hover:scale-105 active:scale-95 hover:from-orange-500 hover:to-red-500 transition-all duration-150 drop-shadow-md"
            >
              オフライン対戦開始
            </button>
          </div>
        </div>

        {/* ゲーム設定とルール説明（一番下に配置） */}
        <div className="w-full max-w-md">
          <GameSettingsPanel
            settings={gameSettings}
            onSettingsChange={setGameSettings}
            isVisible={true}
          />
        </div>

        {/* クレジット表記 */}
        <div className="w-full text-center mt-8 mb-4">
          <div className="text-sm text-gray-500 font-semibold">
            © 2025 Kotaro Design Lab. All rights reserved.
          </div>
        </div>

        {/* ルール説明ポップアップ */}
        {showRules && (
          <RulesPopup isVisible={showRules} onClose={() => setShowRules(false)} />
        )}

        {/* AIキャラクター詳細ポップアップ */}
        {showCharacterPopup && selectedCharacter && (
          <AICharacterPopup
            isVisible={showCharacterPopup}
            character={getAICharacter(selectedCharacter)!}
            onClose={() => setShowCharacterPopup(false)}
          />
        )}
      </div>
      
      {/* 固定BGMコントロールボタン */}
      <div className="fixed bottom-4 right-4 z-50">
        <BGMControlButton size="medium" className="shadow-2xl hover:shadow-3xl" />
      </div>
      {/* 一番上に戻るボタン */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-4 left-4 z-50 w-12 h-12 bg-gray-400 text-white rounded-full shadow-lg hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors flex items-center justify-center"
        aria-label="画面の一番上に移動"
      >
        ↑
      </button>
      </div>
    </>
  );
} 