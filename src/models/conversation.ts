/**
 * 会話（Conversation）モデル定義ファイル
 *
 * このファイルは「会話」のデータ構造を定義します。
 * 1つの会話は複数のメッセージを持ち、ユーザーのセッションに紐づきます。
 *
 * 【データベース構造】
 * conversations コレクション
 * ├── _id: 会話の一意識別子（自動生成）
 * ├── sessionId: ユーザーのセッション ID
 * ├── title: 会話のタイトル（最初のメッセージから自動生成）
 * ├── createdAt: 作成日時（自動設定）
 * └── updatedAt: 更新日時（自動更新）
 */

import mongoose, { Schema, Document, Model } from 'mongoose'

// 会話ドキュメントの型定義（TypeScript用）
export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId  // MongoDB が自動生成する一意の ID
  sessionId: string             // ユーザーを識別するセッション ID
  title: string                 // 会話のタイトル（サイドバーに表示）
  createdAt: Date              // 作成日時
  updatedAt: Date              // 最終更新日時
}

// 会話のスキーマ定義（データベースの構造を定義）
const ConversationSchema = new Schema<IConversation>(
  {
    // セッション ID（必須、検索用インデックス付き）
    sessionId: {
      type: String,
      required: true,
      index: true,  // 検索を高速化するためのインデックス
    },
    // 会話タイトル（必須、デフォルト値あり）
    title: {
      type: String,
      required: true,
      default: '新しい会話',  // タイトル未設定時のデフォルト
    },
  },
  {
    // createdAt と updatedAt を自動で追加・更新
    timestamps: true,
  }
)

// 複合インデックス：セッションIDで絞り込み、作成日時の降順でソート
// → ユーザーの会話履歴を新しい順に取得する際に高速化
ConversationSchema.index({ sessionId: 1, createdAt: -1 })

// モデルの作成（すでに存在する場合は再利用）
// ※ Next.js のホットリロード時にモデルが重複作成されるのを防ぐ
const Conversation: Model<IConversation> =
  mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema)

export default Conversation
