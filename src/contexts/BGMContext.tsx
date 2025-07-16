import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface BGMContextType {
  isPlaying: boolean;
  isEnabled: boolean;
  currentTime: number;
  currentBGM: 'home' | 'game';
  play: () => void;
  pause: () => void;
  toggle: () => void;
  enable: () => void;
  disable: () => void;
  seek: (time: number) => void;
  switchToGameBGM: () => void;
  switchToHomeBGM: () => void;
  fadeIn: (duration?: number) => void;
  fadeOut: (duration?: number) => void;
}

const BGMContext = createContext<BGMContextType | undefined>(undefined);

export const useBGM = () => {
  const context = useContext(BGMContext);
  if (!context) {
    throw new Error('useBGM must be used within a BGMProvider');
  }
  return context;
};

interface BGMProviderProps {
  children: React.ReactNode;
}

export const BGMProvider: React.FC<BGMProviderProps> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false); // デフォルトでオフ
  const [currentTime, setCurrentTime] = useState(0);
  const [currentBGM, setCurrentBGM] = useState<'home' | 'game'>('home');
  const homeAudioRef = useRef<HTMLAudioElement | null>(null);
  const gameAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // オーディオ要素の初期化
  useEffect(() => {
    console.log('BGM初期化開始');
    
    // ホームBGM初期化
    homeAudioRef.current = new Audio('/assets/sounds/bgm/bgmforhome.m4a');
    homeAudioRef.current.loop = true;
    homeAudioRef.current.volume = 1.0; // 0.8 → 1.0に音量アップ
    homeAudioRef.current.preload = 'auto';

    // ゲームBGM初期化
    gameAudioRef.current = new Audio('/assets/sounds/bgm/tsunage_connect4plus.m4a');
    gameAudioRef.current.loop = true;
    gameAudioRef.current.volume = 0.6;
    gameAudioRef.current.preload = 'auto';

    // 初期状態ではホームBGMを設定
    currentAudioRef.current = homeAudioRef.current;
    setCurrentBGM('home'); // 明示的にホームBGMに設定
    
    console.log('BGM初期化完了:', {
      currentBGM: 'home',
      homeAudio: homeAudioRef.current,
      gameAudio: gameAudioRef.current,
      currentAudio: currentAudioRef.current
    });

    // 時間更新イベント
    const handleTimeUpdate = () => {
      if (currentAudioRef.current) {
        setCurrentTime(currentAudioRef.current.currentTime);
      }
    };

    // 再生開始イベント
    const handlePlay = () => {
      console.log('BGM再生開始:', { currentBGM, isEnabled });
      setIsPlaying(true);
    };

    // 再生停止イベント
    const handlePause = () => {
      console.log('BGM再生停止');
      setIsPlaying(false);
    };

    // エラーハンドリング
    const handleError = (e: Event) => {
      console.error('BGM再生エラー:', e);
      setIsPlaying(false);
    };

    // 両方のオーディオにイベントリスナーを追加
    [homeAudioRef.current, gameAudioRef.current].forEach(audio => {
      if (audio) {
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('error', handleError);
      }
    });

    return () => {
      [homeAudioRef.current, gameAudioRef.current].forEach(audio => {
        if (audio) {
          audio.removeEventListener('timeupdate', handleTimeUpdate);
          audio.removeEventListener('play', handlePlay);
          audio.removeEventListener('pause', handlePause);
          audio.removeEventListener('error', handleError);
          audio.pause();
        }
      });
      homeAudioRef.current = null;
      gameAudioRef.current = null;
      currentAudioRef.current = null;
    };
  }, []);

  // 初期化完了後に確実にホームBGMを設定
  useEffect(() => {
    if (homeAudioRef.current && gameAudioRef.current && currentBGM === 'home') {
      console.log('BGM初期化後の確認: ホームBGMが正しく設定されています');
      currentAudioRef.current = homeAudioRef.current;
    }
  }, [currentBGM]);

  const play = () => {
    console.log('BGM play() 呼び出し:', { currentBGM, isEnabled, currentAudioRef: !!currentAudioRef.current });
    if (currentAudioRef.current && isEnabled) {
      currentAudioRef.current.play().catch(error => {
        console.error('BGM再生失敗:', error);
      });
    }
  };

  const pause = () => {
    console.log('BGM pause() 呼び出し');
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }
  };

  const toggle = () => {
    console.log('BGM toggle() 呼び出し:', { isPlaying });
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const enable = () => {
    console.log('BGM enable() 呼び出し');
    setIsEnabled(true);
    // 有効化時に自動再生（ユーザーインタラクション後）
    if (!isPlaying) {
      play();
    }
  };

  const disable = () => {
    console.log('BGM disable() 呼び出し');
    setIsEnabled(false);
    pause();
  };

  const seek = (time: number) => {
    if (currentAudioRef.current) {
      currentAudioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const fadeIn = (duration: number = 1000) => {
    if (!currentAudioRef.current || !isEnabled) return;
    
    const audio = currentAudioRef.current;
    const targetVolume = audio === homeAudioRef.current ? 1.0 : 0.6;
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = targetVolume / steps;
    
    audio.volume = 0;
    audio.play().catch(error => {
      console.error('フェードイン再生失敗:', error);
    });
    
    let currentStep = 0;
    const fadeInterval = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        audio.volume = volumeStep * currentStep;
      } else {
        audio.volume = targetVolume;
        clearInterval(fadeInterval);
      }
    }, stepDuration);
  };

  const fadeOut = (duration: number = 1000) => {
    if (!currentAudioRef.current) return;
    
    const audio = currentAudioRef.current;
    const currentVolume = audio.volume;
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = currentVolume / steps;
    
    let currentStep = 0;
    const fadeInterval = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        audio.volume = currentVolume - (volumeStep * currentStep);
      } else {
        audio.volume = 0;
        audio.pause();
        clearInterval(fadeInterval);
      }
    }, stepDuration);
  };

  const switchToGameBGM = () => {
    console.log('BGM switchToGameBGM() 呼び出し:', { currentBGM });
    if (currentBGM === 'game') return; // 既にゲームBGMの場合は何もしない
    
    const wasPlaying = isPlaying;
    const currentTime = currentAudioRef.current?.currentTime || 0;
    
    // 現在のBGMを停止
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }
    
    // ゲームBGMに切り替え
    setCurrentBGM('game');
    currentAudioRef.current = gameAudioRef.current;
    
    console.log('ゲームBGMに切り替え完了:', { wasPlaying, isEnabled });
    
    // 再生位置を同期
    if (currentAudioRef.current) {
      currentAudioRef.current.currentTime = currentTime;
      if (wasPlaying && isEnabled) {
        currentAudioRef.current.play().catch(error => {
          console.error('ゲームBGM再生失敗:', error);
        });
      }
    }
  };

  const switchToHomeBGM = () => {
    console.log('BGM switchToHomeBGM() 呼び出し:', { currentBGM });
    if (currentBGM === 'home') return; // 既にホームBGMの場合は何もしない
    
    const wasPlaying = isPlaying;
    const currentTime = currentAudioRef.current?.currentTime || 0;
    
    // 現在のBGMを停止
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }
    
    // ホームBGMに切り替え
    setCurrentBGM('home');
    currentAudioRef.current = homeAudioRef.current;
    
    console.log('ホームBGMに切り替え完了:', { wasPlaying, isEnabled });
    
    // 再生位置を同期
    if (currentAudioRef.current) {
      currentAudioRef.current.currentTime = currentTime;
      if (wasPlaying && isEnabled) {
        currentAudioRef.current.play().catch(error => {
          console.error('ホームBGM再生失敗:', error);
        });
      }
    }
  };

  // ページの可視性が変わった時の処理
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // ページが非表示になった時は一時停止
        if (isPlaying) {
          pause();
        }
      } else {
        // ページが表示された時は再開
        if (isEnabled && !isPlaying) {
          play();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying, isEnabled]);

  const value: BGMContextType = {
    isPlaying,
    isEnabled,
    currentTime,
    currentBGM,
    play,
    pause,
    toggle,
    enable,
    disable,
    seek,
    switchToGameBGM,
    switchToHomeBGM,
    fadeIn,
    fadeOut,
  };

  return (
    <BGMContext.Provider value={value}>
      {children}
    </BGMContext.Provider>
  );
}; 