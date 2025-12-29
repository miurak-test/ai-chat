/**
 * Gemini AI クライアント設定ファイル
 *
 * このファイルは Google Cloud Vertex AI の Gemini モデルに接続するための
 * クライアントを初期化・管理します。
 *
 * 【役割】
 * - Vertex AI への接続設定
 * - Gemini モデルのインスタンス管理（シングルトンパターン）
 *
 * 【必要な環境変数】
 * - GCP_PROJECT_ID: Google Cloud プロジェクト ID
 * - GCP_LOCATION: リージョン（デフォルト: us-central1）
 */

import { VertexAI, GenerativeModel } from '@google-cloud/vertexai'

// 使用する AI モデル名（Gemini 2.0 Flash - 高速応答モデル）
export const DEFAULT_MODEL = 'gemini-2.0-flash'

// AI からの応答の最大トークン数（約4000文字程度）
export const MAX_OUTPUT_TOKENS = 4096

// Vertex AI クライアントのインスタンス（一度だけ作成して再利用）
let vertexAI: VertexAI | null = null

// Gemini モデルのインスタンス（一度だけ作成して再利用）
let generativeModel: GenerativeModel | null = null

/**
 * Gemini モデルのインスタンスを取得する関数
 *
 * 【動作】
 * 1. すでにモデルが初期化されている場合は、それを返す
 * 2. 初回呼び出し時は、環境変数から設定を読み込んでモデルを初期化
 *
 * 【エラー】
 * - GCP_PROJECT_ID が設定されていない場合はエラーをスロー
 *
 * @returns Gemini モデルのインスタンス
 */
export function getGenerativeModel(): GenerativeModel {
  // すでに初期化済みの場合は再利用（パフォーマンス向上のため）
  if (generativeModel) {
    return generativeModel
  }

  // 環境変数から GCP プロジェクト ID を取得
  const project = process.env.GCP_PROJECT_ID
  // リージョンを取得（未設定の場合は us-central1 を使用）
  const location = process.env.GCP_LOCATION || 'us-central1'

  // プロジェクト ID が設定されていない場合はエラー
  if (!project) {
    throw new Error('GCP_PROJECT_ID が環境変数に設定されていません')
  }

  // Vertex AI クライアントを初期化
  vertexAI = new VertexAI({ project, location })

  // Gemini モデルを取得（出力トークン数の設定を含む）
  generativeModel = vertexAI.getGenerativeModel({
    model: DEFAULT_MODEL,
    generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS },
  })

  return generativeModel
}

// デフォルトエクスポート（他のファイルからインポートしやすくするため）
const gemini = { getGenerativeModel }
export default gemini
