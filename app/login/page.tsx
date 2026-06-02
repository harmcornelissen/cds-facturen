'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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
          <div className="auth-card-title">Welkom terug</div>
          <div className="auth-card-sub">Log in op uw account</div>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>E-mailadres</label>
              <input type="email" placeholder="naam@bedrijf.nl" required />
            </div>
            <div className="auth-field">
              <div className="auth-field-header">
                <label>Wachtwoord</label>
                <a href="#" className="auth-forgot">Vergeten?</a>
              </div>
              <input type="password" placeholder="••••••••" required />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Inloggen...' : 'Inloggen'}
            </button>
          </form>
        </div>
        <div className="auth-footer">
          Nog geen account? <Link href="/register">Gratis aanmaken</Link>
        </div>
      </div>
    </div>
  )
}
