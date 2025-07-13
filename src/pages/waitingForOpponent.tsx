import React from 'react';
import Layout from '../components/Layout';

const FIXED_ROOM_ID = 'KAKOTA';
const DEFAULT_PLAYER1 = 'にゃんこ';
const DEFAULT_PLAYER2 = 'チーター';
const GRAYCAT_PLAYING = '/assets/Avater/PosingAvater/graycat_playing.png';
const TIGER_PLAYING = '/assets/Avater/PosingAvater/tiger_playing.png';
const GRAYCAT_CASTLE = '/assets/Avater/PosingAvater/graycatcastle.png';
const TIGER_CASTLE = '/assets/Avater/PosingAvater/tigercastle.png';
const CONNECT4_IMAGE = '/assets/photo/connect4.png';

const AVATAR_IMAGES = [
  GRAYCAT_PLAYING,
  GRAYCAT_CASTLE,
  TIGER_CASTLE,
  TIGER_PLAYING,
];
const AVATAR_WIDTH = 64; // px
const AVATAR_GAP = 16; // px
const setLength = AVATAR_IMAGES.length;
const setWidth = setLength * AVATAR_WIDTH + (setLength - 1) * AVATAR_GAP;

const keyframes = `
@keyframes marqueeAnim {
  0% { transform: translateX(0); }
  100% { transform: translateX(-${setWidth}px); }
}
`;

const marqueeStyle: React.CSSProperties = {
  width: setWidth,
  overflow: 'hidden',
  position: 'relative',
  height: AVATAR_WIDTH,
  marginBottom: 16,
};
const marqueeInnerStyle: React.CSSProperties = {
  display: 'flex',
  width: setWidth * 2,
  animation: `marqueeAnim 12s linear infinite`,
  alignItems: 'center',
};

interface WaitingForOpponentScreenProps {
  roomId?: string;
  player1Name?: string;
  player2Name?: string;
  onGameStart?: () => void;
}

export default function WaitingForOpponentScreen({
  roomId = FIXED_ROOM_ID,
  player1Name = DEFAULT_PLAYER1,
  player2Name = DEFAULT_PLAYER2,
  onGameStart
}: WaitingForOpponentScreenProps) {
  return (
    <Layout>
      <style>{keyframes}</style>
      {/* タイトル・サブタイトル */}
      <div className="w-full flex flex-col items-center mb-4 mt-2">
        <h2 className="text-2xl font-semibold text-black text-center leading-snug mb-1">対戦相手の参加を待っています</h2>
        <p className="text-xs text-gray-500 font-semibold text-center leading-snug">もう少しでゲーム開始！</p>
      </div>
      {/* メインカード */}
      <div className="bg-white rounded-2xl shadow-lg w-80 flex flex-col items-center px-6 py-6 mb-4">
        {/* 待機メッセージ */}
        <div className="text-black text-lg font-semibold text-center leading-snug mb-2">対戦相手の参加を<br />待っているんだよ〜。</div>
        {/* 横スクロールアバター（シームレス） */}
        <div style={marqueeStyle}>
          <div style={marqueeInnerStyle}>
            {[...AVATAR_IMAGES, ...AVATAR_IMAGES].map((src, i, arr) => {
              // gapを最後の画像以外にだけ適用
              const isLast = (i + 1) % setLength === 0;
              return (
                <img
                  key={i}
                  src={src}
                  alt={`avatar-${i}`}
                  style={{
                    width: AVATAR_WIDTH,
                    height: AVATAR_WIDTH,
                    objectFit: 'contain',
                    marginRight: isLast ? 0 : AVATAR_GAP,
                  }}
                />
              );
            })}
          </div>
        </div>
        {/* バトルメッセージ（改行あり） */}
        <div className="text-black text-base font-semibold text-center leading-snug mb-1">
          {player1Name}、{player2Name}、<br />今すぐバトル開始！！！！
        </div>
        {/* ルームID表示 */}
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-gray-500 text-xs font-semibold leading-snug">ルームID:</span>
          <span className="text-blue-500 text-base font-semibold leading-snug">{roomId}</span>
        </div>
      </div>
      {/* Connect4画像を白枠の下に配置 */}
      <div className="flex justify-center items-center w-full mt-2 mb-2">
        <img src={CONNECT4_IMAGE} alt="Connect4" className="w-40 h-40 object-contain" />
      </div>
    </Layout>
  );
} 