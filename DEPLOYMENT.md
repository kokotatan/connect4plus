# Connect4Plus デプロイ情報

## 🔑 Firebase設定情報

### プロジェクト情報
- **プロジェクト名**: connect4plus
- **プロジェクトID**: connect4plus-7ee8f
- **プロジェクト番号**: 422379120333

### Firebase設定値
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyARXxOks0dJMYTmW2qXsluvxTg5paqfAjQ",
  authDomain: "connect4plus-7ee8f.firebaseapp.com",
  databaseURL: "https://connect4plus-7ee8f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "connect4plus-7ee8f",
  storageBucket: "connect4plus-7ee8f.firebasestorage.app",
  messagingSenderId: "422379120333",
  appId: "1:422379120333:web:6d762aea26638c6dd26b84",
  measurementId: "G-8HPT7C6M3M"
};
```

### Vercel環境変数設定
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyARXxOks0dJMYTmW2qXsluvxTg5paqfAjQ
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=connect4plus-7ee8f.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://connect4plus-7ee8f-default-rtdb.asia-southeast1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=connect4plus-7ee8f
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=connect4plus-7ee8f.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=422379120333
NEXT_PUBLIC_FIREBASE_APP_ID=1:422379120333:web:6d762aea26638c6dd26b84
```

## 🌐 ドメイン設定

### カスタムドメイン
- **メインドメイン**: kotaro-design-lab.com
- **アクセスURL**: https://kotaro-design-lab.com/game/connect4plus/
- **サブディレクトリ**: /game/connect4plus

### お名前.com DNS設定
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 3600
```

## 📊 既存データ

### ルームデータ（16個）
```
4LUYFG, 8GKEKN, EG50Y5, GVE4TP, H5IAMX, J5HBJZ, NB7XXU, NWBV3V, PIV8B3, QW02NF, RCNF9I, RUY1HD, SR6GDG, TT6P4J, ZCFNZM, ZDDLMW
```

### 使用量統計
- **接続数**: 3ピーク
- **ストレージ**: 3.01KB
- **ダウンロード**: 302.39KB

## 🚀 デプロイ手順

### 1. Vercelプロジェクト作成
1. Vercelにログイン
2. "New Project" → GitHubリポジトリ `kokotatan/connect4plus` を選択
3. プロジェクト名: `connect4plus`

### 2. 環境変数設定
上記の7つの環境変数をVercelプロジェクト設定で追加

### 3. カスタムドメイン設定
1. Vercelプロジェクトの "Settings" → "Domains"
2. `kotaro-design-lab.com` を追加
3. DNS検証完了を待機

### 4. サブディレクトリ設定
```
Source: /game/connect4plus
Destination: /
Status: 200
```

## 🔧 設定ファイル

### next.config.js
```javascript
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  assetPrefix: process.env.NODE_ENV === 'production' ? '/game/connect4plus' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/game/connect4plus' : '',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}
```

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "rewrites": [
    {
      "source": "/game/connect4plus/(.*)",
      "destination": "/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        }
      ]
    }
  ]
}
```

## 📝 トラブルシューティング

### よくある問題
1. **404エラー**: `next.config.js` の `basePath` 設定を確認
2. **画像が表示されない**: `assetPrefix` 設定を確認
3. **Firebase接続エラー**: 環境変数の設定を確認
4. **ルーティングエラー**: `vercel.json` の `rewrites` 設定を確認

### 確認ポイント
- [ ] Vercelプロジェクトが正常に作成された
- [ ] 環境変数が正しく設定された
- [ ] カスタムドメインが設定された
- [ ] DNS検証が完了した
- [ ] サブディレクトリでのアクセスが可能
- [ ] Firebase接続が正常に動作する

## 📞 サポート

問題が発生した場合は、以下を確認してください：
1. Vercelのデプロイログ
2. ブラウザの開発者ツール（コンソールエラー）
3. Firebaseコンソールの使用量統計

---

**最終更新**: 2025年1月
**作成者**: Kotaro Design Lab 