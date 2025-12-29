/**
 * MongoDB データベース接続管理ファイル
 *
 * このファイルは MongoDB Atlas（クラウドデータベース）への接続を管理します。
 * 接続を効率的に再利用するため、一度確立した接続をキャッシュします。
 *
 * 【役割】
 * - MongoDB への接続確立
 * - 接続のキャッシュ管理（再利用でパフォーマンス向上）
 *
 * 【必要な環境変数】
 * - MONGODB_URI: MongoDB Atlas の接続文字列
 *   例: mongodb+srv://user:password@cluster.mongodb.net/dbname
 */

import mongoose from 'mongoose'

// 接続キャッシュの型定義
interface MongooseCache {
  conn: typeof mongoose | null      // 確立済みの接続
  promise: Promise<typeof mongoose> | null  // 接続中のPromise
}

// グローバル変数の型宣言（Next.js のホットリロード対策）
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined
}

// 接続キャッシュの初期化（グローバル変数から取得、なければ新規作成）
const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
}

// グローバル変数にキャッシュを保存（開発時のホットリロードで接続が増えるのを防ぐ）
if (!global.mongooseCache) {
  global.mongooseCache = cached
}

/**
 * データベースに接続する関数
 *
 * 【動作】
 * 1. すでに接続済みの場合は、既存の接続を返す
 * 2. 接続中の場合は、その完了を待つ
 * 3. 未接続の場合は、新しい接続を確立
 *
 * 【エラー】
 * - MONGODB_URI が設定されていない場合はエラーをスロー
 * - 接続に失敗した場合はエラーをスロー
 *
 * @returns MongoDB の接続オブジェクト
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  // 環境変数から接続文字列を取得
  const MONGODB_URI = process.env.MONGODB_URI

  // 接続文字列が設定されていない場合はエラー
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI が環境変数に設定されていません')
  }

  // すでに接続済みの場合は再利用
  if (cached.conn) {
    return cached.conn
  }

  // 接続処理が進行中でない場合は、新しい接続を開始
  if (!cached.promise) {
    // 接続オプション設定
    const opts = {
      bufferCommands: false,  // 接続前のコマンドをバッファリングしない
    }

    // MongoDB に接続（非同期処理）
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB に接続しました')
      return mongoose
    })
  }

  // 接続完了を待つ
  try {
    cached.conn = await cached.promise
  } catch (e) {
    // 接続失敗時はキャッシュをクリア（次回再試行できるように）
    cached.promise = null
    throw e
  }

  return cached.conn
}

// デフォルトエクスポート
export default connectToDatabase
