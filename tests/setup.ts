/**
 * テストセットアップファイル
 *
 * このファイルはVitest テスト実行時の初期設定を行います。
 *
 * 【設定内容】
 * - jest-dom のカスタムマッチャーをインポート
 * - React をグローバルに利用可能にする（JSX用）
 */

import '@testing-library/jest-dom'
import React from 'react'

// JSX のために React をグローバルに利用可能にする
globalThis.React = React
