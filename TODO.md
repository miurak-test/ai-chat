# AI Chat - 実行計画 TODO リスト

## Phase 1: プロジェクト初期設定

### 1.1 Next.js プロジェクトセットアップ
- [x] Next.js プロジェクトを作成 (App Router, TypeScript)
- [x] ESLint, Prettier の設定
- [x] `.gitignore` の確認・調整
- [x] Git リポジトリの初期化

### 1.2 依存パッケージのインストール
- [x] shadcn/ui のセットアップ
- [x] Tailwind CSS の設定確認
- [x] 必要な shadcn/ui コンポーネントの追加 (Button, Input, Card, ScrollArea など)
- [x] Anthropic SDK (`@anthropic-ai/sdk`) のインストール
- [x] Mongoose のインストール
- [x] Markdown 関連ライブラリのインストール (`react-markdown`, `remark-gfm`)
- [x] シンタックスハイライトライブラリのインストール (`react-syntax-highlighter`)
- [x] Vitest と React Testing Library のインストール

### 1.3 環境設定
- [x] `.env.example` ファイルの作成
- [x] `.env.local` ファイルの作成（ローカル開発用）
- [x] 環境変数の型定義ファイル作成

---

## Phase 2: データベース設計・実装

### 2.1 MongoDB Atlas セットアップ
- [x] MongoDB Atlas クラスターの作成
- [x] データベースユーザーの作成
- [x] ネットワークアクセス設定（IP許可）
- [x] 接続文字列の取得と環境変数への設定

### 2.2 Mongoose 設定
- [x] データベース接続ユーティリティの作成 (`src/lib/db/connection.ts`)
- [x] 接続エラーハンドリングの実装

### 2.3 モデル定義
- [x] Conversation モデルの作成 (`src/models/conversation.ts`)
- [x] Message モデルの作成 (`src/models/message.ts`)
- [x] モデルのインデックス設定

---

## Phase 3: バックエンド API 実装

### 3.1 Anthropic クライアント設定
- [x] Anthropic クライアントの初期化 (`src/lib/anthropic.ts`)
- [x] ストリーミング対応の設定

### 3.2 Chat API
- [x] `POST /api/chat` エンドポイントの作成
- [x] ストリーミングレスポンスの実装 (Server-Sent Events)
- [x] メッセージの保存処理
- [x] 会話コンテキストの管理
- [x] エラーハンドリング

### 3.3 Conversations API
- [x] `GET /api/conversations` - 会話一覧取得
- [x] `GET /api/conversations/[id]` - 会話詳細取得
- [x] `DELETE /api/conversations/[id]` - 会話削除
- [x] `PATCH /api/conversations/[id]` - 会話タイトル更新（オプション）

---

## Phase 4: フロントエンド基盤

### 4.1 レイアウト構築
- [x] ルートレイアウト (`src/app/layout.tsx`) の実装
- [x] グローバルスタイル (`src/app/globals.css`) の設定
- [x] フォント設定

### 4.2 テーマ機能
- [x] ThemeProvider の実装 (`src/components/providers/theme-provider.tsx`)
- [x] ダークモード / ライトモード切り替えコンポーネント
- [x] システム設定連動

### 4.3 共通コンポーネント
- [x] Header コンポーネント
- [x] Sidebar コンポーネント（会話履歴一覧）
- [x] レスポンシブレイアウト対応

---

## Phase 5: チャット UI 実装

### 5.1 チャットコンポーネント
- [x] ChatContainer コンポーネント（メインコンテナ）
- [x] MessageList コンポーネント（メッセージ一覧表示）
- [x] MessageItem コンポーネント（個別メッセージ）
- [x] ChatInput コンポーネント（入力フォーム）
- [x] TypingIndicator コンポーネント（入力中表示）

### 5.2 Markdown レンダリング
- [x] MarkdownRenderer コンポーネントの作成
- [x] react-markdown の設定
- [x] カスタムスタイルの適用

### 5.3 コードブロック
- [x] CodeBlock コンポーネントの作成
- [x] シンタックスハイライトの実装
- [x] コピーボタンの実装
- [x] 言語表示ラベル

