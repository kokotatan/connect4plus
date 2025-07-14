import React from 'react';
import { AICharacter } from '../utils/aiLogic';

interface AICharacterPopupProps {
  isVisible: boolean;
  onClose: () => void;
  character: AICharacter | null;
}

export const AICharacterPopup: React.FC<AICharacterPopupProps> = ({ isVisible, onClose, character }) => {
  if (!isVisible || !character) return null;

  const getLevelColor = (level: string): string => {
    switch (level) {
      case '初級':
        return 'text-green-600 bg-green-100';
      case '中級':
        return 'text-blue-600 bg-blue-100';
      case '上級':
        return 'text-orange-600 bg-orange-100';
      case '最強':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-emerald-600">AIキャラクター詳細</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-6">
          {/* キャラクター基本情報 */}
          <div className="flex items-center gap-6">
            <img 
              src={character.avatar} 
              alt={character.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-emerald-200 shadow-lg"
            />
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{character.name}</h3>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getLevelColor(character.level)}`}>
                {character.level}
              </div>
              <p className="text-lg text-gray-600 mt-2 font-semibold">「{character.nickname}」</p>
            </div>
          </div>

          {/* 強さ説明 */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-lg font-bold text-gray-800 mb-2">🎯 強さ</h4>
            <p className="text-gray-700">{character.levelDescription}</p>
          </div>

          {/* キャラクター説明 */}
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-3">📖 キャラクター説明</h4>
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6 border-l-4 border-emerald-400">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {character.description}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-emerald-400 text-white rounded-full font-semibold shadow hover:bg-emerald-500 transition-colors"
          >
            理解しました
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICharacterPopup; 