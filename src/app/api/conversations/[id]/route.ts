/**
 * 個別会話 API エンドポイント
 *
 * このファイルは特定の会話に対する操作（取得・削除・更新）を処理します。
 *
 * 【エンドポイント】
 * GET    /api/conversations/[id] - 会話の詳細とメッセージを取得
 * DELETE /api/conversations/[id] - 会話を削除
 * PATCH  /api/conversations/[id] - 会話のタイトルを更新
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/connection'
import Conversation from '@/models/conversation'
import Message from '@/models/message'

// ルートパラメータの型定義
interface RouteParams {
  params: Promise<{ id: string }>  // URLから取得する会話ID
}

/**
 * GET /api/conversations/[id] - 会話の詳細を取得
 *
 * 【処理フロー】
 * 1. URLパラメータから会話IDを取得
 * 2. データベースに接続
 * 3. 会話を検索
 * 4. 会話に紐づくメッセージを取得
 * 5. 会話情報とメッセージを返す
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // ===== 1. パラメータ取得 =====
    const { id } = await params

    // ===== 2. データベース接続 =====
    await connectToDatabase()

    // ===== 3. 会話を検索 =====
    const conversation = await Conversation.findById(id).lean()

    // 会話が見つからない場合は 404 エラー
    if (!conversation) {
      return NextResponse.json({ error: '会話が見つかりません' }, { status: 404 })
    }

    // ===== 4. メッセージを取得 =====
    const messages = await Message.find({ conversationId: id })
      .sort({ createdAt: 1 })  // 古い順にソート（時系列順）
      .select('_id role content createdAt')  // 必要なフィールドのみ
      .lean()

    // ===== 5. 結果を返す =====
    return NextResponse.json({
      ...conversation,
      messages,
    })
  } catch (error) {
    console.error('Conversation GET error:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

/**
 * DELETE /api/conversations/[id] - 会話を削除
 *
 * 【処理フロー】
 * 1. URLパラメータから会話IDを取得
 * 2. データベースに接続
 * 3. 会話の存在確認
 * 4. 関連するメッセージを全て削除
 * 5. 会話を削除
 *
 * 【注意】
 * この操作は取り消せません。会話と全てのメッセージが完全に削除されます。
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // ===== 1. パラメータ取得 =====
    const { id } = await params

    // ===== 2. データベース接続 =====
    await connectToDatabase()

    // ===== 3. 会話の存在確認 =====
    const conversation = await Conversation.findById(id)

    if (!conversation) {
      return NextResponse.json({ error: '会話が見つかりません' }, { status: 404 })
    }

    // ===== 4. 関連メッセージを削除 =====
    await Message.deleteMany({ conversationId: id })

    // ===== 5. 会話を削除 =====
    await Conversation.findByIdAndDelete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Conversation DELETE error:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

/**
 * PATCH /api/conversations/[id] - 会話のタイトルを更新
 *
 * 【リクエスト本文】
 * { title: '新しいタイトル' }
 *
 * 【処理フロー】
 * 1. URLパラメータから会話IDを取得
 * 2. リクエスト本文からタイトルを取得
 * 3. データベースに接続
 * 4. 会話を更新
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // ===== 1. パラメータ取得 =====
    const { id } = await params

    // ===== 2. リクエスト本文の解析 =====
    const body = await request.json()
    const { title } = body

    // タイトルは必須
    if (!title) {
      return NextResponse.json({ error: 'title は必須です' }, { status: 400 })
    }

    // ===== 3. データベース接続 =====
    await connectToDatabase()

    // ===== 4. 会話を更新 =====
    const conversation = await Conversation.findByIdAndUpdate(
      id,
      { title },
      { new: true }  // 更新後のドキュメントを返す
    ).lean()

    if (!conversation) {
      return NextResponse.json({ error: '会話が見つかりません' }, { status: 404 })
    }

    return NextResponse.json(conversation)
  } catch (error) {
    console.error('Conversation PATCH error:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
