import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, off, remove } from 'firebase/database';
import { CellState, GameSettings } from '../types/game';

// プレイヤー情報の型定義
export interface PlayerInfo {
  sessionId: string;
  roomId: string;
  playerName: string;
  isPlayer1: boolean;
  isPlayer2: boolean;
  joinedAt: number;
}

// ルームデータの型定義
export interface RoomData {
  player1: {
    name: string;
    sessionId: string;
    isReady: boolean;
  };
  player2: {
    name: string;
    sessionId: string;
    isReady: boolean;
  } | null;
  status: 'waiting' | 'ready' | 'playing' | 'finished';
  createdAt: number;
  theme?: 'modern' | 'classic'; // テーマ設定を追加
  gameSettings?: GameSettings; // ゲーム設定を追加
  gameState?: {
    board: CellState[][];
    currentTurn: 'player1' | 'player2';
    firstTurn?: 'player1' | 'player2';
    player1Score: number;
    player2Score: number;
    gameOver: boolean;
    winner: string | null;
  };
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
};

// 環境変数の検証
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_DATABASE_URL'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required Firebase environment variables:', missingEnvVars);
  if (typeof window === 'undefined') {
    // サーバーサイドでのエラー
    throw new Error(`Firebase configuration error: Missing environment variables: ${missingEnvVars.join(', ')}`);
  }
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getDatabase(app, firebaseConfig.databaseURL); // 明示的に指定

console.log('Firebase初期化成功');

// ルームID生成（6文字の英数字）
export const generateRoomId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// セッションID生成
export const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// セッションIDを取得（既存のものがあれば使用、なければ新規生成）
export const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('connect4plus_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('connect4plus_session_id', sessionId);
  }
  return sessionId;
};

// プレイヤー情報をセッションストレージに保存
export const savePlayerInfo = (roomId: string, playerName: string, isPlayer1: boolean) => {
  if (typeof window === 'undefined') return;
  
  const sessionId = getSessionId();
  const playerInfo = {
    sessionId,
    roomId,
    playerName,
    isPlayer1,
    isPlayer2: !isPlayer1, // 追加
    joinedAt: Date.now()
  };
  
  sessionStorage.setItem('connect4plus_player_info', JSON.stringify(playerInfo));
};

// プレイヤー情報をセッションストレージから取得
export const getPlayerInfo = (): PlayerInfo | null => {
  if (typeof window === 'undefined') return null;
  
  const playerInfoStr = sessionStorage.getItem('connect4plus_player_info');
  if (!playerInfoStr) return null;
  
  try {
    const info = JSON.parse(playerInfoStr);
    // 互換性のためisPlayer2がなければ補完
    if (typeof info.isPlayer2 === 'undefined') {
      info.isPlayer2 = !info.isPlayer1;
    }
    return info as PlayerInfo;
  } catch {
    return null;
  }
};

// ルーム作成時にゲーム設定も保存
export const createRoom = async (roomId: string, player1Name: string, theme: 'modern' | 'classic' = 'modern', gameSettings?: GameSettings) => {
  const sessionId = getSessionId();
  
  const roomData: RoomData = {
    player1: {
      name: player1Name,
      sessionId: sessionId,
      isReady: false
    },
    player2: null,
    status: 'waiting',
    createdAt: Date.now(),
    theme: theme,
    gameSettings: gameSettings // ゲーム設定を保存
  };

  try {
    await set(ref(db, `rooms/${roomId}`), roomData);
    console.log('ルーム作成成功:', roomId);
    return true;
  } catch (error) {
    console.error('ルーム作成エラー:', error);
    return false;
  }
};

// ルーム参加（セッション情報付き）
export const joinRoom = async (roomId: string, player2Name: string) => {
  const sessionId = getSessionId();
  const roomRef = ref(db, `rooms/${roomId}`);
  
  // ルーム情報を取得
  const snapshot = await get(roomRef);
  const roomData = snapshot.val();
  
  if (!roomData) {
    throw new Error('ルームが見つかりません');
  }
  
  if (roomData.player2) {
    throw new Error('ルームが満員です');
  }
  
  // プレイヤー2として参加（テーマ設定は既存のものを維持）
  const updatedRoomData = {
    ...roomData,
    player2: {
      name: player2Name,
      sessionId: sessionId,
      isReady: true
    },
    status: 'ready'
  };
  
  await set(roomRef, updatedRoomData);
  
  // プレイヤー情報を保存
  savePlayerInfo(roomId, player2Name, false);
  
  console.log('ルーム参加完了:', roomId, 'セッションID:', sessionId);
};

// ルーム存在確認
export const checkRoomExists = async (roomId: string): Promise<boolean> => {
  const roomRef = ref(db, `rooms/${roomId}`);
  const snapshot = await get(roomRef);
  return snapshot.exists();
};

// ルーム監視
export const watchRoom = (roomId: string, callback: (data: RoomData | null) => void) => {
  const roomRef = ref(db, `rooms/${roomId}`);
  onValue(roomRef, (snapshot) => {
    callback(snapshot.val());
  });
  
  return () => off(roomRef);
};

// ルーム削除
export const deleteRoom = async (roomId: string) => {
  const roomRef = ref(db, `rooms/${roomId}`);
  await remove(roomRef);
};

// テーマ設定を更新
export const updateRoomTheme = async (roomId: string, theme: 'modern' | 'classic') => {
  const roomRef = ref(db, `rooms/${roomId}/theme`);
  await set(roomRef, theme);
  console.log('テーマ設定更新:', roomId, 'テーマ:', theme);
};

// ゲーム設定を更新する関数
export const updateRoomGameSettings = async (roomId: string, gameSettings: GameSettings) => {
  try {
    await set(ref(db, `rooms/${roomId}/gameSettings`), gameSettings);
    console.log('ゲーム設定更新成功:', gameSettings);
    return true;
  } catch (error) {
    console.error('ゲーム設定更新エラー:', error);
    return false;
  }
};

// Firebase接続テスト
export const testFirebaseConnection = async () => {
  try {
    console.log('Firebase接続テスト開始');
    const testRef = ref(db, 'test');
    await set(testRef, { timestamp: Date.now() });
    console.log('Firebase接続テスト成功');
    await remove(testRef);
    return true;
  } catch (error) {
    console.error('Firebase接続テスト失敗:', error);
    return false;
  }
}; 