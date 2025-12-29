/**
 * ヘッダーコンポーネント
 *
 * このファイルはアプリケーションの上部に表示されるヘッダーを定義します。
 *
 * 【機能】
 * - メニューボタン（モバイル用サイドバー表示）
 * - アプリケーションタイトル表示
 * - 新規チャット作成ボタン
 * - テーマ切り替えボタン（ダークモード/ライトモード）
 */

'use client'

import { Menu, MessageSquarePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './theme-toggle'

interface HeaderProps {
  onMenuClick: () => void    // メニューボタンクリック時のコールバック
  onNewChat: () => void      // 新規チャットボタンクリック時のコールバック
}

export function Header({ onMenuClick, onNewChat }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">メニュー</span>
        </Button>
        <h1 className="text-lg font-semibold">AI Chat</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onNewChat}>
          <MessageSquarePlus className="h-5 w-5" />
          <span className="sr-only">新しいチャット</span>
        </Button>
        <ThemeToggle />
      </div>
    </header>
  )
}
