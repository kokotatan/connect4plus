import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

interface BackgroundMusicProps {
  isPlaying: boolean;
  volume?: number;
  showControls?: boolean;
  fadeOutOnUnmount?: boolean;
}

export interface BackgroundMusicRef {
  fadeOut: (duration?: number) => void;
}

const BackgroundMusic = forwardRef<BackgroundMusicRef, BackgroundMusicProps>(({ 
  isPlaying, 
  volume = 0.3, 
  showControls = false,
  fadeOutOnUnmount = true 
}, ref) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isBGMEnabled, setIsBGMEnabled] = useState(false); // デフォルトでオフ
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const fadeOutIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // フェードアウト機能
  const fadeOut = (duration: number = 1000) => {
    const audio = audioRef.current;
    if (!audio) return;

    const startVolume = audio.volume;
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = startVolume / steps;

    fadeOutIntervalRef.current = setInterval(() => {
      if (audio.volume > volumeStep) {
        audio.volume -= volumeStep;
      } else {
        audio.pause();
        audio.volume = startVolume; // 元の音量に戻す
        if (fadeOutIntervalRef.current) {
          clearInterval(fadeOutIntervalRef.current);
          fadeOutIntervalRef.current = null;
        }
      }
    }, stepDuration);
  };

  // refを通じてメソッドを公開
  useImperativeHandle(ref, () => ({
    fadeOut
  }));

  // コンポーネントのアンマウント時にフェードアウト
  useEffect(() => {
    return () => {
      if (fadeOutOnUnmount && isBGMEnabled && audioRef.current) {
        fadeOut(500); // 0.5秒でフェードアウト
      }
      if (fadeOutIntervalRef.current) {
        clearInterval(fadeOutIntervalRef.current);
      }
    };
  }, [fadeOutOnUnmount, isBGMEnabled]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    console.log('BGM設定:', { isBGMEnabled, volume, isAudioLoaded });
    audio.volume = volume;
    audio.loop = true;

    // オーディオの読み込み状況を監視
    const handleLoadStart = () => {
      console.log('BGM読み込み開始');
    };
    
    const handleCanPlay = () => {
      console.log('BGM再生可能');
      setIsAudioLoaded(true);
    };
    
    const handleError = (e: Event) => {
      console.error('BGM読み込みエラー:', e);
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isAudioLoaded) return;

    if (isBGMEnabled) {
      console.log('BGM再生開始');
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('BGM再生成功');
          })
          .catch((error) => {
            console.error('BGM再生エラー:', error);
            // エラーが発生した場合は状態をリセット
            setIsBGMEnabled(false);
          });
      }
    } else {
      console.log('BGM停止');
      audio.pause();
    }
  }, [isBGMEnabled, isAudioLoaded]);

  const handleToggleBGM = async () => {
    console.log('BGMトグル:', !isBGMEnabled);
    const newState = !isBGMEnabled;
    setIsBGMEnabled(newState);
    
    // ユーザーインタラクション後の即座の再生を試行
    if (newState && audioRef.current && isAudioLoaded) {
      try {
        await audioRef.current.play();
        console.log('BGM即座再生成功');
      } catch (error) {
        console.error('BGM即座再生エラー:', error);
      }
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/assets/sounds/bgm/tsunage_connect4plus.m4a"
        preload="auto"
        crossOrigin="anonymous"
      >
        {/* フォールバック用のMP3ファイル */}
        <source src="/assets/sounds/bgm/tsunage_connect4plus.mp3" type="audio/mpeg" />
        <source src="/assets/sounds/bgm/tsunage_connect4plus.m4a" type="audio/mp4" />
        お使いのブラウザは音声再生をサポートしていません。
      </audio>
      {showControls && (
        <button
          onClick={handleToggleBGM}
          className="fixed bottom-4 right-4 z-50 p-3 bg-emerald-400 text-white rounded-full shadow-lg hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors"
          aria-label={isBGMEnabled ? 'BGMを停止' : 'BGMを再生'}
        >
          {isBGMEnabled ? '🔊' : '🔇'}
        </button>
      )}
    </>
  );
});

export default BackgroundMusic; 