'use client'

import { useState } from 'react'
import { Check, Copy, User, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MarkdownRenderer } from './markdown-renderer'
import { cn } from '@/lib/utils'

interface MessageItemProps {
  role: 'user' | 'assistant'
  content: string
}

export function MessageItem({ role, content }: MessageItemProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isUser = role === 'user'

  return (
    <article
      className={cn(
        'group flex gap-4 px-4 py-6',
        isUser ? 'bg-background' : 'bg-muted/50'
      )}
      aria-label={`${isUser ? 'あなた' : 'AI'}のメッセージ`}
    >
      <Avatar className="h-8 w-8 shrink-0" aria-hidden="true">
        <AvatarFallback className={isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary'}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-sm font-medium">{isUser ? 'あなた' : 'AI'}</span>
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <MarkdownRenderer content={content} />
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
        onClick={handleCopy}
        aria-label={copied ? 'コピーしました' : 'メッセージをコピー'}
      >
        {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
        <span className="sr-only">{copied ? 'コピーしました' : 'メッセージをコピー'}</span>
      </Button>
    </article>
  )
}
