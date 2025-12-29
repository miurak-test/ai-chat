/**
 * 会話一覧 API エンドポイント
 *
 * このファイルはユーザーの会話履歴一覧を取得します。
 * セッションIDに紐づく全ての会話を新しい順に返します。
 *
 * 【エンドポイント】
 * GET /api/conversations?sessionId=xxx
 *
 * 【クエリパラメータ】
 * - sessionId: ユーザーのセッションID（必須）
 *
 * 【レスポンス】
 * 成功時: 会話オブジェクトの配列
 * [
 *   { _id: '...', title: '...', createdAt: '...', updatedAt: '...' },
 *   ...
 * ]
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/connection'
import Conversation from '@/models/conversation'

// 動的レンダリングを強制（キャッシュしない）
export const dynamic = 'force-dynamic'

/**
 * GET /api/conversations - 会話一覧を取得
 *
 * 【処理フロー】
 * 1. クエリパラメータから sessionId を取得
 * 2. データベースに接続
 * 3. セッションIDに紐づく会話を検索
 * 4. 更新日時の新しい順でソートして返す
 */
export async function GET(request: NextRequest) {
  try {
    // ===== 1. クエリパラメータの取得 =====
    const sessionId = request.nextUrl.searchParams.get('sessionId')

    // sessionId は必須
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId は必須です' }, { status: 400 })
    }

    // ===== 2. データベース接続 =====
    await connectToDatabase()

    // ===== 3. 会話を検索 =====
    const conversations = await Conversation.find({ sessionId })
      .sort({ updatedAt: -1 })  // 新しい順にソート
      .select('_id title createdAt updatedAt')  // 必要なフィールドのみ取得
      .lean()  // プレーンな JavaScript オブジェクトとして取得（パフォーマンス向上）

    // ===== 4. 結果を返す =====
    return NextResponse.json(conversations)
  } catch (error) {
    // エラーログを出力
    console.error('Conversations GET error:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
