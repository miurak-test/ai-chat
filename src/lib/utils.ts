/**
 * ユーティリティ関数
 *
 * このファイルはプロジェクト全体で使用される汎用的なヘルパー関数を提供します。
 *
 * 【提供機能】
 * - cn: Tailwind CSS のクラス名を条件付きで結合する関数
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * クラス名を条件付きで結合する関数
 *
 * clsx と tailwind-merge を組み合わせて、
 * 条件付きクラス名の結合と Tailwind の競合解決を行います。
 *
 * @param inputs - 結合するクラス名（条件付きも可）
 * @returns 結合されたクラス名文字列
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-blue-500', 'hover:bg-blue-600')
 * // → 'px-4 py-2 bg-blue-500 hover:bg-blue-600' (isActive が true の場合)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
