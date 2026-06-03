'use client'

import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { appShell, colors } from '@/app/lib/theme'
import { ensureDefaultTestUser, readAuthSessionFromStorage, useAuth } from '@/app/lib/data'
import DevPlanToolbar from './DevPlanToolbar'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const publicRoutes = new Set(['/login', '/register', '/admin'])

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [auth] = useAuth()
  const [ready, setReady] = useState(false)
  const publicRoute = publicRoutes.has(pathname)
  const authenticated = Boolean(auth || (ready ? readAuthSessionFromStorage() : null))

  useEffect(() => {
    ensureDefaultTestUser()
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready || publicRoute || authenticated) return
    router.replace('/login')
  }, [authenticated, publicRoute, ready, router])

  if (publicRoute) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: colors.navy,
          color: colors.white,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 18,
          overflow: 'auto',
          minWidth: 0,
        }}
      >
        {children}
        <DevPlanToolbar />
      </main>
    )
  }

  if (!ready || !authenticated) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: colors.navy,
          color: colors.white,
        }}
      />
    )
  }

  return (
    <div className="app-shell" style={appShell}>
      <Topbar />
      <div className="app-main-row" style={{ display: 'flex', flex: 1, minHeight: 0, minWidth: 0 }}>
        <Sidebar />
        {children}
      </div>
      <DevPlanToolbar />
    </div>
  )
}
