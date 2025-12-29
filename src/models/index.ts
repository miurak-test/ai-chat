/**
 * モデル エクスポートファイル
 *
 * このファイルはMongooseモデルと型定義を一括エクスポートします。
 * 他のファイルから簡単にインポートできるようにするためのエントリーポイントです。
 *
 * 【エクスポート内容】
 * - Conversation: 会話モデル
 * - IConversation: 会話の型定義
 * - Message: メッセージモデル
 * - IMessage: メッセージの型定義
 * - MessageRole: メッセージ送信者の型
 */

export { default as Conversation } from './conversation'
export type { IConversation } from './conversation'

export { default as Message } from './message'
export type { IMessage, MessageRole } from './message'
