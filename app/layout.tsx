import type { Metadata } from 'next'
import { DM_Sans, Syne } from 'next/font/google'
import AppShell from './components/AppShell'
import { colors, rootVariables } from './lib/theme'

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
})

const syne = Syne({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-syne',
})

export const metadata: Metadata = {
  title: 'CDS Facturen',
  description: 'Nederlands facturatieplatform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${dmSans.variable} ${syne.variable}`} style={{ ...rootVariables, height: '100%' }}>
      <body style={{ margin: 0, minHeight: '100%', background: colors.navy }}>
        <style>{`
          *,
          *::before,
          *::after {
            box-sizing: border-box;
          }

          input::placeholder,
          textarea::placeholder {
            color: rgba(240,244,255,0.25);
            opacity: 1;
          }

          html,
          body {
            width: 100%;
            overflow: hidden;
          }

          .app-shell {
            --sidebar-width: 220px;
          }

          @media (max-width: 860px) {
            .app-shell {
              --sidebar-width: 64px;
            }

            .app-topbar {
              padding-left: 12px !important;
              padding-right: 12px !important;
              gap: 10px !important;
            }

            .app-sidebar {
              padding-top: 10px !important;
            }

            .app-sidebar-group-label,
            .app-sidebar-item-label,
            .app-topbar-subtitle,
            .app-topbar-divider,
            .app-plan-pill {
              display: none !important;
            }

            .app-sidebar a {
              justify-content: center !important;
              padding-left: 0 !important;
              padding-right: 0 !important;
            }

            .app-topbar-brand {
              justify-content: center;
              gap: 0 !important;
            }
          }

          @media (max-width: 560px) {
            .app-main-row {
              overflow-x: hidden;
            }
          }
        `}</style>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
