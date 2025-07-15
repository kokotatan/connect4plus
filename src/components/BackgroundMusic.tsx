import React, { useEffect, useRef, useState } from 'react';

interface BackgroundMusicProps {
  isPlaying: boolean;
  volume?: number;
  showControls?: boolean;
}

export default function BackgroundMusic({ isPlaying, volume = 0.3, showControls = false }: BackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isBGMEnabled, setIsBGMEnabled] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.loop = true;

    if (isPlaying && isBGMEnabled) {
      audio.play().catch((error) => {
        console.log('BGM再生エラー（ユーザーインタラクションが必要）:', error);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, isBGMEnabled, volume]);

  const handleToggleBGM = () => {
    setIsBGMEnabled(!isBGMEnabled);
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/assets/sounds/bgm/tsunage_connect4plus.m4a"
        preload="auto"
      />
      {showControls && (
        <button
          onClick={handleToggleBGM}
          className="fixed bottom-4 right-4 z-50 p-3 bg-emerald-400 text-white rounded-full shadow-lg hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors"
          aria-label={isBGMEnabled ? 'BGMを停止' : 'BGMを再生'}
        >
          {isBGMEnabled ? '🔇' : '🔊'}
        </button>
      )}
    </>
  );
} 