'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const ww = (form.elements.namedItem('wachtwoord') as HTMLInputElement).value
    const bv = (form.elements.namedItem('bevestig') as HTMLInputElement).value
    if (ww !== bv) {
      setError('Wachtwoorden komen niet overeen')
      return
    }
    setError('')
    setLoading(true)
    setTimeout(() => router.push('/dashboard'), 800)
  }

  return (
    <div className="auth-body">
      <div className="auth-wrap">
        <div className="auth-logo">
          <div className="auth-logo-cds">CDS<span className="dot">·</span></div>
          <div className="auth-logo-sub">Facturen</div>
        </div>
        <div className="auth-card">
          <div className="auth-card-title">Account aanmaken</div>
          <div className="auth-card-sub">Gratis starten, geen creditcard nodig</div>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Naam</label>
              <input type="text" name="naam" placeholder="Voornaam Achternaam" required />
            </div>
            <div className="auth-field">
              <label>E-mailadres</label>
              <input type="email" name="email" placeholder="naam@bedrijf.nl" required />
            </div>
            <div className="auth-field">
              <label>Wachtwoord</label>
              <input type="password" name="wachtwoord" placeholder="Minimaal 8 tekens" required minLength={8} />
            </div>
            <div className="auth-field">
              <label>Wachtwoord bevestigen</label>
              <input type="password" name="bevestig" placeholder="••••••••" required />
            </div>
            <div className="auth-terms">
              Door te registreren gaat u akkoord met onze{' '}
              <a href="/voorwaarden">algemene voorwaarden</a> en{' '}
              <a href="/privacy">privacybeleid</a>.
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Account aanmaken...' : 'Gratis account aanmaken'}
            </button>
          </form>
        </div>
        <div className="auth-footer">
          Al een account? <Link href="/login">Inloggen</Link>
        </div>
      </div>
    </div>
  )
}
