import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-emerald-100 to-white flex flex-col font-noto">
      {/* ヘッダー（上部） */}
      <header className="w-full max-w-md mx-auto pt-6 pb-2 flex flex-col items-center">
        <h1 className="text-4xl font-extrabold text-black text-center tracking-tight drop-shadow-sm">connect4plus</h1>
        <p className="text-lg text-gray-500 font-semibold text-center mt-1">次世代型立体四目並べ</p>
      </header>
      {/* メイン */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto py-4">
        {children}
      </main>
      {/* フッター（下部） */}
      <footer className="w-full max-w-md mx-auto text-center text-gray-500 text-base font-semibold mb-4 mt-8 select-none">
        Presented by Kotaro Design Lab.
      </footer>
    </div>
  );
} 