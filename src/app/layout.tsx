import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Investment Tracker',
  description: 'Track your investments across stocks, mutual funds, FDs, and more',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  )
}
