import React, { useEffect } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';

export default function RoomBuildingScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/roomCreated');
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Layout>
      <div className="bg-white rounded-2xl shadow-lg w-80 h-64 flex flex-col items-center pt-4 pb-4 px-4 mt-0 mb-2">
        <div className="w-full text-xl font-extrabold text-black text-center mb-3">ルームを作成中です。</div>
        <div className="flex-1 flex items-start justify-center w-full mt-2">
          <img className="w-56 h-44 object-contain mx-auto" src="/assets/Avater/PosingAvater/both_building.png" alt="2人で作っている風" />
        </div>
      </div>
      {/* Connect4写真をカードの下に表示 */}
      <div className="flex justify-center items-center w-full mt-2 mb-2">
        <img className="w-40 h-40 object-contain" src="/assets/photo/connect4.png" alt="Connect4" />
      </div>
    </Layout>
  );
} 