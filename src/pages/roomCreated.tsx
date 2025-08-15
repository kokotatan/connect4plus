import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import GameSettingsPanel from '../components/GameSettingsPanel';
import { BGMControlButton } from '../components/BGMControlButton';
import { GameSettings, DEFAULT_GAME_SETTINGS } from '../types/game';

export default function RoomCreatedScreen() {
  const [copied, setCopied] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');
  const [roomId, setRoomId] = useState('');
  const [gameSettings, setGameSettings] = useState<GameSettings>(DEFAULT_GAME_SETTINGS);
  const router = useRouter();
  const { roomId: urlRoomId, player1Name, winScore, timeLimit } = router.query;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    if (!urlRoomId || !player1Name) {
      router.replace('/');
      return;
    }
    
    // ゲーム設定をURLパラメータから取得
    const settings: GameSettings = { ...DEFAULT_GAME_SETTINGS };
    if (winScore && typeof winScore === 'string') {
      const winScoreNum = parseInt(winScore) as 1 | 3 | 5;
      if ([1, 3, 5].includes(winScoreNum)) {
        settings.winScore = winScoreNum;
      }
    }
    if (timeLimit && typeof timeLimit === 'string') {
      const timeLimitValue = timeLimit as 'none' | '30s' | '1m';
      if (['none', '30s', '1m'].includes(timeLimitValue)) {
        settings.timeLimit = timeLimitValue;
      }
    }
    setGameSettings(settings);
    
    setRoomId(urlRoomId as string);
    const newInviteUrl = `${window.location.origin}/?roomId=${urlRoomId}`;
    setInviteUrl(newInviteUrl);
    setReady(true);
  }, [urlRoomId, player1Name, winScore, timeLimit, router]);

  const handleCopyUrl = () => {
    if (inviteUrl) {
      if (
        typeof window !== 'undefined' &&
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === 'function'
      ) {
        navigator.clipboard.writeText(inviteUrl)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          })
          .catch(() => {
            fallbackCopy(inviteUrl);
          });
      } else {
        fallbackCopy(inviteUrl);
      }
    }
  };

  // LINE共有機能
  const handleLineShare = () => {
    if (inviteUrl) {
      const shareText = `${player1Name}がconnect4plusで対戦ルームを作成しました！\nルームID: ${roomId}`;
      const lineUrl = `http://line.me/R/msg/text/?${encodeURIComponent(shareText)}%0a${encodeURIComponent(inviteUrl)}`;
      window.open(lineUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Web Share APIを使用したネイティブ共有
  const handleNativeShare = async () => {
    if (!inviteUrl) return;
    
    // Web Share APIが利用可能かチェック
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'connect4plus - 対戦に参加しませんか？',
          text: `${player1Name}がconnect4plusで対戦ルームを作成しました！\n\nルームID: ${roomId}\n\nこのURLから参加できます：`,
          url: inviteUrl
        });
      } catch (error) {
        // ユーザーが共有をキャンセルした場合やエラーの場合
        if (error instanceof Error && error.name !== 'AbortError') {
          console.log('共有エラー:', error);
          // フォールバックとしてコピー機能を使用
          handleCopyUrl();
        }
      }
    } else {
      // Web Share APIが利用できない場合はコピー機能を使用
      handleCopyUrl();
    }
  };

  function fallbackCopy(text: string) {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('コピーに失敗しました。');
    }
  }

  const handleStartGame = () => {
    if (roomId && player1Name) {
      router.push(`/waitingForOpponent?roomId=${roomId}&player1Name=${player1Name}&winScore=${gameSettings.winScore}&timeLimit=${gameSettings.timeLimit}`);
    } else {
      router.push('/');
    }
  };

  if (!ready) {
    return (
      <Layout>
        <div className="w-full flex flex-col items-center justify-center min-h-screen">
          <div className="text-lg font-semibold text-gray-600">読み込み中...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* タイトル・サブタイトル（上部に移動） */}
      <div className="w-full flex flex-col items-center mb-4 mt-2">
        <h2 className="text-2xl font-semibold text-black text-center leading-snug mb-1">ルーム作成完了</h2>
        <p className="text-xs text-gray-500 font-semibold text-center leading-snug">友達を招待してゲームを開始</p>
      </div>
      {/* メインカード */}
      <div className="bg-white rounded-2xl shadow-lg w-80 flex flex-col items-center px-6 py-6 mb-4">
        {/* チェックマークアイコン */}
        <div className="w-11 h-11 bg-green-400 rounded-full flex items-center justify-center mb-2">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M9 17.5L14 22.5L23 13.5" stroke="#111" strokeWidth="3" strokeLinecap="round"/></svg>
        </div>
        <div className="text-black text-xs font-semibold text-center leading-snug mb-1">ルームが作成されました。</div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-gray-500 text-xs font-semibold leading-snug">ルームID:</span>
          <span className="text-blue-500 text-xs font-semibold leading-snug">{roomId}</span>
        </div>
        {/* 招待URL＋コピー */}
        <div className="w-full flex flex-col gap-1 mb-2">
          <span className="text-gray-500 text-xs font-semibold leading-snug">招待URL</span>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-50 rounded-[10px] outline outline-1 outline-gray-300 px-3 py-2 text-black text-xs font-semibold leading-snug truncate">{inviteUrl}</div>
            <button 
              onClick={handleCopyUrl} 
              className="w-16 h-9 bg-green-400 rounded-[10px] flex items-center justify-center hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors min-h-[44px]"
              aria-label="招待URLをコピー"
            >
              <span className="text-white text-xs font-semibold leading-snug">{copied ? 'コピー済' : 'コピー'}</span>
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-1">コピーできない場合は、URLを長押ししてコピーしてください。</div>
          
          {/* 共有ボタン群 */}
          <div className="flex flex-col gap-2 mt-3">
            {/* LINE共有ボタン */}
            <button 
              onClick={handleLineShare} 
              className="w-full h-9 bg-green-500 rounded-[10px] flex items-center justify-center hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors min-h-[44px]"
              aria-label="LINEで友達と共有"
            >
              <svg className="w-4 h-4 text-white mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              <span className="text-white text-xs font-semibold leading-snug">LINEで共有</span>
            </button>
            
            {/* Web Share APIボタン */}
            <button 
              onClick={handleNativeShare} 
              className="w-full h-9 bg-gradient-to-r from-blue-400 to-purple-500 rounded-[10px] flex items-center justify-center hover:from-blue-500 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors min-h-[44px]"
              aria-label="友達と共有"
            >
              <svg className="w-4 h-4 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span className="text-white text-xs font-semibold leading-snug">友達と共有</span>
            </button>
          </div>
          
          <div className="text-xs text-gray-500 mt-2 text-center">
            LINEで共有ボタンをタップして、LINEで友達を招待できます。<br/>
            友達と共有ボタンで、デバイスの共有機能を使用できます。
          </div>
        </div>
        {/* ゲームを開始するボタン（視認性アップ） */}
        <button
          onClick={handleStartGame}
          className="w-full h-9 bg-gradient-to-r from-lime-400 via-emerald-400 to-lime-500 rounded-[10px] mt-2 mb-1 flex items-center justify-center border-2 border-emerald-500 shadow-lg hover:from-lime-500 hover:to-emerald-500 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        >
          <span className="text-white text-base font-extrabold leading-snug drop-shadow-sm">ゲームを開始する。</span>
        </button>
        
        {/* ゲーム設定パネル（オンラインモード用） */}
        <GameSettingsPanel
          settings={gameSettings}
          onSettingsChange={setGameSettings}
          isVisible={true}
        />
      </div>
      {/* 使い方カード */}
      <div className="bg-white rounded-2xl shadow-lg w-80 flex flex-col px-6 py-4 mb-4">
        <span className="text-black text-xs font-semibold leading-snug mb-2">使い方</span>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 flex items-center justify-center bg-green-400 rounded-full text-black text-xs font-semibold">1</span>
            <span className="text-black text-xs font-semibold leading-snug">招待URLまたはルームIDを友達に共有。</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 flex items-center justify-center bg-green-400 rounded-full text-black text-xs font-semibold">2</span>
            <span className="text-black text-xs font-semibold leading-snug">友達が参加するまで待機。</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 flex items-center justify-center bg-green-400 rounded-full text-black text-xs font-semibold">3</span>
            <span className="text-black text-xs font-semibold leading-snug">2人が揃ったらゲーム開始。</span>
          </div>
        </div>
      </div>
      
      {/* BGMコントロールボタン（固定位置） */}
      <div className="fixed bottom-4 right-4 z-50">
        <BGMControlButton size="medium" className="shadow-2xl hover:shadow-3xl" />
      </div>
      
    </Layout>
  );
} 