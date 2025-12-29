import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'AI Chat - Gemini搭載AIチャットボット',
  description: 'Google Gemini 2.0 Flashを搭載した高速AIチャットボット。Markdown対応、コードハイライト、ダークモード対応。',
  keywords: ['AI', 'チャットボット', 'Gemini', 'Google', 'Next.js'],
  authors: [{ name: 'miuken327' }],
  openGraph: {
    title: 'AI Chat - Gemini搭載AIチャットボット',
    description: 'Google Gemini 2.0 Flashを搭載した高速AIチャットボット',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Chat - Gemini搭載AIチャットボット',
    description: 'Google Gemini 2.0 Flashを搭載した高速AIチャットボット',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
