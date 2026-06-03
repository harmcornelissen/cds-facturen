'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { colors, fonts } from '@/app/lib/theme'
import {
  clearAuthSession,
  companyProfileLabel,
  initials,
  resolveActiveCompanyIndex,
  useActiveCompanyIndex,
  useAuth,
  useCompanies,
  usePlan,
} from '@/app/lib/data'
import { Icon } from './Icon'

export default function Topbar() {
  const router = useRouter()
  const [companies] = useCompanies()
  const [activeCompanyIndex, setActiveCompanyIndex] = useActiveCompanyIndex()
  const [plan] = usePlan()
  const [auth] = useAuth()
  const [companyMenuOpen, setCompanyMenuOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const companyMenuRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const resolvedActiveIndex = resolveActiveCompanyIndex(companies, activeCompanyIndex)
  const activeCompany = companies[resolvedActiveIndex]
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1)
  const userName = auth?.naam || 'Gebruiker'
  const userEmail = auth?.email || ''

  useEffect(() => {
    if (companies.length === 0) {
      if (activeCompanyIndex !== 0) setActiveCompanyIndex(0)
      return
    }
    if (activeCompanyIndex !== resolvedActiveIndex) setActiveCompanyIndex(resolvedActiveIndex)
  }, [activeCompanyIndex, companies.length, resolvedActiveIndex, setActiveCompanyIndex])

  useEffect(() => {
    if (!menuOpen && !companyMenuOpen) return
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!(event.target instanceof Node)) return
      if (menuRef.current?.contains(event.target)) return
      if (companyMenuRef.current?.contains(event.target)) return
      setMenuOpen(false)
      setCompanyMenuOpen(false)
    }
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        setCompanyMenuOpen(false)
      }
    }
    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('touchstart', onPointerDown)
    window.addEventListener('keydown', onEscape)
    return () => {
      window.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('touchstart', onPointerDown)
      window.removeEventListener('keydown', onEscape)
    }
  }, [companyMenuOpen, menuOpen])

  function selectCompany(index: number) {
    setActiveCompanyIndex(index)
    setCompanyMenuOpen(false)
  }

  function logout() {
    clearAuthSession()
    setMenuOpen(false)
    router.push('/login')
  }

  return (
    <header
      className="app-topbar"
      style={{
        height: 52,
        flexShrink: 0,
        background: colors.navy2,
        borderBottom: `0.5px solid ${colors.border2}`,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '0 20px',
        minWidth: 0,
      }}
    >
      <div className="app-topbar-brand" style={{ width: 'var(--sidebar-width, 220px)', display: 'flex', alignItems: 'center', gap: 11, flexShrink: 0, minWidth: 0 }}>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
            CDS<span style={{ color: colors.blue }}>.</span>
          </div>
          <div className="app-topbar-subtitle" style={{ fontFamily: fonts.heading, color: colors.muted, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginTop: 3 }}>
            Facturen
          </div>
        </Link>
        <div className="app-topbar-divider" style={{ height: 22, width: 1, background: colors.border2 }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div ref={companyMenuRef} style={{ position: 'relative', display: 'inline-flex', maxWidth: '100%' }}>
          <button
            type="button"
            onClick={() => {
              setCompanyMenuOpen((current) => !current)
              setMenuOpen(false)
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 9,
              color: colors.white,
              background: colors.surface,
              border: `0.5px solid ${colors.border2}`,
              borderRadius: 8,
              padding: '6px 12px',
              maxWidth: '100%',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: 2, background: activeCompany?.accentColor || activeCompany?.brandColor || colors.blue, flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeCompany ? companyProfileLabel(activeCompany) : '+ Bedrijfsprofiel instellen'}
            </span>
            <Icon name="chevron" size={12} style={{ color: colors.muted }} />
          </button>

          {companyMenuOpen ? (
            <div style={{ position: 'absolute', top: 38, left: 0, width: 270, maxWidth: 'calc(100vw - 32px)', background: colors.navy2, border: `1px solid ${colors.border2}`, borderRadius: 8, boxShadow: '0 18px 42px rgba(0,0,0,0.42)', overflow: 'hidden', zIndex: 30 }}>
              {companies.length === 0 ? (
                <div style={{ padding: 13, color: colors.muted, fontSize: 12, lineHeight: 1.45 }}>
                  Geen bedrijfsprofielen
                  <Link href="/bedrijfsprofielen" onClick={() => setCompanyMenuOpen(false)} style={{ display: 'block', color: '#6f8cff', marginTop: 8, textDecoration: 'none', fontWeight: 800 }}>
                    Bedrijfsprofiel aanmaken
                  </Link>
                </div>
              ) : (
                companies.map((company, index) => {
                  const selected = index === resolvedActiveIndex
                  return (
                    <button
                      type="button"
                      key={company.id}
                      onClick={() => selectCompany(index)}
                      style={{
                        width: '100%',
                        border: 0,
                        borderBottom: index === companies.length - 1 ? 0 : `0.5px solid ${colors.border2}`,
                        background: selected ? colors.blueSoft : 'transparent',
                        color: colors.white,
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        cursor: 'pointer',
                        fontFamily: fonts.body,
                        fontSize: 13,
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                        <span style={{ width: 7, height: 7, borderRadius: 2, background: company.accentColor || company.brandColor || colors.blue, flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{companyProfileLabel(company)}</span>
                      </span>
                      {selected ? <span style={{ color: '#6f8cff', fontSize: 11, fontWeight: 800 }}>Actief</span> : null}
                    </button>
                  )
                })
              )}
              <Link href="/bedrijfsprofielen" onClick={() => setCompanyMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, borderTop: `0.5px solid ${colors.border2}`, color: colors.muted, padding: '10px 12px', textDecoration: 'none', fontSize: 12, fontWeight: 800 }}>
                <Icon name="company" size={14} />
                Profielen beheren
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <span className="app-plan-pill" style={{ fontFamily: fonts.heading, fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', background: colors.blue, color: '#fff', borderRadius: 999, padding: '4px 10px' }}>
          {planLabel}
        </span>
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            type="button"
            aria-label="Gebruikersmenu"
            onClick={() => {
              setMenuOpen((current) => !current)
              setCompanyMenuOpen(false)
            }}
            style={{ width: 30, height: 30, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.blueSoft, color: '#6f8cff', border: `1px solid ${colors.blue}`, fontFamily: fonts.heading, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
          >
            {initials(userName)}
          </button>
          {menuOpen ? (
            <div style={{ position: 'absolute', top: 38, right: 0, width: 230, background: colors.navy2, border: `1px solid ${colors.border2}`, borderRadius: 8, boxShadow: '0 18px 42px rgba(0,0,0,0.42)', overflow: 'hidden', zIndex: 20 }}>
              <div style={{ padding: 13, borderBottom: `0.5px solid ${colors.border2}` }}>
                <div style={{ color: '#fff', fontFamily: fonts.heading, fontWeight: 800, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
                {userEmail ? <div style={{ color: colors.muted, fontSize: 12, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</div> : null}
              </div>
              <button
                type="button"
                onClick={logout}
                style={{ width: '100%', border: 0, background: 'transparent', color: colors.red, padding: '11px 13px', textAlign: 'left', cursor: 'pointer', fontFamily: fonts.body, fontSize: 13, fontWeight: 700 }}
              >
                Uitloggen
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
