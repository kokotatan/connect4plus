# Connect4Plus

次世代型立体四目並べゲーム

## 概要

Connect4Plusは、従来の四目並べを3D化し、オンライン対戦、AI対戦、オフライン対戦に対応した次世代型ゲームです。

## 機能

- **オンライン対戦**: リアルタイムで他のプレイヤーと対戦
- **AI対戦**: 複数の難易度のAIと対戦
- **オフライン対戦**: 同じデバイスで2人対戦
- **テーマカスタマイズ**: ゲームの見た目をカスタマイズ
- **BGM**: ゲーム内BGMの再生

## 技術スタック

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Firebase (リアルタイムデータベース)
- Vercel (デプロイ)

## 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# 本番サーバーの起動
npm start
```

## デプロイ

### Vercelでのデプロイ

1. Vercelアカウントを作成
2. GitHubリポジトリを接続
3. プロジェクトをインポート
4. 環境変数を設定（Firebase設定など）
5. デプロイ

### カスタムドメインでのサブディレクトリデプロイ

`kotaro-design-lab.com/game/connect4plus` でアクセスできるように設定されています。

## 環境変数

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
```

## ライセンス

© 2025 Kotaro Design Lab. All rights reserved. 