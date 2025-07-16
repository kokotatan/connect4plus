import React from 'react';
import { useTheme, ThemeType } from '../contexts/ThemeContext';

interface ThemeSelectorProps {
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ className = '' }) => {
  const { currentTheme, setTheme, colors } = useTheme();

  const themes: { value: ThemeType; label: string; description: string }[] = [
    {
      value: 'modern',
      label: 'モダン',
      description: 'エメラルドグリーン'
    },
    {
      value: 'classic',
      label: 'クラシック',
      description: '伝統的なConnect4'
    }
  ];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="text-sm font-semibold text-gray-700 mb-2">テーマ選択</div>
      <div className="flex gap-2">
        {themes.map((theme) => (
          <button
            key={theme.value}
            onClick={() => setTheme(theme.value)}
            className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
              currentTheme === theme.value
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            }`}
            aria-label={`${theme.label}テーマを選択`}
            aria-pressed={currentTheme === theme.value}
          >
            <div className="text-xs font-semibold">{theme.label}</div>
            <div className="text-xs opacity-75">{theme.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}; 