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
  const { roomId: urlRoomId, player1Name } = router.query;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    if (!urlRoomId || !player1Name) {
      router.replace('/');
      return;
    }
    setRoomId(urlRoomId as string);
    const newInviteUrl = `${window.location.origin}/?roomId=${urlRoomId}`;
    setInviteUrl(newInviteUrl);
    setReady(true);
  }, [urlRoomId, player1Name, router]);

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