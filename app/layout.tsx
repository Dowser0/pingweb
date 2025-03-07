import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PingWeb - Jogo de Ping Pong Online',
  description: 'Um jogo de ping pong moderno com vários modos de jogo e personalização',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
} 