import React, { useState, useEffect } from 'react';

// COMBO!演出コンポーネント
interface ComboEffectProps {
  isVisible: boolean;
  comboCount: number;
}

export const ComboEffect: React.FC<ComboEffectProps> = ({ isVisible, comboCount }) => {
  const [animation, setAnimation] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setAnimation(true);
      const timer = setTimeout(() => setAnimation(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
      <div className={`animate-combo-glow`}>
        <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 animate-pulse-slow">
          COMBO!
        </div>
        <div className="text-4xl font-bold text-center text-orange-600 mt-2 animate-bounce-slow">
          {comboCount}x
        </div>
        {/* 背景の光るエフェクト */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-yellow-200/30 via-orange-200/30 to-red-200/30 rounded-full blur-3xl animate-pulse-slow" />
      </div>
    </div>
  );
};

// スコア加算エフェクトコンポーネント
interface ScoreEffectProps {
  isVisible: boolean;
  score: number;
  playerType: 'player1' | 'player2';
  position: { x: number; y: number };
}

export const ScoreEffect: React.FC<ScoreEffectProps> = ({ isVisible, score, playerType, position }) => {
  const [animation, setAnimation] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setAnimation(true);
      const timer = setTimeout(() => setAnimation(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const color = playerType === 'player1' ? '#4D6869' : '#55B89C';

  return (
    <div 
      className="fixed z-30 pointer-events-none"
      style={{ 
        left: position.x, 
        top: position.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className="animate-score-pop">
        <div 
          className="text-2xl font-bold text-white px-4 py-2 rounded-full shadow-lg animate-shake"
          style={{ backgroundColor: color }}
        >
          +{score}
        </div>
        {/* スコア加算時の光るエフェクト */}
        <div 
          className="absolute inset-0 -z-10 rounded-full blur-md animate-sparkle"
          style={{ backgroundColor: color, opacity: 0.6 }}
        />
      </div>
    </div>
  );
};

// 花火エフェクトコンポーネント
interface FireworkProps {
  isVisible: boolean;
}

export const FireworkEffect: React.FC<FireworkProps> = ({ isVisible }) => {
  const [fireworks, setFireworks] = useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    delay: number;
    size: number;
  }>>([]);

  useEffect(() => {
    if (isVisible) {
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8E53', '#A8E6CF'];
      const newFireworks = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 2000,
        size: Math.random() * 4 + 2,
      }));
      setFireworks(newFireworks);
    } else {
      setFireworks([]);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {fireworks.map((firework) => (
        <div
          key={firework.id}
          className="absolute rounded-full animate-firework-explode"
          style={{
            left: firework.x,
            top: firework.y,
            backgroundColor: firework.color,
            width: `${firework.size}px`,
            height: `${firework.size}px`,
            animationDelay: `${firework.delay}ms`,
            animationDuration: '1.5s',
          }}
        />
      ))}
      {/* 追加の光るエフェクト */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/20 via-orange-200/20 to-red-200/20 animate-pulse-slow" />
    </div>
  );
};

// メイン演出管理コンポーネント
interface GameEffectsProps {
  comboVisible: boolean;
  comboCount: number;
  scoreEffects: Array<{
    id: number;
    isVisible: boolean;
    score: number;
    playerType: 'player1' | 'player2';
    position: { x: number; y: number };
  }>;
  fireworkVisible: boolean;
}

export const GameEffects: React.FC<GameEffectsProps> = ({
  comboVisible,
  comboCount,
  scoreEffects,
  fireworkVisible,
}) => {
  return (
    <>
      <ComboEffect isVisible={comboVisible} comboCount={comboCount} />
      {scoreEffects.map((effect) => (
        <ScoreEffect
          key={effect.id}
          isVisible={effect.isVisible}
          score={effect.score}
          playerType={effect.playerType}
          position={effect.position}
        />
      ))}
      <FireworkEffect isVisible={fireworkVisible} />
    </>
  );
}; 