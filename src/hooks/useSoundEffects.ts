import { useRef, useCallback } from 'react';

export const useSoundEffects = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 手番交代音を再生
  const playTurnChangeSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    audioRef.current = new Audio('/assets/sounds/SE/ワープ.mp3');
    audioRef.current.volume = 0.3; // 音量を30%に設定
    audioRef.current.play().catch(error => {
      console.log('音声再生エラー:', error);
    });
  }, []);

  // 音声を停止
  const stopSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  return {
    playTurnChangeSound,
    stopSound
  };
}; 