import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Connect4Plus',
  description: 'オンラインで2人対戦できるConnect4派生ゲーム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="bg-background min-h-screen">
        {children}
      </body>
    </html>
  )
} 