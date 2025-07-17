import React, { useState } from 'react';
import { GameSettings, DEFAULT_GAME_SETTINGS } from '../types/game';
import { useTheme } from '../contexts/ThemeContext';

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
  const { currentTheme, colors, setTheme } = useTheme();

  const handleSettingChange = (key: keyof GameSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  if (!isVisible) return null;

  return (
    <div className="mt-4 p-4 bg-white rounded-2xl shadow-lg border border-gray-200">
      {/* 設定展開ボタン */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left text-base text-gray-700 hover:text-gray-900 flex items-center justify-between font-semibold"
        aria-label="ゲーム設定を展開"
      >
        <span className="flex items-center gap-3">
          <span className="text-lg">⚙️</span>
          <span>ゲーム設定</span>
        </span>
        <span className={`text-lg transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* 設定パネル */}
      {isExpanded && (
        <div className="mt-4 space-y-6 pt-4 border-t border-gray-200">
          {/* テーマカラー */}
          <div>
            <h3 className="text-base font-bold text-gray-800 mb-3">テーマカラー</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme('modern')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  currentTheme === 'modern' 
                    ? 'border-emerald-400 bg-emerald-50 shadow-md' 
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-bold mb-2">モダン</div>
                  <div className="flex justify-center items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full border border-gray-300" style={{ background: '#4D6869' }} />
                    <div className="w-4 h-4 rounded-full border border-gray-300" style={{ background: '#55B89C' }} />
                    <div className="w-4 h-4 rounded border border-gray-300" style={{ background: '#D9F2E1' }} />
                  </div>
                  <div className="text-xs text-gray-600">エメラルド系</div>
                </div>
              </button>
              
              <button
                onClick={() => setTheme('classic')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  currentTheme === 'classic' 
                    ? 'border-blue-400 bg-blue-50 shadow-md' 
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-bold mb-2">クラシック</div>
                  <div className="flex justify-center items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full border border-gray-300" style={{ background: '#DC2626' }} />
                    <div className="w-4 h-4 rounded-full border border-gray-300" style={{ background: '#F59E0B' }} />
                    <div className="w-4 h-4 rounded border border-gray-300" style={{ background: '#1E40AF' }} />
                  </div>
                  <div className="text-xs text-gray-600">赤・黄・青</div>
                </div>
              </button>
            </div>
            
            {/* 詳細プレビュー */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-semibold text-gray-700 mb-2">プレビュー</div>
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300" style={{ background: colors.player1Color }} />
                  <span className="text-sm text-gray-600">プレイヤー1</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300" style={{ background: colors.player2Color }} />
                  <span className="text-sm text-gray-600">プレイヤー2</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded border-2 border-gray-300" style={{ background: colors.boardBackground }} />
                  <span className="text-sm text-gray-600">盤面</span>
                </div>
              </div>
            </div>
            
            {/* テーマ設定の共有について */}
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-semibold text-blue-800 mb-1">💡 テーマ設定について</div>
              <div className="text-xs text-blue-700 space-y-1">
                <div>• <strong>オフライン対戦・AI対戦:</strong> 個人設定として適用。</div>
                <div>• <strong>オンライン対戦:</strong> ルーム作成者の設定が共有されます。</div>
                <div>• 設定は自動的に保存され、次回も同じ設定で開始されます。</div>
              </div>
            </div>
          </div>

          {/* ゲーム設定 */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-800">ゲーム設定</h3>
            
            {/* 勝利条件 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">勝利条件</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 3, 5].map((score) => (
                  <button
                    key={score}
                    onClick={() => handleSettingChange('winScore', score)}
                    className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      settings.winScore === score
                        ? 'text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={settings.winScore === score ? { background: colors.primaryColor } : {}}
                  >
                    {score}点先取
                  </button>
                ))}
              </div>
            </div>

            {/* 制限時間 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">制限時間</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'none', label: 'なし' },
                  { value: '30s', label: '30秒' },
                  { value: '1m', label: '1分' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSettingChange('timeLimit', option.value)}
                    className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      settings.timeLimit === option.value
                        ? 'text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={settings.timeLimit === option.value ? { background: colors.primaryColor } : {}}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* リセットボタン */}
          <div className="pt-2 border-t border-gray-200">
            <button
              onClick={() => onSettingsChange(DEFAULT_GAME_SETTINGS)}
              className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              デフォルトに戻す
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 