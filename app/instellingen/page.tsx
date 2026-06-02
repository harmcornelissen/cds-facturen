'use client'

import { useState } from 'react'
import AppLayout from '@/components/AppLayout'

type Page = 'profiel' | 'beveiliging' | 'facturen' | 'notificaties' | 'abonnement' | 'api'

const settingsNav: { section: string; items: { id: Page; label: string; icon: React.ReactNode }[] }[] = [
  {
    section: 'Account',
    items: [
      { id: 'profiel', label: 'Mijn profiel', icon: <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
      { id: 'beveiliging', label: 'Beveiliging', icon: <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg> },
    ],
  },
  {
    section: 'Facturatie',
    items: [
      { id: 'facturen', label: 'Factuurinstellingen', icon: <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
      { id: 'notificaties', label: 'Notificaties', icon: <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg> },
    ],
  },
  {
    section: 'Plan',
    items: [
      { id: 'abonnement', label: 'Abonnement', icon: <svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
      { id: 'api', label: 'API & Integraties', icon: <svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> },
    ],
  },
]

export default function InstellingenPage() {
  const [activePage, setActivePage] = useState<Page>('profiel')
  const [toast, setToast] = useState('')
  const [unsaved, setUnsaved] = useState(false)
  const [toggles, setToggles] = useState({ herinneringen: true, betalingsbevestiging: true, nieuweFactuur: false, twofactor: false })
  const [profiel, setProfiel] = useState({ naam: '', email: '', telefoon: '', bedrijf: '' })

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2600)
  }

  function save() {
    setUnsaved(false)
    showToast('Instellingen opgeslagen')
  }

  function toggle(key: keyof typeof toggles) {
    setToggles(t => ({ ...t, [key]: !t[key] }))
    setUnsaved(true)
  }

  return (
    <AppLayout>
      <div className="settings-wrap">
        {/* SETTINGS NAV */}
        <div className="settings-nav">
          {settingsNav.map(group => (
            <div key={group.section}>
              <div className="sn-section">{group.section}</div>
              {group.items.map(item => (
                <div key={item.id} className={`sn-item${activePage === item.id ? ' active' : ''}`} onClick={() => setActivePage(item.id)}>
                  {item.icon}
                  {item.label}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* SETTINGS MAIN */}
        <div className="settings-main">

          {activePage === 'profiel' && (
            <div>
              <div className="sp-title">Mijn profiel</div>
              <div className="sp-sub">Beheer uw persoonlijke accountgegevens.</div>
              <div className="fsec">
                <div className="fsec-head">
                  <div>
                    <div className="fsec-title">Persoonlijke gegevens</div>
                    <div className="fsec-sub">Uw naam en contactinformatie</div>
                  </div>
                </div>
                <div className="fsec-body">
                  <div className="frow2">
                    <div className="sfield">
                      <label>Volledige naam</label>
                      <input type="text" placeholder="Voornaam Achternaam" value={profiel.naam} onChange={e => { setProfiel(p => ({ ...p, naam: e.target.value })); setUnsaved(true) }} />
                    </div>
                    <div className="sfield">
                      <label>E-mailadres</label>
                      <input type="email" placeholder="naam@bedrijf.nl" value={profiel.email} onChange={e => { setProfiel(p => ({ ...p, email: e.target.value })); setUnsaved(true) }} />
                    </div>
                  </div>
                  <div className="frow2">
                    <div className="sfield">
                      <label>Telefoonnummer</label>
                      <input type="tel" placeholder="+31 6 00000000" value={profiel.telefoon} onChange={e => { setProfiel(p => ({ ...p, telefoon: e.target.value })); setUnsaved(true) }} />
                    </div>
                    <div className="sfield">
                      <label>Bedrijfsnaam</label>
                      <input type="text" placeholder="Uw bedrijfsnaam" value={profiel.bedrijf} onChange={e => { setProfiel(p => ({ ...p, bedrijf: e.target.value })); setUnsaved(true) }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePage === 'beveiliging' && (
            <div>
              <div className="sp-title">Beveiliging</div>
              <div className="sp-sub">Beheer uw wachtwoord en beveiligingsinstellingen.</div>
              <div className="fsec">
                <div className="fsec-head"><div className="fsec-title">Wachtwoord</div></div>
                <div className="fsec-body">
                  <div className="sfield"><label>Huidig wachtwoord</label><input type="password" placeholder="••••••••" /></div>
                  <div className="frow2">
                    <div className="sfield"><label>Nieuw wachtwoord</label><input type="password" placeholder="Minimaal 8 tekens" /></div>
                    <div className="sfield"><label>Bevestig wachtwoord</label><input type="password" placeholder="••••••••" /></div>
                  </div>
                  <button className="btn-primary" style={{ width: 'fit-content' }} onClick={() => showToast('Wachtwoord gewijzigd')}>Wachtwoord wijzigen</button>
                </div>
              </div>
              <div className="fsec">
                <div className="fsec-head"><div className="fsec-title">Twee-factor authenticatie</div></div>
                <div className="fsec-body">
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <div className="toggle-label">2FA inschakelen</div>
                      <div className="toggle-sub">Extra beveiliging via authenticator app</div>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" checked={toggles.twofactor} onChange={() => toggle('twofactor')} />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePage === 'facturen' && (
            <div>
              <div className="sp-title">Factuurinstellingen</div>
              <div className="sp-sub">Stel de standaard opties in voor nieuwe facturen.</div>
              <div className="fsec">
                <div className="fsec-head"><div className="fsec-title">Standaard opties</div></div>
                <div className="fsec-body">
                  <div className="frow2">
                    <div className="sfield">
                      <label>BTW-tarief standaard</label>
                      <select onChange={() => setUnsaved(true)}>
                        <option>21%</option><option>9%</option><option>0%</option>
                      </select>
                    </div>
                    <div className="sfield">
                      <label>Betaaltermijn (dagen)</label>
                      <select onChange={() => setUnsaved(true)}>
                        <option>14 dagen</option><option>30 dagen</option><option>60 dagen</option>
                      </select>
                    </div>
                  </div>
                  <div className="sfield">
                    <label>Factuurprefix</label>
                    <input type="text" placeholder="Bijv. FAC-2026-" onChange={() => setUnsaved(true)} />
                    <div className="sfield-hint">Facturen krijgen automatisch een oplopend nummer: FAC-2026-0001</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePage === 'notificaties' && (
            <div>
              <div className="sp-title">Notificaties</div>
              <div className="sp-sub">Bepaal wanneer u meldingen ontvangt.</div>
              <div className="fsec">
                <div className="fsec-head"><div className="fsec-title">E-mailmeldingen</div></div>
                <div className="fsec-body">
                  {[
                    { key: 'herinneringen' as const, label: 'Betalingsherinneringen', sub: 'Ontvang een melding als facturen bijna verlopen' },
                    { key: 'betalingsbevestiging' as const, label: 'Betalingsbevestiging', sub: 'Ontvang een melding als een factuur betaald is' },
                    { key: 'nieuweFactuur' as const, label: 'Nieuwe factuur bevestiging', sub: 'Ontvang een kopie als u een factuur verstuurt' },
                  ].map(({ key, label, sub }) => (
                    <div key={key} className="toggle-row">
                      <div className="toggle-info">
                        <div className="toggle-label">{label}</div>
                        <div className="toggle-sub">{sub}</div>
                      </div>
                      <label className="toggle">
                        <input type="checkbox" checked={toggles[key]} onChange={() => toggle(key)} />
                        <span className="toggle-slider" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activePage === 'abonnement' && (
            <div>
              <div className="sp-title">Abonnement</div>
              <div className="sp-sub">Beheer uw plan en facturatie.</div>
              <div style={{ background: 'var(--blue-g)', border: '1.5px solid rgba(36,86,255,.35)', borderRadius: 13, padding: '20px 22px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Gratis plan</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>Tot 5 facturen per maand</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                    {['5 facturen/mnd', 'Basis sjabloon', 'PDF export'].map(f => (
                      <span key={f} style={{ fontSize: 11.5, background: 'rgba(36,86,255,.15)', color: 'var(--blue2)', borderRadius: 6, padding: '3px 10px' }}>{f}</span>
                    ))}
                  </div>
                </div>
                <button style={{ fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 700, background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer' }} onClick={() => showToast('Upgrade coming soon')}>Upgraden</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                {[
                  { name: 'Gratis', price: '€ 0', period: '/mnd', features: ['5 facturen/maand', 'Basis sjabloon', 'PDF export'], current: true },
                  { name: 'Starter', price: '€ 9', period: '/mnd', features: ['50 facturen/maand', '3 sjablonen', 'Klantenbeheer', 'E-mail herinneringen'], current: false },
                  { name: 'Professional', price: '€ 25', period: '/mnd', features: ['Onbeperkt facturen', 'Alle sjablonen', 'SEPA incasso', 'API toegang', 'Prioriteit support'], current: false },
                ].map(plan => (
                  <div key={plan.name} style={{ background: plan.current ? 'var(--blue-g)' : 'var(--surface)', border: plan.current ? '1.5px solid rgba(36,86,255,.4)' : '0.5px solid var(--border2)', borderRadius: 12, padding: 18 }}>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{plan.name}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Syne, sans-serif', color: '#fff', marginBottom: 8 }}>
                      {plan.price}<span style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'DM Sans, sans-serif', fontWeight: 400 }}>{plan.period}</span>
                    </div>
                    <ul style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, listStyle: 'none' }}>
                      {plan.features.map(f => <li key={f} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}><span style={{ color: 'var(--green)', fontSize: 11 }}>✓</span>{f}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePage === 'api' && (
            <div>
              <div className="sp-title">API & Integraties</div>
              <div className="sp-sub">Beheer API-sleutels en externe koppelingen.</div>
              <div className="fsec">
                <div className="fsec-head"><div className="fsec-title">API-sleutels</div></div>
                <div className="fsec-body">
                  <div style={{ padding: '24px', textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
                    API-toegang is beschikbaar in het Professional plan.
                  </div>
                </div>
              </div>
            </div>
          )}

          {unsaved && (
            <div style={{ position: 'sticky', bottom: 0, background: 'rgba(7,11,24,.92)', backdropFilter: 'blur(12px)', borderTop: '0.5px solid var(--border2)', padding: '12px 0', marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 13, color: 'var(--amber)' }}>U heeft niet-opgeslagen wijzigingen</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-secondary" onClick={() => setUnsaved(false)}>Annuleren</button>
                <button className="btn-primary" onClick={save}>Opslaan</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`toast${toast ? ' show' : ''}`}>
        <div className="toast-dot" />
        <span>{toast}</span>
      </div>
    </AppLayout>
  )
}
