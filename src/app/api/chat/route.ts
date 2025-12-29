/**
 * チャット API エンドポイント
 *
 * このファイルはユーザーからのメッセージを受け取り、
 * AI（Gemini）からの応答をストリーミング形式で返します。
 *
 * 【エンドポイント】
 * POST /api/chat
 *
 * 【リクエスト本文】
 * {
 *   message: string,        // ユーザーのメッセージ（必須）
 *   conversationId?: string, // 既存会話のID（新規会話の場合は省略）
 *   sessionId: string       // ユーザーのセッションID（必須）
 * }
 *
 * 【レスポンス】
 * Server-Sent Events (SSE) 形式でストリーミング
 * - data: { type: 'text', text: '...' }  // AIからのテキスト（随時送信）
 * - data: { type: 'done', conversationId: '...' }  // 完了通知
 * - data: { type: 'error', error: '...' }  // エラー通知
 */

import { NextRequest } from 'next/server'
import { Content } from '@google-cloud/vertexai'
import { getGenerativeModel } from '@/lib/gemini'
import { connectToDatabase } from '@/lib/db/connection'
import Conversation from '@/models/conversation'
import Message from '@/models/message'

// Next.js のランタイム設定（Node.js 環境で実行）
export const runtime = 'nodejs'
// 動的レンダリングを強制（キャッシュしない）
export const dynamic = 'force-dynamic'

// リクエスト本文の型定義
interface ChatRequestBody {
  message: string           // ユーザーが入力したメッセージ
  conversationId?: string | null  // 既存会話のID（新規の場合はnull）
  sessionId: string         // ユーザー識別用のセッションID
}

/**
 * POST /api/chat - チャットメッセージを送信し、AI応答を取得
 *
 * 【処理フロー】
 * 1. リクエストを検証（message と sessionId は必須）
 * 2. データベースに接続
 * 3. 会話を取得または新規作成
 * 4. ユーザーメッセージをデータベースに保存
 * 5. 過去のメッセージを取得してAIに送信
 * 6. AIからの応答をストリーミングで返す
 * 7. 完了後、AIの応答をデータベースに保存
 */
export async function POST(request: NextRequest) {
  try {
    // ===== 1. リクエストの解析と検証 =====
    const body: ChatRequestBody = await request.json()
    const { message, conversationId, sessionId } = body

    // 必須パラメータのチェック
    if (!message || !sessionId) {
      return new Response(JSON.stringify({ error: 'message と sessionId は必須です' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // ===== 2. データベース接続 =====
    await connectToDatabase()

    // ===== 3. 会話の取得または新規作成 =====
    let conversation
    if (conversationId) {
      // 既存の会話を取得
      conversation = await Conversation.findById(conversationId)
      if (!conversation) {
        return new Response(JSON.stringify({ error: '会話が見つかりません' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    } else {
      // 新しい会話を作成（タイトルはメッセージの先頭50文字）
      const title = message.slice(0, 50) + (message.length > 50 ? '...' : '')
      conversation = await Conversation.create({
        sessionId,
        title,
      })
    }

    // ===== 4. ユーザーメッセージをデータベースに保存 =====
    await Message.create({
      conversationId: conversation._id,
      role: 'user',
      content: message,
    })

    // ===== 5. 過去のメッセージを取得（AI へのコンテキストとして使用）=====
    const previousMessages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })  // 古い順にソート
      .lean()

    // メッセージを Gemini API の形式に変換
    // user → 'user', assistant → 'model'
    const contents: Content[] = previousMessages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }))

    // ===== 6. AI にリクエストを送信（ストリーミング）=====
    const generativeModel = getGenerativeModel()
    const streamingResult = await generativeModel.generateContentStream({
      contents,
    })

    // ===== 7. ストリーミングレスポンスを作成 =====
    const encoder = new TextEncoder()
    let assistantContent = ''  // AIの応答を蓄積

    // ReadableStream を作成（クライアントにデータを随時送信）
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // AI からの応答を順次受け取り、クライアントに送信
          for await (const item of streamingResult.stream) {
            // 応答からテキストを抽出
            const text = item.candidates?.[0]?.content?.parts?.[0]?.text
            if (text) {
              assistantContent += text  // 応答を蓄積
              // SSE 形式でクライアントに送信
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'text', text })}\n\n`)
              )
            }
          }

          // ===== 8. AIの応答をデータベースに保存 =====
          await Message.create({
            conversationId: conversation._id,
            role: 'assistant',
            content: assistantContent,
          })

          // 完了通知を送信
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'done',
                conversationId: conversation._id.toString(),
              })}\n\n`
            )
          )
          controller.close()
        } catch (error) {
          // エラー発生時はエラー通知を送信
          console.error('Streaming error:', error)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'error', error: 'ストリーミング中にエラーが発生しました' })}\n\n`
            )
          )
          controller.close()
        }
      },
    })

    // SSE レスポンスを返す
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',  // SSE 形式
        'Cache-Control': 'no-cache',          // キャッシュしない
        Connection: 'keep-alive',             // 接続を維持
      },
    })
  } catch (error) {
    // 予期しないエラーの処理
    console.error('Chat API error:', error)
    return new Response(JSON.stringify({ error: 'サーバーエラーが発生しました' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
