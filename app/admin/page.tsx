'use client'

import { useEffect, useState } from 'react'
import { Button, EmptyState, Field, Toast, preventDefault } from '@/app/components/ui'
import { colors, fonts, inputStyle, mainScroll, tdStyle, thStyle, titleStyle } from '@/app/lib/theme'
import { type Plan, type StoredUser, useUsers } from '@/app/lib/data'

const ADMIN_PASSWORD = 'CdsAdmin2026'
const planOptions: Array<{ value: Plan; label: string }> = [
  { value: 'gratis', label: 'Gratis' },
  { value: 'basis', label: 'Basis' },
  { value: 'professional', label: 'Professional' },
]

export default function AdminPage() {
  const [users, setUsers] = useUsers()
  const [draftUsers, setDraftUsers] = useState<StoredUser[]>([])
  const [password, setPassword] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    setDraftUsers(users)
  }, [users])

  function unlock() {
    if (password !== ADMIN_PASSWORD) {
      setToast('Admin wachtwoord klopt niet.')
      return
    }
    setUnlocked(true)
  }

  function updateUser(userId: string, patch: Partial<StoredUser>) {
    setDraftUsers((current) => current.map((user) => (user.id === userId ? { ...user, ...patch } : user)))
  }

  function save() {
    setUsers(draftUsers)
    setToast('Gebruikers opgeslagen. Wijzigingen gelden bij de volgende login.')
  }

  if (!unlocked) {
    return (
      <div style={{ width: '100%', maxWidth: 420 }}>
        <form
          onSubmit={preventDefault(unlock)}
          style={{ background: colors.surface, border: `0.5px solid ${colors.border2}`, borderRadius: 8, padding: 28 }}
        >
          <h1 style={{ ...titleStyle, margin: '0 0 6px' }}>Admin</h1>
          <div style={{ color: colors.muted, fontSize: 13, marginBottom: 20 }}>Voer het admin wachtwoord in.</div>
          <Field label="Wachtwoord">
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Admin wachtwoord" style={inputStyle} />
          </Field>
          <Button type="submit" style={{ width: '100%', marginTop: 18 }}>Inloggen</Button>
        </form>
        <Toast message={toast} />
      </div>
    )
  }

  return (
    <main style={{ ...mainScroll, width: '100%', maxWidth: 1100, maxHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <h1 style={{ ...titleStyle, margin: 0 }}>Admin gebruikers</h1>
          <div style={{ color: colors.muted, fontSize: 13, marginTop: 5 }}>Beheer handmatig plan en premiumstatus voor lokale accounts.</div>
        </div>
        <Button icon="check" onClick={save}>Opslaan</Button>
      </div>

      <section style={{ background: colors.surface, border: `0.5px solid ${colors.border2}`, borderRadius: 8, overflow: 'hidden' }}>
        {draftUsers.length === 0 ? (
          <EmptyState icon="users" title="Geen gebruikers" body="Er zijn nog geen geregistreerde gebruikers in localStorage." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 820, borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Naam</th>
                  <th style={thStyle}>E-mail</th>
                  <th style={thStyle}>Plan</th>
                  <th style={thStyle}>Aangemaakt</th>
                  <th style={thStyle}>Premium gegeven</th>
                </tr>
              </thead>
              <tbody>
                {draftUsers.map((user) => (
                  <tr key={user.id}>
                    <td style={{ ...tdStyle, fontFamily: fonts.heading, fontWeight: 800 }}>{user.naam}</td>
                    <td style={tdStyle}>{user.email}</td>
                    <td style={tdStyle}>
                      <select value={user.plan} onChange={(event) => updateUser(user.id, { plan: event.target.value as Plan })} style={inputStyle}>
                        {planOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                    </td>
                    <td style={tdStyle}>{formatDateTime(user.aangemaakt)}</td>
                    <td style={tdStyle}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: colors.white, fontSize: 13 }}>
                        <input
                          type="checkbox"
                          checked={user.premiumGegeven}
                          onChange={(event) => updateUser(user.id, { premiumGegeven: event.target.checked })}
                          style={{ accentColor: colors.blue }}
                        />
                        {user.premiumGegeven ? 'ja' : 'nee'}
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <Toast message={toast} />
    </main>
  )
}

function formatDateTime(value: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
