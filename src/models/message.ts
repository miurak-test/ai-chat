/**
 * メッセージ（Message）モデル定義ファイル
 *
 * このファイルは「メッセージ」のデータ構造を定義します。
 * メッセージはユーザーまたは AI が送信したテキストで、会話に紐づきます。
 *
 * 【データベース構造】
 * messages コレクション
 * ├── _id: メッセージの一意識別子（自動生成）
 * ├── conversationId: 所属する会話の ID（外部キー）
 * ├── role: 送信者（'user' = ユーザー, 'assistant' = AI）
 * ├── content: メッセージ本文
 * └── createdAt: 作成日時（自動設定）
 */

import mongoose, { Schema, Document, Model } from 'mongoose'

// メッセージの送信者を表す型（ユーザーまたはAI）
export type MessageRole = 'user' | 'assistant'

// メッセージドキュメントの型定義（TypeScript用）
export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId       // MongoDB が自動生成する一意の ID
  conversationId: mongoose.Types.ObjectId  // 所属する会話の ID
  role: MessageRole                  // 送信者（user または assistant）
  content: string                    // メッセージ本文
  createdAt: Date                   // 作成日時
}

// メッセージのスキーマ定義（データベースの構造を定義）
const MessageSchema = new Schema<IMessage>(
  {
    // 所属する会話の ID（必須、Conversation への参照）
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',  // Conversation モデルへの参照
      required: true,
      index: true,  // 会話IDでの検索を高速化
    },
    // 送信者の役割（user = ユーザー, assistant = AI）
    role: {
      type: String,
      enum: ['user', 'assistant'],  // この2つの値のみ許可
      required: true,
    },
    // メッセージ本文
    content: {
      type: String,
      required: true,
    },
  },
  {
    // createdAt のみ自動設定（updatedAt は不要）
    timestamps: { createdAt: true, updatedAt: false },
  }
)

// 複合インデックス：会話IDで絞り込み、作成日時の昇順でソート
// → 会話内のメッセージを時系列順に取得する際に高速化
MessageSchema.index({ conversationId: 1, createdAt: 1 })

// モデルの作成（すでに存在する場合は再利用）
const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema)

export default Message
