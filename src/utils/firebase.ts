import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, off, remove } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBimWEhK2F7QXf65qRILkHaNXPY1w7vUUo",
  authDomain: "connect4plus-bacf3.firebaseapp.com",
  projectId: "connect4plus-bacf3",
  storageBucket: "connect4plus-bacf3.appspot.com",
  messagingSenderId: "859106739926",
  appId: "1:859106739926:web:d4a9e7fe0456cb924f2b77",
  measurementId: "G-90J6BHR9LZ",
  databaseURL: "https://connect4plus-bacf3-default-rtdb.asia-southeast1.firebasedatabase.app" // 追加
};

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
export const getPlayerInfo = () => {
  if (typeof window === 'undefined') return null;
  
  const playerInfoStr = sessionStorage.getItem('connect4plus_player_info');
  if (!playerInfoStr) return null;
  
  try {
    const info = JSON.parse(playerInfoStr);
    // 互換性のためisPlayer2がなければ補完
    if (typeof info.isPlayer2 === 'undefined') {
      info.isPlayer2 = !info.isPlayer1;
    }
    return info;
  } catch {
    return null;
  }
};

// ルーム作成（セッション情報付き）
export const createRoom = async (roomId: string, player1Name: string) => {
  const sessionId = getSessionId();
  const roomRef = ref(db, `rooms/${roomId}`);
  const roomData = {
    player1: {
      name: player1Name,
      sessionId: sessionId,
      isReady: true
    },
    player2: null,
    status: 'waiting',
    createdAt: Date.now()
  };
  
  await set(roomRef, roomData);
  
  // プレイヤー情報を保存
  savePlayerInfo(roomId, player1Name, true);
  
  console.log('ルーム作成完了:', roomId, 'セッションID:', sessionId);
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
  
  // プレイヤー2として参加
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
export const watchRoom = (roomId: string, callback: (data: any) => void) => {
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