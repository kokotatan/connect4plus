import React, { useEffect } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import { BGMControlButton } from '../components/BGMControlButton';

export default function RoomBuildingScreen() {
  const router = useRouter();
  const { roomId, player1Name, winScore, timeLimit } = router.query;

  useEffect(() => {
    if (!router.isReady) return;
    const timer = setTimeout(() => {
      if (roomId && player1Name) {
        // ゲーム設定パラメータを含めて遷移
        const params = new URLSearchParams();
        params.append('roomId', roomId as string);
        params.append('player1Name', player1Name as string);
        if (winScore) params.append('winScore', winScore as string);
        if (timeLimit) params.append('timeLimit', timeLimit as string);
        
        router.push(`/roomCreated?${params.toString()}`);
      } else {
        router.push('/');
      }
    }, 2000); // 2秒後に遷移
    return () => clearTimeout(timer);
  }, [router, roomId, player1Name, winScore, timeLimit]);

  return (
    <Layout>
      <div className="bg-white rounded-2xl shadow-lg w-80 h-64 flex flex-col items-center pt-4 pb-4 px-4 mt-0 mb-2">
        <div className="w-full text-xl font-extrabold text-black text-center mb-3">ルームを作成中です...</div>
        <div className="flex-1 flex items-start justify-center w-full mt-2">
          <img className="w-56 h-44 object-contain mx-auto" src="/assets/Avater/PosingAvater/both_building.png" alt="2人で作っている風" />
        </div>
      </div>
      {/* Connect4写真をカードの下に表示 */}
      <div className="flex justify-center items-center w-full mt-2 mb-2">
        <img className="w-40 h-40 object-contain" src="/assets/photo/connect4.png" alt="Connect4" />
      </div>
      
      {/* BGMコントロールボタン（固定位置） */}
      <div className="fixed bottom-4 right-4 z-50">
        <BGMControlButton size="medium" className="shadow-2xl hover:shadow-3xl" />
      </div>
      
    </Layout>
  );
} 