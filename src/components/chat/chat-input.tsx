/**
 * チャット入力コンポーネント
 *
 * このファイルはユーザーがメッセージを入力・送信するための入力フォームを定義します。
 *
 * 【機能】
 * - テキストエリアでのメッセージ入力
 * - 自動高さ調整（入力内容に応じて拡大）
 * - Enter キーで送信、Shift + Enter で改行
 * - 送信ボタン（空白のみのメッセージは送信不可）
 * - 送信中の入力無効化
 */

'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface ChatInputProps {
  onSend: (message: string) => void    // メッセージ送信時のコールバック
  disabled?: boolean                    // 入力無効化フラグ（送信中など）
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const handleSend = () => {
    if (!input.trim() || disabled) return
    onSend(input.trim())
    setInput('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t bg-background p-4" role="form" aria-label="メッセージ入力フォーム">
      <div className="mx-auto flex max-w-3xl gap-2">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力..."
          disabled={disabled}
          className="min-h-[44px] max-h-[200px] resize-none"
          rows={1}
          aria-label="メッセージ入力"
          aria-describedby="input-hint"
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          size="icon"
          className="shrink-0"
          aria-label="メッセージを送信"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
      <p id="input-hint" className="mx-auto mt-2 max-w-3xl text-center text-xs text-muted-foreground">
        Shift + Enter で改行、Enter で送信
      </p>
    </div>
  )
}
