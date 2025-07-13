import React from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

interface ErrorScreenProps {
  errorMessage?: string;
  errorCode?: string;
  onRetry?: () => void;
}

export default function ErrorScreen({ 
  errorMessage = "エラーが発生しました。",
  errorCode,
  onRetry,
}: ErrorScreenProps) {
  const router = useRouter();
  const handleGoHome = () => {
    router.push('/');
  };
  return (
    <Layout>
      <div className="bg-white rounded-2xl shadow-lg w-80 flex flex-col items-center px-6 py-8 mb-4">
        {/* エラーイラスト */}
        <div className="w-64 h-64 flex items-center justify-center mb-4">
          <img 
            className="w-64 h-64 object-contain" 
            src={"/assets/photo/photo1.png"} 
            alt="Error Illustration"
          />
        </div>
        {/* エラーメッセージ */}
        <div className="text-black text-base font-semibold text-center leading-snug mb-2">
          {errorMessage}
        </div>
        {/* エラーコード（オプション） */}
        {errorCode && (
          <div className="text-gray-500 text-xs font-normal text-center mb-2">
            エラーコード: {errorCode}
          </div>
        )}
        {/* アクションボタン */}
        <div className="w-full flex gap-4 mt-2">
          {onRetry && (
            <button 
              onClick={onRetry}
              className="flex-1 h-12 bg-green-100 rounded-[50px] hover:bg-green-200 transition-colors"
            >
              <div className="text-center text-black text-sm font-semibold leading-snug">
                再試行。
              </div>
            </button>
          )}
          <button 
            onClick={handleGoHome}
            className="flex-1 h-12 bg-gray-100 rounded-[50px] hover:bg-gray-200 transition-colors"
          >
            <div className="text-center text-black text-sm font-semibold leading-snug">
              初期画面に戻る。
            </div>
          </button>
        </div>
      </div>
    </Layout>
  );
} 