# AI Chat - プロジェクト仕様書

## プロジェクト概要

汎用AIアシスタントチャットボットアプリケーション

### プロジェクト名
ai-chat

### 目的
様々な質問に対応する汎用的なAIアシスタントを提供する

---

## 技術スタック

### フロントエンド
- **フレームワーク**: Next.js (App Router)
- **言語**: TypeScript
- **UIライブラリ**: shadcn/ui
- **スタイリング**: Tailwind CSS
- **状態管理**: React標準 (useState / useContext)

### バックエンド
- **API**: Next.js API Routes (Route Handlers)
- **言語**: TypeScript

### AI
- **プロバイダー**: Google Cloud Vertex AI
- **モデル**: Gemini 2.0 Flash
- **SDK**: @google-cloud/vertexai

### データベース
- **DB**: MongoDB Atlas
- **ODM**: Mongoose

### インフラ
- **ホスティング**: Google Cloud Run
- **コンテナ**: Docker

### テスト
- **フレームワーク**: Vitest
- **コンポーネントテスト**: React Testing Library

---

## 機能要件

### コア機能
- [x] AIとのチャット機能
- [x] ストリーミング応答（リアルタイム表示）
- [x] 会話履歴の保存・読み込み

### UI機能
- [x] Markdownレンダリング
- [x] コードブロックのシンタックスハイライト
- [x] ダークモード / ライトモード切り替え
- [x] 応答のコピーボタン
- [x] レスポンシブデザイン

### 認証
- 認証機能なし（セッションベースで会話を管理）

---

## ディレクトリ構造

```
ai-chat/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   └── chat/          # Chat API endpoint
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── chat/              # Chat-related components
│   │   └── layout/            # Layout components
│   ├── lib/                   # Utility functions
│   │   ├── db/                # Database connection
│   │   ├── gemini.ts          # Gemini AI client
│   │   └── utils.ts           # Helper functions
│   ├── models/                # Mongoose models
│   │   ├── conversation.ts    # Conversation schema
│   │   └── message.ts         # Message schema
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript type definitions
│   └── contexts/              # React contexts
├── tests/                     # Test files
├── public/                    # Static assets
├── .env.local                 # Environment variables (local)
├── .env.example               # Environment variables template
├── docker-compose.yml         # Docker Compose config
├── Dockerfile                 # Docker config
├── next.config.js             # Next.js config
├── tailwind.config.ts         # Tailwind config
├── tsconfig.json              # TypeScript config
├── vitest.config.ts           # Vitest config
└── package.json
```

---

## データモデル

### Conversation (会話)
```typescript
{
  _id: ObjectId,
  sessionId: string,        // ブラウザセッション識別子
  title: string,            // 会話タイトル（最初のメッセージから生成）
  createdAt: Date,
  updatedAt: Date
}
```

### Message (メッセージ)
```typescript
{
  _id: ObjectId,
  conversationId: ObjectId, // 所属する会話のID
  role: 'user' | 'assistant',
  content: string,
  createdAt: Date
}
```

---

## API エンドポイント

### POST /api/chat
チャットメッセージを送信し、AI応答を取得

**Request Body:**
```json
{
  "message": "string",
  "conversationId": "string | null",
  "sessionId": "string"
}
```

**Response:** Server-Sent Events (SSE) ストリーミング
```
data: {"type":"text","text":"AIからの"}
data: {"type":"text","text":"応答テキスト"}
data: {"type":"done","conversationId":"abc123"}
```

**Error Response:**
```
data: {"type":"error","error":"エラーメッセージ"}
```

### GET /api/conversations
会話一覧を取得

**Query Parameters:**
- `sessionId`: ユーザーのセッションID（必須）

**Response:**
```json
[
  { "_id": "abc123", "title": "会話タイトル", "createdAt": "...", "updatedAt": "..." }
]
```

### GET /api/conversations/[id]
特定の会話とメッセージを取得

**Response:**
```json
{
  "_id": "abc123",
  "title": "会話タイトル",
  "sessionId": "session_xxx",
  "createdAt": "...",
  "updatedAt": "...",
  "messages": [
    { "_id": "msg1", "role": "user", "content": "こんにちは", "createdAt": "..." },
    { "_id": "msg2", "role": "assistant", "content": "こんにちは！", "createdAt": "..." }
  ]
}
```

### DELETE /api/conversations/[id]
会話を削除（関連するメッセージも全て削除）

**Response:**
```json
{ "success": true }
```

### PATCH /api/conversations/[id]
会話のタイトルを更新

**Request Body:**
```json
{ "title": "新しいタイトル" }
```

**Response:**
```json
{ "_id": "abc123", "title": "新しいタイトル", ... }
```

---

## 環境変数

```env
# Google Cloud Vertex AI
GCP_PROJECT_ID=your-project-id
GCP_LOCATION=us-central1

# MongoDB
MONGODB_URI=mongodb+srv://...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 認証設定
Vertex AI は Application Default Credentials (ADC) を使用します:
- **ローカル開発**: `gcloud auth application-default login` を実行
- **Cloud Run**: 自動的にサービスアカウントの認証情報を使用

---

## 開発ガイドライン

### コーディング規約
- ESLint + Prettier を使用
- コンポーネントは関数コンポーネントで記述
- 型定義は明示的に行う（any 禁止）
- エラーハンドリングを適切に実装

### Git コミット規約
- feat: 新機能
- fix: バグ修正
- docs: ドキュメント
- style: フォーマット
- refactor: リファクタリング
- test: テスト
- chore: その他

### テスト方針
- ユニットテスト: ユーティリティ関数、hooks
- 統合テスト: API Routes
- コンポーネントテスト: 主要なUIコンポーネント

---

## デプロイ

### Cloud Run デプロイ手順
1. Docker イメージをビルド
2. Artifact Registry にプッシュ
3. Cloud Run にデプロイ

```bash
# ビルド
docker build -t ai-chat .

# タグ付け
docker tag ai-chat gcr.io/[PROJECT_ID]/ai-chat

# プッシュ
docker push gcr.io/[PROJECT_ID]/ai-chat

# デプロイ
gcloud run deploy ai-chat --image gcr.io/[PROJECT_ID]/ai-chat --platform managed
```

---

## Claude Code への指示

### 応答スタイル
- 必ず日本語で応答すること
- 清楚で優しい女性の口調で応答する

### テストコード作成時の厳守事項

#### テストコードの品質
- テストは必ず実際の機能を検証すること
- `expect(true).toBe(true)` のような意味のないアサーションは絶対に書かない
- テストケースは具体的な入力と期待される出力を検証すること
- モックは必要最小限に留め、実際の動作に近い形でテストすること

#### ハードコーディングの禁止
- テストを通すためだけのハードコードは絶対に禁止
- 本番コードに `if (testmode)` のような条件分岐を入れない
- テスト用の特別な値（マジックナンバー）を本番コードに埋め込まない
- 環境変数や設定ファイルを使用して、テスト環境と本番環境を適切に分離すること

#### テスト実装の原則
- テストが失敗する状態から始めること（Red-Green-Refactor）
- 境界値、異常系、エラーケースも必ずテストすること
- カバレッジだけでなく、実装の品質を重視すること
- テストケースは何をテストしているか明確に記述すること

#### 実装前の確認
- 機能の仕様を正しく理解してからテストを書くこと
- 不明な点があれば、仮の実装ではなく、ユーザーに確認すること

---

## 参考リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Vertex AI Gemini Documentation](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
