import type { Metadata } from 'next'
import { Space_Mono, Syne } from 'next/font/google'
import './globals.css'
import NavBar from '@/components/NavBar'

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-sans',
})

const syne = Syne({
  weight: ['400', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-display',
})

export const metadata: Metadata = {
  title: 'Argoth - Structured Debate Platform',
  description: 'Engage in structured debates on topics that matter. Vote, discuss, and explore diverse perspectives.',
  keywords: ['debate', 'discussion', 'politics', 'philosophy', 'social platform'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${syne.variable}`}>
      <body>
        <NavBar />
        <main className="min-h-screen pt-20 pb-12">
          {children}
        </main>
      </body>
    </html>
  )
}
