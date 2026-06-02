import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CDS Facturen',
  description: 'Nederlands facturatieplatform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" style={{ height: '100%' }}>
      <body style={{ margin: 0, padding: 0, height: '100%' }}>
        {children}
      </body>
    </html>
  )
}
