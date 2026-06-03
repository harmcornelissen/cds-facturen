'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PasswordInput } from '@/app/components/PasswordInput'
import { Button, Field, Toast, preventDefault } from '@/app/components/ui'
import { authSessionFromUser, ensureDefaultTestUser, readUsersFromStorage, useAuth, writeAuthSession } from '@/app/lib/data'
import { colors, fonts, inputStyle, mutedText } from '@/app/lib/theme'

export default function LoginPage() {
  const router = useRouter()
  const [auth] = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (auth) router.replace('/dashboard')
  }, [auth, router])

  function login() {
    if (loading) return
    setLoading(true)
    setToast('')
    ensureDefaultTestUser()

    const normalizedEmail = email.trim().toLowerCase()
    const users = readUsersFromStorage()
    const user = users.find((item) => item.email.toLowerCase() === normalizedEmail)
    let encodedPassword = ''

    try {
      encodedPassword = btoa(password)
    } catch {
      encodedPassword = ''
    }

    if (!user || user.wachtwoord !== encodedPassword) {
      setToast('Ongeldig e-mailadres of wachtwoord')
      setLoading(false)
      return
    }

    const session = authSessionFromUser(user)
    writeAuthSession(session)
    router.push('/dashboard')
  }

  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontFamily: fonts.heading, fontWeight: 800, fontSize: 33, color: '#fff', lineHeight: 1 }}>
          CDS<span style={{ color: colors.blue }}>.</span>
        </div>
        <div style={{ marginTop: 5, fontFamily: fonts.heading, fontSize: 11, fontWeight: 800, letterSpacing: 2, color: colors.muted, textTransform: 'uppercase' }}>
          Facturen
        </div>
      </div>

      <form
        onSubmit={preventDefault(login)}
        style={{
          background: colors.surface,
          border: `0.5px solid ${colors.border2}`,
          borderRadius: 8,
          padding: 32,
        }}
      >
        <h1 style={{ margin: '0 0 4px', fontFamily: fonts.heading, fontSize: 19, color: '#fff' }}>Welkom terug</h1>
        <p style={{ ...mutedText, margin: '0 0 26px' }}>Log in op uw account.</p>

        <div style={{ display: 'grid', gap: 16, width: '100%', overflow: 'hidden' }}>
          <Field label="E-mailadres">
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="naam@bedrijf.nl" style={inputStyle} />
          </Field>
          <Field label="Wachtwoord">
            <PasswordInput value={password} onChange={setPassword} placeholder="********" autoComplete="current-password" />
          </Field>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, marginBottom: 18 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: colors.muted, fontSize: 12 }}>
            <input type="checkbox" style={{ accentColor: colors.blue }} />
            Ingelogd blijven
          </label>
          <Link href="/login" style={{ color: '#6f8cff', fontSize: 12, textDecoration: 'none' }}>
            Wachtwoord vergeten?
          </Link>
        </div>

        <Button type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Inloggen...' : 'Inloggen'}
        </Button>
      </form>

      <div style={{ marginTop: 20, textAlign: 'center', color: colors.muted, fontSize: 13 }}>
        Nog geen account?{' '}
        <Link href="/register" style={{ color: '#6f8cff', textDecoration: 'none' }}>
          Registreer gratis
        </Link>
      </div>
      <Toast message={toast} />
    </div>
  )
}
