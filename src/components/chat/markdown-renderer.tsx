/**
 * Markdown レンダラーコンポーネント
 *
 * このファイルはMarkdown形式のテキストをHTMLに変換して表示するコンポーネントを定義します。
 *
 * 【機能】
 * - Markdown のレンダリング（見出し、リスト、リンク、テーブルなど）
 * - GFM（GitHub Flavored Markdown）対応
 * - コードブロックのシンタックスハイライト
 * - インラインコードのスタイリング
 * - カスタムスタイリング（Tailwind CSS）
 */

'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CodeBlock } from './code-block'

interface MarkdownRendererProps {
  content: string    // レンダリングするMarkdownテキスト
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          const isInline = !match && !className

          if (isInline) {
            return (
              <code
                className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
                {...props}
              >
                {children}
              </code>
            )
          }

          return (
            <CodeBlock language={match?.[1]}>
              {String(children).replace(/\n$/, '')}
            </CodeBlock>
          )
        },
        p({ children }) {
          return <p className="mb-4 last:mb-0">{children}</p>
        },
        ul({ children }) {
          return <ul className="mb-4 list-disc pl-6">{children}</ul>
        },
        ol({ children }) {
          return <ol className="mb-4 list-decimal pl-6">{children}</ol>
        },
        li({ children }) {
          return <li className="mb-1">{children}</li>
        },
        h1({ children }) {
          return <h1 className="mb-4 text-2xl font-bold">{children}</h1>
        },
        h2({ children }) {
          return <h2 className="mb-3 text-xl font-bold">{children}</h2>
        },
        h3({ children }) {
          return <h3 className="mb-2 text-lg font-bold">{children}</h3>
        },
        blockquote({ children }) {
          return (
            <blockquote className="mb-4 border-l-4 border-muted-foreground/30 pl-4 italic">
              {children}
            </blockquote>
          )
        },
        a({ href, children }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:no-underline"
            >
              {children}
            </a>
          )
        },
        table({ children }) {
          return (
            <div className="mb-4 overflow-x-auto">
              <table className="min-w-full border-collapse border">{children}</table>
            </div>
          )
        },
        th({ children }) {
          return (
            <th className="border bg-muted px-4 py-2 text-left font-semibold">
              {children}
            </th>
          )
        },
        td({ children }) {
          return <td className="border px-4 py-2">{children}</td>
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
