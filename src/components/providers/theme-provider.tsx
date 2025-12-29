/**
 * テーマプロバイダーコンポーネント
 *
 * このファイルはアプリケーション全体にテーマ機能を提供するプロバイダーを定義します。
 *
 * 【機能】
 * - next-themes ライブラリをラップして使いやすくする
 * - ダークモード/ライトモードの状態管理
 * - システム設定の自動検出（ユーザーのOS設定に合わせる）
 * - テーマ切り替えの永続化（ローカルストレージ）
 */

'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
