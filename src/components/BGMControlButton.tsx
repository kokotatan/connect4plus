import React from 'react';
import { useBGM } from '../contexts/BGMContext';

interface BGMControlButtonProps {
  className?: string;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const BGMControlButton: React.FC<BGMControlButtonProps> = ({
  className = '',
  showLabel = false,
  size = 'medium'
}) => {
  const { isPlaying, isEnabled, currentBGM, toggle, enable, fadeIn } = useBGM();

  const handleClick = () => {
    console.log('BGMControlButton クリック:', { isEnabled, isPlaying, currentBGM });
    if (!isEnabled) {
      // 初回クリック時はBGMを有効化
      console.log('BGM有効化');
      enable();
      // フェードインで再生開始
      setTimeout(() => {
        fadeIn(2000); // 2秒でフェードイン
      }, 100);
    } else {
      // 2回目以降は再生/停止を切り替え
      console.log('BGM再生/停止切り替え');
      toggle();
    }
  };

  const sizeClasses = {
    small: 'w-8 h-8 text-sm',
    medium: 'w-10 h-10 text-base',
    large: 'w-12 h-12 text-lg'
  };

  const getIcon = () => {
    if (!isEnabled || !isPlaying) {
      return '🔇'; // 無効状態または停止中（オフのメガホン）
    }
    return '🔊'; // 再生中（オンのメガホン）
  };

  const getLabel = () => {
    if (!isEnabled) {
      return 'BGM オフ';
    }
    return isPlaying ? 'BGM 停止' : 'BGM 再生';
  };

  // デバッグ情報をコンソールに出力
  React.useEffect(() => {
    console.log('BGMControlButton 状態:', { isPlaying, isEnabled, currentBGM });
  }, [isPlaying, isEnabled, currentBGM]);

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={`
          ${sizeClasses[size]}
          flex items-center justify-center
          bg-white/80 hover:bg-white
          border-2 border-emerald-300 hover:border-emerald-400
          rounded-full shadow-lg hover:shadow-xl
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-emerald-400
          ${className}
        `}
        aria-label={getLabel()}
        title={`${getLabel()} (現在: ${currentBGM})`}
      >
        <span className="text-emerald-600">{getIcon()}</span>
        {showLabel && (
          <span className="ml-2 text-xs font-semibold text-emerald-700">
            {getLabel()}
          </span>
        )}
      </button>
      
      {/* 斜線表示を削除 - 最初の状態でも斜線なし */}
    </div>
  );
}; 