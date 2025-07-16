import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeType = 'modern' | 'classic';

export interface ThemeColors {
  // プレイヤー色
  player1Color: string;
  player2Color: string;
  player1HoverColor: string;
  player2HoverColor: string;
  
  // 盤面色
  boardBackground: string;
  cellBackground: string;
  cellBorder: string;
  
  // UI色
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  backgroundColor: string;
  
  // スコアゲージ色
  scoreGaugeBackground: string;
  scoreGaugeFill: string;
  scoreGaugeBorder: string;
}

const themes: Record<ThemeType, ThemeColors> = {
  modern: {
    // モダンテーマ（現在のエメラルド系）
    player1Color: '#4D6869',
    player2Color: '#55B89C',
    player1HoverColor: '#3A5253',
    player2HoverColor: '#4A9A7E',
    
    boardBackground: '#D9F2E1',
    cellBackground: '#FFFFFF',
    cellBorder: '#E5E7EB',
    
    primaryColor: '#10B981',
    secondaryColor: '#059669',
    accentColor: '#34D399',
    textColor: '#1F2937',
    backgroundColor: '#F0FDF4',
    
    scoreGaugeBackground: '#E5E7EB',
    scoreGaugeFill: '#10B981',
    scoreGaugeBorder: '#D1D5DB',
  },
  classic: {
    // 古典的テーマ（Connect4の伝統的な色）
    player1Color: '#DC2626', // 赤色
    player2Color: '#F59E0B', // 黄色
    player1HoverColor: '#B91C1C', // 濃い赤
    player2HoverColor: '#D97706', // 濃い黄
    
    boardBackground: '#1E40AF', // 青色
    cellBackground: '#FFFFFF',
    cellBorder: '#E5E7EB',
    
    primaryColor: '#1E40AF',
    secondaryColor: '#1D4ED8',
    accentColor: '#3B82F6',
    textColor: '#1F2937',
    backgroundColor: '#F8FAFC',
    
    scoreGaugeBackground: '#E5E7EB',
    scoreGaugeFill: '#1E40AF',
    scoreGaugeBorder: '#D1D5DB',
  }
};

interface ThemeContextType {
  currentTheme: ThemeType;
  colors: ThemeColors;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('modern');

  // ローカルストレージからテーマを読み込み
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('connect4plus-theme') as ThemeType;
      if (savedTheme && themes[savedTheme]) {
        setCurrentTheme(savedTheme);
      }
    }
  }, []);

  const setTheme = (theme: ThemeType) => {
    setCurrentTheme(theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('connect4plus-theme', theme);
    }
  };

  const value: ThemeContextType = {
    currentTheme,
    colors: themes[currentTheme],
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 