### 5.4 インタラクション
- [x] メッセージコピー機能
- [x] 自動スクロール機能
- [x] ローディング状態の表示
- [x] エラー表示

---

## Phase 6: 状態管理・データフェッチ

### 6.1 カスタム Hooks
- [x] `useChat` - チャット送信・ストリーミング管理（ChatContainer に統合）
- [x] `useConversations` - 会話一覧管理（ChatContainer に統合）
- [x] `useConversation` - 個別会話管理（ChatContainer に統合）

### 6.2 Context
- [x] ChatContext - 現在のチャット状態管理（ChatContainer に統合）
- [x] SessionContext - セッション ID 管理（ChatContainer に統合）

---

## Phase 7: 会話履歴機能

### 7.1 サイドバー
- [x] 会話一覧の表示
- [x] 新規会話ボタン
- [x] 会話の選択・切り替え
- [x] 会話の削除機能

### 7.2 セッション管理
- [x] セッション ID の生成・保存 (localStorage)
- [x] セッションに紐づく会話の取得

---

## Phase 8: テスト実装

### 8.1 テスト環境設定
- [x] Vitest 設定ファイル作成 (`vitest.config.mjs`)
- [x] テストセットアップファイル作成
- [x] モック設定

### 8.2 ユニットテスト
- [x] ユーティリティ関数のテスト（基本的なテスト完了）
- [ ] Mongoose モデルのテスト（オプション）
- [ ] カスタム Hooks のテスト（ChatContainer に統合済み）

### 8.3 API テスト
- [ ] Chat API のテスト（ストリーミングのため複雑、オプション）
- [x] Conversations API のテスト

### 8.4 コンポーネントテスト
- [x] MessageItem のテスト
- [x] ChatInput のテスト
- [x] MarkdownRenderer のテスト

---

## Phase 9: Docker 化

### 9.1 Docker 設定
- [x] Dockerfile の作成
- [x] `.dockerignore` の作成
- [x] docker-compose.yml の作成（ローカル開発用）

### 9.2 ローカル動作確認
- [x] Docker イメージのビルド
- [x] コンテナでの動作確認

---

## Phase 10: デプロイ

### 10.1 GCP 設定
- [x] GCP プロジェクトの作成/選択
- [x] Artifact Registry の設定
- [x] Cloud Run サービスの作成

### 10.2 CI/CD（オプション）
- [x] GitHub Actions ワークフローの作成
- [x] 自動デプロイ設定

### 10.3 本番デプロイ
- [x] 本番環境変数の設定
- [x] Docker イメージのビルド・プッシュ
- [x] Cloud Run へのデプロイ
- [x] 動作確認

---

## Phase 11: 仕上げ

### 11.1 最適化
- [x] パフォーマンス最適化（Next.js の最適化機能を活用）
- [x] SEO 対応（メタタグ設定）
- [x] アクセシビリティ対応（ARIA属性、キーボードナビゲーション）

### 11.2 ドキュメント
- [x] README.md の作成
- [x] 環境構築手順の記載
- [ ] API ドキュメントの整備（オプション）

---

## 進捗サマリー

| Phase | 内容 | 状態 |
|-------|------|------|
| 1 | プロジェクト初期設定 | ✅ 完了 |
| 2 | データベース設計・実装 | ✅ 完了 |
| 3 | バックエンド API 実装 | ✅ 完了 |
| 4 | フロントエンド基盤 | ✅ 完了 |
| 5 | チャット UI 実装 | ✅ 完了 |
| 6 | 状態管理・データフェッチ | ✅ 完了 |
| 7 | 会話履歴機能 | ✅ 完了 |
| 8 | テスト実装 | ✅ 完了（31テスト） |
| 9 | Docker 化 | ✅ 完了 |
| 10 | デプロイ | ✅ 完了（CI/CD含む） |
| 11 | 仕上げ | ✅ 完了 |

---

## 備考

- 各タスク完了時にチェックボックスを更新してください
- 問題が発生した場合は、このファイルに記録を残してください
- 優先度の変更があれば、Phase の順序を調整してください
