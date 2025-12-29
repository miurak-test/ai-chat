/**
 * チャットコンテナ コンポーネント
 *
 * このファイルはチャットアプリケーションのメインコンポーネントです。
 * 全体のレイアウト、状態管理、API通信を担当します。
 *
 * 【機能】
 * - メッセージの送受信
 * - AIからの応答のストリーミング表示
 * - 会話履歴の管理（作成・選択・削除）
 * - セッション管理
 *
 * 【画面構成】
 * ┌─────────────────────────────────────┐
 * │           Header                    │
 * ├──────────┬──────────────────────────┤
 * │          │                          │
 * │ Sidebar  │      MessageList         │
 * │          │                          │
 * │          ├──────────────────────────┤
 * │          │       ChatInput          │
 * └──────────┴──────────────────────────┘
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/layout/header'
import { Sidebar, ConversationItem } from '@/components/layout/sidebar'
import { MessageList, Message } from './message-list'
import { ChatInput } from './chat-input'

/**
 * セッションIDを生成する関数
 *
 * 【用途】
 * ユーザーを識別するための一意のIDを生成します。
 * このIDはブラウザのローカルストレージに保存され、
 * 同じブラウザからのアクセスは同じユーザーとして認識されます。
 *
 * @returns 生成されたセッションID（例: "session_1234567890_abc123"）
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * セッションIDを取得する関数
 *
 * 【動作】
 * 1. ローカルストレージからセッションIDを取得
 * 2. 存在しない場合は新しく生成して保存
 * 3. セッションIDを返す
 *
 * @returns セッションID
 */
function getSessionId(): string {
  // サーバーサイドレンダリング時は空文字を返す
  if (typeof window === 'undefined') return ''

  // ローカルストレージからセッションIDを取得
  let sessionId = localStorage.getItem('sessionId')

  // 存在しない場合は新規生成
  if (!sessionId) {
    sessionId = generateSessionId()
    localStorage.setItem('sessionId', sessionId)
  }
  return sessionId
}

/**
 * チャットコンテナ コンポーネント
 *
 * チャットアプリケーションの中心となるコンポーネント。
 * 全ての状態管理とAPI通信を担当します。
 */
export function ChatContainer() {
  // ===== 状態（State）の定義 =====

  // 現在表示中のメッセージ一覧
  const [messages, setMessages] = useState<Message[]>([])

  // 会話履歴一覧（サイドバーに表示）
  const [conversations, setConversations] = useState<ConversationItem[]>([])

  // 現在選択中の会話ID（nullの場合は新規会話）
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)

  // AI応答待ち中かどうか
  const [isLoading, setIsLoading] = useState(false)

  // サイドバーの開閉状態（モバイル用）
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // ユーザーのセッションID
  const [sessionId, setSessionId] = useState('')

  // ===== 初期化処理 =====

  // コンポーネントマウント時にセッションIDを取得
  useEffect(() => {
    setSessionId(getSessionId())
  }, [])

  /**
   * 会話一覧をサーバーから取得する関数
   */
  const fetchConversations = useCallback(async () => {
    if (!sessionId) return

    try {
      // 会話一覧を取得
      const res = await fetch(`/api/conversations?sessionId=${sessionId}`)
      if (res.ok) {
        const data = await res.json()
        setConversations(data)
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    }
  }, [sessionId])

  // セッションID取得後に会話一覧を取得
  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // ===== イベントハンドラー =====

  /**
   * 会話を選択した時の処理
   *
   * @param id 選択した会話のID
   */
  const handleSelectConversation = async (id: string) => {
    try {
      // 会話の詳細（メッセージ含む）を取得
      const res = await fetch(`/api/conversations/${id}`)
      if (res.ok) {
        const data = await res.json()
        setCurrentConversationId(id)
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Failed to fetch conversation:', error)
    }
    // モバイルの場合はサイドバーを閉じる
    setIsSidebarOpen(false)
  }

  /**
   * 会話を削除した時の処理
   *
   * @param id 削除する会話のID
   */
  const handleDeleteConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' })
      if (res.ok) {
        // 現在表示中の会話が削除された場合はクリア
        if (currentConversationId === id) {
          setCurrentConversationId(null)
          setMessages([])
        }
        // 会話一覧を再取得
        fetchConversations()
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error)
    }
  }

  /**
   * 新規チャットを開始する処理
   */
  const handleNewChat = () => {
    setCurrentConversationId(null)  // 会話IDをクリア
    setMessages([])                  // メッセージをクリア
    setIsSidebarOpen(false)          // サイドバーを閉じる
  }

  /**
   * メッセージを送信した時の処理
   *
   * 【処理フロー】
   * 1. ユーザーメッセージを画面に追加
   * 2. サーバーにメッセージを送信
   * 3. AIからの応答をストリーミングで受信
   * 4. 受信したテキストを逐次画面に反映
   * 5. 完了後、会話一覧を更新
   *
   * @param content ユーザーが入力したメッセージ
   */
  const handleSend = async (content: string) => {
    if (!sessionId) return

    // ===== 1. ユーザーメッセージを画面に追加 =====
    const userMessage: Message = { role: 'user', content }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      // ===== 2. サーバーにメッセージを送信 =====
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          conversationId: currentConversationId,
          sessionId,
        }),
      })

      if (!res.ok) throw new Error('Failed to send message')

      // ===== 3. ストリーミング応答を読み取る準備 =====
      const reader = res.body?.getReader()
      if (!reader) throw new Error('No reader available')

      const decoder = new TextDecoder()
      let assistantContent = ''

      // AI応答用の空メッセージを追加（後で更新される）
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      // ===== 4. ストリーミングデータを逐次処理 =====
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // バイナリデータをテキストに変換
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        // 各行を処理（SSE形式: "data: {...}"）
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.type === 'text') {
                // テキストチャンクを追加
                assistantContent += data.text
                // 画面のメッセージを更新
                setMessages((prev) => {
                  const newMessages = [...prev]
                  newMessages[newMessages.length - 1] = {
                    role: 'assistant',
                    content: assistantContent,
                  }
                  return newMessages
                })
              } else if (data.type === 'done') {
                // 完了通知：新規会話の場合はIDを設定
                if (!currentConversationId && data.conversationId) {
                  setCurrentConversationId(data.conversationId)
                }
                // 会話一覧を更新
                fetchConversations()
              }
            } catch {
              // 不正なJSONはスキップ
            }
          }
        }
      }
    } catch (error) {
      // エラー時はエラーメッセージを表示
      console.error('Failed to send message:', error)
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: 'エラーが発生しました。もう一度お試しください。' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // ===== 画面描画 =====
  return (
    <div className="flex h-screen flex-col">
      {/* ヘッダー：メニューボタン、新規チャットボタン、テーマ切替 */}
      <Header
        onMenuClick={() => setIsSidebarOpen(true)}
        onNewChat={handleNewChat}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* サイドバー：会話履歴一覧 */}
        <Sidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
        />

        {/* メインエリア：メッセージ一覧と入力欄 */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* メッセージ一覧 */}
          <MessageList messages={messages} isLoading={isLoading} />
          {/* 入力欄 */}
          <ChatInput onSend={handleSend} disabled={isLoading} />
        </main>
      </div>
    </div>
  )
}
