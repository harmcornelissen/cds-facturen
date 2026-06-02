'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    label: 'Overzicht',
    items: [
      {
        href: '/dashboard',
        label: 'Dashboard',
        icon: (
          <svg viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Facturatie',
    items: [
      {
        href: '/facturen',
        label: 'Facturen',
        icon: (
          <svg viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        ),
      },
      {
        href: '/offertes',
        label: 'Offertes',
        icon: (
          <svg viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="9" y1="13" x2="15" y2="13" />
          </svg>
        ),
      },
      {
        href: '/incasso',
        label: 'Automatische incasso',
        icon: (
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 2v20M2 12h20" />
          </svg>
        ),
      },
      {
        href: '/terugkerend',
        label: 'Terugkerend',
        icon: (
          <svg viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Beheer',
    items: [
      {
        href: '/klanten',
        label: 'Klanten',
        icon: (
          <svg viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
        ),
      },
      {
        href: '/financieel',
        label: 'Financieel',
        icon: (
          <svg viewBox="0 0 24 24">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
          </svg>
        ),
      },
      {
        href: '/bedrijfsprofielen',
        label: 'Bedrijfsprofielen',
        icon: (
          <svg viewBox="0 0 24 24">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
          </svg>
        ),
      },
      {
        href: '/instellingen',
        label: 'Instellingen',
        icon: (
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
          </svg>
        ),
      },
    ],
  },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* TOPBAR */}
      <div className="topbar">
        <div className="logo-area">
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <div className="logo-cds">CDS<span className="dot">·</span></div>
            <div className="logo-sub">Facturen</div>
          </Link>
          <div className="logo-div" />
        </div>
        <div className="topbar-center">
          <Link href="/bedrijfsprofielen" className="company-pill">
            <div className="cp-dot" />
            <span>+ Bedrijfsprofiel instellen</span>
          </Link>
        </div>
        <div className="topbar-right">
          <span className="plan-badge">Gratis</span>
          <div className="avatar">HC</div>
        </div>
      </div>

      {/* APP BODY */}
      <div className="app-body">
        {/* SIDEBAR */}
        <nav className="sidebar">
          {navItems.map((group) => (
            <div key={group.label}>
              <div className="nav-label">{group.label}</div>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item${isActive(item.href) ? ' active' : ''}`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* MAIN CONTENT */}
        {children}
      </div>
    </div>
  )
}
