/**
 * 環境変数の型定義ファイル
 *
 * このファイルはTypeScriptで環境変数の型安全性を確保するための型定義です。
 * process.env にアクセスする際、適切な型チェックとオートコンプリートが提供されます。
 *
 * 【定義されている環境変数】
 * - ANTHROPIC_API_KEY: Anthropic API のキー（現在は未使用）
 * - MONGODB_URI: MongoDB Atlas の接続文字列
 * - NEXT_PUBLIC_APP_URL: アプリケーションの公開URL
 * - GCP_PROJECT_ID: Google Cloud プロジェクトID
 * - GCP_LOCATION: Google Cloud リージョン
 */

declare namespace NodeJS {
  interface ProcessEnv {
    ANTHROPIC_API_KEY: string        // Anthropic API キー
    MONGODB_URI: string              // MongoDB 接続文字列
    NEXT_PUBLIC_APP_URL: string      // アプリケーションURL
    GCP_PROJECT_ID: string           // GCP プロジェクトID
    GCP_LOCATION: string             // GCP リージョン
  }
}
