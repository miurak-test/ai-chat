/**
 * ホームページ（トップページ）
 *
 * このファイルはアプリケーションのトップページを定義します。
 * チャットコンテナを表示するシンプルなページです。
 *
 * 【役割】
 * - アプリケーションのエントリーポイント
 * - チャット機能へのアクセスを提供
 */

import { ChatContainer } from '@/components/chat/chat-container'

export default function Home() {
  return <ChatContainer />
}
