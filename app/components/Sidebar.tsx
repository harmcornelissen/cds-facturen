'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { canCreateOffer, canUseIncasso, usePlan } from '@/app/lib/data'
import { colors, fonts } from '@/app/lib/theme'
import { Icon, type IconName } from './Icon'

type SidebarItem = { href: string; label: string; icon: IconName }

export default function Sidebar() {
  const pathname = usePathname()
  const [plan] = usePlan()

  const groups: Array<{ label: string; items: SidebarItem[] }> = [
    {
      label: 'Overzicht',
      items: [{ href: '/dashboard', label: 'Dashboard', icon: 'dashboard' as IconName }],
    },
    {
      label: 'Facturatie',
      items: [
        { href: '/facturen', label: 'Facturen', icon: 'invoice' as IconName },
        ...(canCreateOffer(plan) ? [{ href: '/offertes', label: 'Offertes', icon: 'quote' as IconName }] : []),
        ...(canUseIncasso(plan) ? [{ href: '/terugkerend', label: 'Terugkerend', icon: 'repeat' as IconName }] : []),
        ...(canUseIncasso(plan) ? [{ href: '/incasso', label: 'Automatische incasso', icon: 'bank' as IconName }] : []),
      ],
    },
    {
      label: 'Beheer',
      items: [
        { href: '/klanten', label: 'Klanten', icon: 'users' as IconName },
        { href: '/financieel', label: 'Financieel', icon: 'finance' as IconName },
        { href: '/bedrijfsprofielen', label: 'Bedrijfsprofielen', icon: 'company' as IconName },
        { href: '/instellingen', label: 'Instellingen', icon: 'settings' as IconName },
      ],
    },
  ]

  function active(href: string) {
    if (href === '/dashboard') return pathname === '/' || pathname === '/dashboard'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <aside
      className="app-sidebar"
      style={{
        width: 'var(--sidebar-width, 220px)',
        flexShrink: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        background: colors.navy2,
        borderRight: `0.5px solid ${colors.border2}`,
        padding: '15px 0',
      }}
    >
      {groups.map((group) => (
        <div key={group.label} style={{ marginBottom: 8 }}>
          <div
            className="app-sidebar-group-label"
            style={{
              color: colors.muted,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.4,
              textTransform: 'uppercase',
              padding: '14px 18px 7px',
            }}
          >
            {group.label}
          </div>
          {group.items.map((item) => {
            const isActive = active(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  minHeight: 38,
                  padding: '9px 18px',
                  borderLeft: `2px solid ${isActive ? colors.blue : 'transparent'}`,
                  background: isActive ? colors.blueSoft : 'transparent',
                  color: isActive ? colors.white : colors.muted,
                  textDecoration: 'none',
                  fontSize: 13.5,
                  fontFamily: fonts.body,
                  minWidth: 0,
                }}
              >
                <Icon name={item.icon} size={15} />
                <span className="app-sidebar-item-label" style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
              </Link>
            )
          })}
        </div>
      ))}
    </aside>
  )
}
