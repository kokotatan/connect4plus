import React, { useState } from 'react';
import { GameSettings, DEFAULT_GAME_SETTINGS } from '../types/game';

interface GameSettingsPanelProps {
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  isVisible?: boolean;
}

export default function GameSettingsPanel({ 
  settings, 
  onSettingsChange, 
  isVisible = false 
}: GameSettingsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSettingChange = (key: keyof GameSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  if (!isVisible) return null;

  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
      {/* 設定展開ボタン */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left text-sm text-gray-600 hover:text-gray-800 flex items-center justify-between"
        aria-label="ゲーム設定を展開"
      >
        <span className="flex items-center gap-2">
          <span className="text-xs">⚙️</span>
          <span>詳細設定</span>
        </span>
        <span className={`text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* 設定パネル */}
      {isExpanded && (
        <div className="mt-3 space-y-3 pt-3 border-t border-gray-200">
          {/* 勝利条件 */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">勝利条件</label>
            <select
              value={settings.winScore}
              onChange={(e) => handleSettingChange('winScore', parseInt(e.target.value))}
              className="w-full text-xs p-2 border border-gray-300 rounded bg-white focus:outline-none focus:border-emerald-400"
            >
              <option value={1}>1点先取</option>
              <option value={3}>3点先取</option>
              <option value={5}>5点先取</option>
            </select>
          </div>

          {/* 制限時間 */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">制限時間</label>
            <select
              value={settings.timeLimit}
              onChange={(e) => handleSettingChange('timeLimit', e.target.value)}
              className="w-full text-xs p-2 border border-gray-300 rounded bg-white focus:outline-none focus:border-emerald-400"
            >
              <option value="none">なし</option>
              <option value="30s">30秒</option>
              <option value="1m">1分</option>
            </select>
          </div>

          {/* リセットボタン */}
          <button
            onClick={() => onSettingsChange(DEFAULT_GAME_SETTINGS)}
            className="w-full text-xs text-gray-500 hover:text-gray-700 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          >
            デフォルトに戻す
          </button>
        </div>
      )}
    </div>
  );
} 