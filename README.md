# AI Chat - システム設計書・運用マニュアル

Google Gemini 2.0 Flash を搭載した高速 AI チャットボットアプリケーションです。

---

## 目次

1. [システム概要](#システム概要)
2. [システム構成図](#システム構成図)
3. [技術スタック](#技術スタック)
4. [ファイル構成](#ファイル構成)
5. [データベース設計](#データベース設計)
6. [API 仕様](#api-仕様)
7. [環境構築手順](#環境構築手順)
8. [デプロイ手順](#デプロイ手順)
9. [運用マニュアル](#運用マニュアル)
10. [トラブルシューティング](#トラブルシューティング)

---

## システム概要

### このアプリケーションでできること

- **AI とのチャット**: テキストを入力すると AI が返答します
- **リアルタイム応答**: AI の返答が文字単位で表示されます（ストリーミング）
- **会話履歴**: 過去の会話を保存・復元できます
- **ダークモード**: 画面の明るさを切り替えられます

### 画面構成

```
┌─────────────────────────────────────────────────┐
│  [≡] AI Chat         [新規] [🌙/☀️]            │  ← ヘッダー
├───────────┬─────────────────────────────────────┤
│           │                                     │
│  会話1    │  あなた: こんにちは                 │
│  会話2    │  AI: こんにちは！何かお手伝い...    │
│  会話3    │                                     │
│           │                                     │  ← メッセージエリア
│           │                                     │
│           ├─────────────────────────────────────┤
│           │  [メッセージを入力...        ] [→]  │  ← 入力エリア
└───────────┴─────────────────────────────────────┘
   ↑ サイドバー（会話履歴）
```

---

## システム構成図

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   ユーザー      │────▶│   Cloud Run     │────▶│  Vertex AI      │
│  (ブラウザ)     │     │  (アプリ本体)   │     │  (Gemini AI)    │
│                 │◀────│                 │◀────│                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │                 │
                        │  MongoDB Atlas  │
                        │  (データベース) │
                        │                 │
                        └─────────────────┘

【データの流れ】
1. ユーザーがメッセージを入力
2. Cloud Run がメッセージを受信
3. MongoDB に会話を保存
4. Vertex AI (Gemini) に送信
5. AI からの応答をストリーミングで返す
6. 応答を MongoDB に保存
7. ユーザーの画面に表示
```

---

## 技術スタック

| カテゴリ | 技術 | 説明 |
|----------|------|------|
| フロントエンド | Next.js 14 | Webアプリケーションフレームワーク |
| UI | shadcn/ui, Tailwind CSS | 画面デザイン用ライブラリ |
| 言語 | TypeScript | 型安全なJavaScript |
| AI | Vertex AI Gemini 2.0 Flash | Google の高速AIモデル |
| データベース | MongoDB Atlas | クラウドデータベース |
| ホスティング | Google Cloud Run | サーバーレス実行環境 |
| CI/CD | GitHub Actions | 自動テスト・自動デプロイ |
| テスト | Vitest, React Testing Library | 自動テスト |

---

## ファイル構成

```
ai-chat/
├── src/                          # ソースコード
│   ├── app/                      # ページとAPI
│   │   ├── api/                  # バックエンドAPI
│   │   │   ├── chat/             # チャット送信API
│   │   │   │   └── route.ts      # POST /api/chat
│   │   │   └── conversations/    # 会話管理API
│   │   │       ├── route.ts      # GET /api/conversations
│   │   │       └── [id]/         # 個別会話API
│   │   │           └── route.ts  # GET/DELETE/PATCH
│   │   ├── layout.tsx            # 共通レイアウト
│   │   └── page.tsx              # メインページ
│   ├── components/               # 画面部品
│   │   ├── chat/                 # チャット関連
│   │   │   ├── chat-container.tsx    # メインコンテナ
│   │   │   ├── chat-input.tsx        # 入力欄
│   │   │   ├── message-item.tsx      # メッセージ表示
│   │   │   ├── message-list.tsx      # メッセージ一覧
│   │   │   ├── markdown-renderer.tsx # Markdown描画
│   │   │   └── code-block.tsx        # コード表示
│   │   ├── layout/               # レイアウト関連
│   │   │   ├── header.tsx        # ヘッダー
│   │   │   ├── sidebar.tsx       # サイドバー
│   │   │   └── theme-toggle.tsx  # テーマ切替
│   │   └── ui/                   # 共通UI部品
│   ├── lib/                      # ユーティリティ
│   │   ├── gemini.ts             # AI接続設定
│   │   └── db/
│   │       └── connection.ts     # DB接続設定
│   └── models/                   # データモデル
│       ├── conversation.ts       # 会話モデル
│       └── message.ts            # メッセージモデル
├── .github/workflows/            # CI/CD設定
│   ├── ci.yml                    # テスト自動実行
│   └── deploy.yml                # 自動デプロイ
├── Dockerfile                    # コンテナ設定
├── docker-compose.yml            # ローカル開発用
└── package.json                  # 依存パッケージ
```

---

## データベース設計

### conversations（会話）テーブル

| フィールド | 型 | 説明 |
|-----------|-----|------|
| _id | ObjectId | 一意の識別子（自動生成） |
| sessionId | String | ユーザー識別用ID |
| title | String | 会話のタイトル |
| createdAt | Date | 作成日時 |
| updatedAt | Date | 更新日時 |

### messages（メッセージ）テーブル

| フィールド | 型 | 説明 |
|-----------|-----|------|
| _id | ObjectId | 一意の識別子（自動生成） |
| conversationId | ObjectId | 所属する会話のID |
| role | String | 送信者（'user' または 'assistant'） |
| content | String | メッセージ本文 |
| createdAt | Date | 作成日時 |

### テーブル間の関係

```
conversations (1) ──────< (多) messages

例:
会話「プログラミングについて」
  ├── ユーザー: "Pythonについて教えて"
  ├── AI: "Pythonは..."
  ├── ユーザー: "もっと詳しく"
  └── AI: "詳しく説明すると..."
```

---

## API 仕様

### POST /api/chat - メッセージ送信

**リクエスト:**
```json
{
  "message": "こんにちは",
  "conversationId": "abc123",  // 新規会話の場合は省略
  "sessionId": "session_xxx"
}
```

**レスポンス:** Server-Sent Events (SSE)
```
data: {"type":"text","text":"こん"}
data: {"type":"text","text":"にちは"}
data: {"type":"done","conversationId":"abc123"}
```

### GET /api/conversations - 会話一覧取得

**リクエスト:** `GET /api/conversations?sessionId=xxx`

**レスポンス:**
```json
[
  { "_id": "abc123", "title": "プログラミング", "updatedAt": "2024-01-01" },
  { "_id": "def456", "title": "料理について", "updatedAt": "2024-01-02" }
]
```

### GET /api/conversations/[id] - 会話詳細取得

**レスポンス:**
```json
{
  "_id": "abc123",
  "title": "プログラミング",
  "messages": [
    { "role": "user", "content": "Pythonについて" },
    { "role": "assistant", "content": "Pythonは..." }
  ]
}
```

### DELETE /api/conversations/[id] - 会話削除

**レスポンス:** `{ "success": true }`

---

## 環境構築手順

### 必要なもの

- Node.js 18以上
- npm
- Google Cloud アカウント
- MongoDB Atlas アカウント

### 手順

#### 1. リポジトリをクローン

```bash
git clone https://github.com/miurak-test/ai-chat.git
cd ai-chat
```

#### 2. 依存パッケージをインストール

```bash
npm install
```

#### 3. 環境変数を設定

`.env.local` ファイルを作成:

```bash
cp .env.example .env.local
```

以下の値を設定:

```
GCP_PROJECT_ID=your-project-id
GCP_LOCATION=us-central1
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/ai-chat
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 4. GCP 認証

```bash
gcloud auth application-default login
```

#### 5. 開発サーバー起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセス

---

## デプロイ手順

### 手動デプロイ

```bash
# 1. Artifact Registry にログイン
gcloud auth configure-docker us-central1-docker.pkg.dev

# 2. ビルド & プッシュ
gcloud builds submit --tag us-central1-docker.pkg.dev/PROJECT_ID/ai-chat/ai-chat:latest

# 3. Cloud Run にデプロイ
gcloud run deploy ai-chat \
  --image us-central1-docker.pkg.dev/PROJECT_ID/ai-chat/ai-chat:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "GCP_PROJECT_ID=PROJECT_ID,GCP_LOCATION=us-central1,MONGODB_URI=..."
```

### 自動デプロイ（GitHub Actions）

GitHub Secrets に以下を設定:

| Secret 名 | 値 |
|-----------|-----|
| GCP_PROJECT_ID | miuken |
| WIF_PROVIDER | projects/91331580025/locations/global/workloadIdentityPools/github/providers/github-provider |
| WIF_SERVICE_ACCOUNT | github-actions@miuken.iam.gserviceaccount.com |
| MONGODB_URI | MongoDB の接続文字列 |

`main` ブランチにプッシュすると自動デプロイされます。

---

## 運用マニュアル

### 日常の確認項目

| 項目 | 確認方法 | 正常状態 |
|------|----------|----------|
| アプリの稼働 | ブラウザでアクセス | チャット画面が表示される |
| Cloud Run | GCPコンソール | 緑色のチェックマーク |
| MongoDB | Atlas コンソール | 「Cluster0」が緑色 |

### コマンド一覧

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番用ビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run lint` | コードチェック |
| `npm run test` | テスト実行（監視モード） |
| `npm run test:run` | テスト実行（1回のみ） |

### ログの確認方法

```bash
# Cloud Run のログを確認
gcloud run services logs read ai-chat --region=us-central1 --limit=50
```

---

## トラブルシューティング

### よくあるエラーと対処法

#### 1. 「GCP_PROJECT_ID が環境変数に設定されていません」

**原因:** 環境変数が設定されていない

**対処法:**
- ローカル: `.env.local` ファイルに `GCP_PROJECT_ID=xxx` を追加
- Cloud Run: 環境変数を設定し直す

```bash
gcloud run services update ai-chat \
  --region=us-central1 \
  --set-env-vars "GCP_PROJECT_ID=miuken"
```

#### 2. 「MONGODB_URI が環境変数に設定されていません」

**原因:** MongoDB の接続文字列が未設定

**対処法:**
- MongoDB Atlas から接続文字列を取得
- `.env.local` または Cloud Run の環境変数に設定

#### 3. 「MongoDB に接続できない」

**原因:**
- ネットワーク設定（IP制限）
- 接続文字列が間違っている

**対処法:**
1. MongoDB Atlas にログイン
2. Network Access で IP を許可（0.0.0.0/0 で全許可）
3. 接続文字列のユーザー名・パスワードを確認

#### 4. AI が応答しない

**原因:**
- Vertex AI API が有効でない
- 認証情報の問題

**対処法:**
```bash
# Vertex AI API を有効化
gcloud services enable aiplatform.googleapis.com

# 認証を再設定
gcloud auth application-default login
```

#### 5. 画面が真っ白

**原因:** ビルドエラー

**対処法:**
```bash
# ビルドを実行してエラーを確認
npm run build

# エラーがあれば修正
```

#### 6. GitHub Actions が失敗する

**原因:** Secrets が正しく設定されていない

**対処法:**
1. GitHub リポジトリの Settings → Secrets を確認
2. 値が正しいか確認（スペースや改行に注意）

### サポート連絡先

問題が解決しない場合は、以下の情報と共に報告してください:

1. エラーメッセージ（全文）
2. 発生した操作手順
3. 発生日時
4. ブラウザとOSの情報

---

## ライセンス

MIT License

---

## 更新履歴

| 日付 | バージョン | 内容 |
|------|-----------|------|
| 2024-12-29 | 1.0.0 | 初版リリース |
