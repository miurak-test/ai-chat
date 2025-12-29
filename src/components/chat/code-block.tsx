/**
 * コードブロックコンポーネント
 *
 * このファイルはコードブロックをシンタックスハイライト付きで表示するコンポーネントを定義します。
 *
 * 【機能】
 * - シンタックスハイライト（言語に応じた色付け）
 * - コピーボタン（コードをクリップボードにコピー）
 * - 言語表示（コードブロックのヘッダー部分）
 * - ダークテーマ（One Dark スタイル）
 */

'use client'

import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CodeBlockProps {
  language?: string    // プログラミング言語（例: 'javascript', 'python'）
  children: string     // コード本文
}

export function CodeBlock({ language, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative my-4 overflow-hidden rounded-lg border bg-zinc-950">
      <div className="flex items-center justify-between border-b bg-zinc-900 px-4 py-2">
        <span className="text-xs text-zinc-400">{language || 'code'}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-zinc-400 hover:text-zinc-100"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'transparent',
          fontSize: '0.875rem',
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  )
}
