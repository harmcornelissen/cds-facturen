'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { PasswordInput } from '@/app/components/PasswordInput'
import { Button, Field, Toast, preventDefault } from '@/app/components/ui'
import { ensureDefaultTestUser, readUsersFromStorage, type StoredUser, writeAuthSession, writeUsersToStorage } from '@/app/lib/data'
import { colors, fonts, inputStyle, mutedText } from '@/app/lib/theme'

export default function RegisterPage() {
  const router = useRouter()
  const [naam, setNaam] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordRepeat, setPasswordRepeat] = useState('')
  const [toast, setToast] = useState('')

  function register() {
    setToast('')
    const normalizedEmail = email.trim().toLowerCase()
    if (!naam.trim() || !normalizedEmail || !password || !passwordRepeat) {
      setToast('Vul naam, e-mailadres en wachtwoord in.')
      return
    }
    if (password !== passwordRepeat) {
      setToast('Wachtwoorden komen niet overeen.')
      return
    }
    ensureDefaultTestUser()
    const users = readUsersFromStorage()
    if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
      setToast('Er bestaat al een account met dit e-mailadres.')
      return
    }

    const user: StoredUser = {
      id: crypto.randomUUID(),
      naam: naam.trim(),
      email: normalizedEmail,
      wachtwoord: btoa(password),
      plan: 'gratis',
      aangemaakt: new Date().toISOString(),
      premiumGegeven: false,
    }
    const session = {
      id: user.id,
      naam: user.naam,
      email: user.email,
      plan: 'gratis' as const,
    }

    writeUsersToStorage([user, ...users])
    writeAuthSession(session)
    router.push('/dashboard')
  }

  return (
    <div style={{ width: '100%', maxWidth: 430 }}>
      <div style={{ textAlign: 'center', marginBottom: 34 }}>
        <div style={{ fontFamily: fonts.heading, fontWeight: 800, fontSize: 33, color: '#fff', lineHeight: 1 }}>
          CDS<span style={{ color: colors.blue }}>.</span>
        </div>
        <div style={{ marginTop: 5, fontFamily: fonts.heading, fontSize: 11, fontWeight: 800, letterSpacing: 2, color: colors.muted, textTransform: 'uppercase' }}>
          Facturen
        </div>
      </div>

      <form
        onSubmit={preventDefault(register)}
        style={{
          background: colors.surface,
          border: `0.5px solid ${colors.border2}`,
          borderRadius: 8,
          padding: 32,
        }}
      >
        <h1 style={{ margin: '0 0 4px', fontFamily: fonts.heading, fontSize: 19, color: '#fff' }}>Account aanmaken</h1>
        <p style={{ ...mutedText, margin: '0 0 24px' }}>Gratis starten, geen creditcard nodig.</p>

        <div style={{ display: 'grid', gap: 14, width: '100%', overflow: 'hidden' }}>
          <Field label="Naam">
            <input value={naam} onChange={(event) => setNaam(event.target.value)} placeholder="Voornaam Achternaam" style={inputStyle} />
          </Field>
        </div>

        <div style={{ display: 'grid', gap: 14, marginTop: 14, width: '100%', overflow: 'hidden' }}>
          <Field label="E-mailadres">
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="naam@bedrijf.nl" style={inputStyle} />
          </Field>
          <Field label="Wachtwoord">
            <PasswordInput value={password} onChange={setPassword} placeholder="Minimaal 8 tekens" autoComplete="new-password" />
          </Field>
          <Field label="Wachtwoord herhalen">
            <PasswordInput value={passwordRepeat} onChange={setPasswordRepeat} placeholder="Herhaal wachtwoord" autoComplete="new-password" />
          </Field>
        </div>

        <p style={{ ...mutedText, fontSize: 11.5, margin: '18px 0' }}>
          Door te registreren gaat u akkoord met de voorwaarden en het privacybeleid.
        </p>

        <Button type="submit" style={{ width: '100%' }}>
          Account aanmaken
        </Button>
      </form>

      <div style={{ marginTop: 20, textAlign: 'center', color: colors.muted, fontSize: 13 }}>
        Al een account?{' '}
        <Link href="/login" style={{ color: '#6f8cff', textDecoration: 'none' }}>
          Inloggen
        </Link>
      </div>
      <Toast message={toast} />
    </div>
  )
}
