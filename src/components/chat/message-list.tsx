'use client'

import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageItem } from './message-item'
import { TypingIndicator } from './typing-indicator'

export interface Message {
  _id?: string
  role: 'user' | 'assistant'
  content: string
}

interface MessageListProps {
  messages: Message[]
  isLoading?: boolean
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  return (
    <ScrollArea ref={scrollRef} className="flex-1">
      <div className="mx-auto max-w-3xl">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center py-20">
            <div className="text-center">
              <h2 className="mb-2 text-xl font-semibold">AI Chatへようこそ</h2>
              <p className="text-muted-foreground">
                メッセージを入力して会話を始めましょう
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageItem
                key={message._id || index}
                role={message.role}
                content={message.content}
              />
            ))}
            {isLoading && <TypingIndicator />}
          </>
        )}
      </div>
    </ScrollArea>
  )
}
