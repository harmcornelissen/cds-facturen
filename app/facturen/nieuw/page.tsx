'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'

type Regel = {
  id: number
  omschrijving: string
  aantal: number
  prijs: number
  btw: number
}

function fmt(n: number) {
  return '€ ' + n.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function FactuurNieuwPage() {
  const router = useRouter()
  const [toast, setToast] = useState('')
  const [regels, setRegels] = useState<Regel[]>([{ id: 1, omschrijving: '', aantal: 1, prijs: 0, btw: 21 }])
  const [klant, setKlant] = useState('')
  const [datum, setDatum] = useState(new Date().toISOString().split('T')[0])
  const [vervaldatum, setVervaldatum] = useState('')
  const [status, setStatus] = useState<'concept' | 'open'>('open')
  const [notities, setNotities] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2600)
  }

  function addRegel() {
    setRegels(r => [...r, { id: Date.now(), omschrijving: '', aantal: 1, prijs: 0, btw: 21 }])
  }

  function removeRegel(id: number) {
    setRegels(r => r.filter(x => x.id !== id))
  }

  function updateRegel(id: number, field: keyof Regel, value: string | number) {
    setRegels(r => r.map(x => x.id === id ? { ...x, [field]: value } : x))
  }

  const subtotaal = regels.reduce((s, r) => s + r.aantal * r.prijs, 0)
  const btwBedrag = regels.reduce((s, r) => s + r.aantal * r.prijs * (r.btw / 100), 0)
  const totaal = subtotaal + btwBedrag

  function opslaan(type: 'concept' | 'open') {
    setStatus(type)
    showToast(type === 'concept' ? 'Concept opgeslagen' : 'Factuur verstuurd')
    setTimeout(() => router.push('/facturen'), 1200)
  }

  return (
    <AppLayout>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* EDITOR */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', borderRight: '0.5px solid var(--border2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
                <Link href="/facturen" style={{ color: 'var(--blue2)', textDecoration: 'none' }}>Facturen</Link> / Nieuwe factuur
              </div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: '#fff' }}>Nieuwe factuur</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-secondary" onClick={() => opslaan('concept')}>Opslaan als concept</button>
              <button className="btn-primary" onClick={() => opslaan('open')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 2 15 22 11 13 2 9 22 2"/></svg>
                Versturen
              </button>
            </div>
          </div>

          {/* KLANT */}
          <div className="fsec" style={{ marginBottom: 14 }}>
            <div className="fsec-head" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 18px', borderBottom: '0.5px solid var(--border)' }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--blue-g)', border: '0.5px solid rgba(36,86,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--blue2)" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              </div>
              <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, color: '#fff' }}>Klant</span>
            </div>
            <div style={{ padding: '16px 18px' }}>
              <input
                type="text"
                placeholder="Zoek of selecteer een klant..."
                value={klant}
                onChange={e => setKlant(e.target.value)}
                style={{ background: 'rgba(255,255,255,.05)', border: '0.5px solid var(--border2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--white)', fontFamily: 'DM Sans, sans-serif', outline: 'none', width: '100%' }}
              />
            </div>
          </div>

          {/* FACTUURGEGEVENS */}
          <div className="fsec" style={{ marginBottom: 14 }}>
            <div className="fsec-head" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 18px', borderBottom: '0.5px solid var(--border)' }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--blue-g)', border: '0.5px solid rgba(36,86,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--blue2)" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, color: '#fff' }}>Factuurgegevens</span>
            </div>
            <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)' }}>Factuurdatum</label>
                <input type="date" value={datum} onChange={e => setDatum(e.target.value)} style={{ background: 'rgba(255,255,255,.05)', border: '0.5px solid var(--border2)', borderRadius: 7, padding: '8px 11px', fontSize: 13, color: 'var(--white)', fontFamily: 'DM Sans, sans-serif', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)' }}>Vervaldatum</label>
                <input type="date" value={vervaldatum} onChange={e => setVervaldatum(e.target.value)} style={{ background: 'rgba(255,255,255,.05)', border: '0.5px solid var(--border2)', borderRadius: 7, padding: '8px 11px', fontSize: 13, color: 'var(--white)', fontFamily: 'DM Sans, sans-serif', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)' }}>Status</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['concept', 'open'] as const).map(s => (
                    <div key={s} onClick={() => setStatus(s)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: status === s ? 'var(--blue-g)' : 'var(--surface)', border: `0.5px solid ${status === s ? 'rgba(36,86,255,.4)' : 'var(--border2)'}`, borderRadius: 20, padding: '5px 14px', fontSize: 12, color: status === s ? '#fff' : 'var(--muted)', cursor: 'pointer', transition: 'all .15s' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: s === 'concept' ? 'var(--muted)' : 'var(--blue)' }} />
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* REGELITEMS */}
          <div className="fsec" style={{ marginBottom: 14 }}>
            <div className="fsec-head" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 18px', borderBottom: '0.5px solid var(--border)' }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--blue-g)', border: '0.5px solid rgba(36,86,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--blue2)" strokeWidth="1.8"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              </div>
              <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, color: '#fff' }}>Regelitems</span>
            </div>
            <div style={{ padding: '16px 18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 90px 100px 36px', gap: 8, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>
                {['Omschrijving', 'Aantal', 'Prijs', 'BTW', ''].map(h => (
                  <span key={h} style={{ fontSize: 10, fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--muted)', textAlign: h === 'Aantal' || h === 'Prijs' || h === 'BTW' ? 'right' : 'left' }}>{h}</span>
                ))}
              </div>
              {regels.map(r => (
                <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 90px 100px 36px', gap: 8, alignItems: 'center', padding: '8px 0', borderBottom: '0.5px solid var(--border)' }}>
                  <input className="regel-input" placeholder="Omschrijving dienst of product" value={r.omschrijving} onChange={e => updateRegel(r.id, 'omschrijving', e.target.value)} style={{ background: 'rgba(255,255,255,.05)', border: '0.5px solid var(--border2)', borderRadius: 6, padding: '7px 10px', fontSize: 12.5, color: 'var(--white)', fontFamily: 'DM Sans, sans-serif', outline: 'none', width: '100%' }} />
                  <input type="number" className="regel-input" value={r.aantal} min={1} onChange={e => updateRegel(r.id, 'aantal', Number(e.target.value))} style={{ background: 'rgba(255,255,255,.05)', border: '0.5px solid var(--border2)', borderRadius: 6, padding: '7px 10px', fontSize: 12.5, color: 'var(--white)', fontFamily: 'DM Sans, sans-serif', outline: 'none', width: '100%', textAlign: 'right' }} />
                  <input type="number" className="regel-input" value={r.prijs} min={0} step={0.01} onChange={e => updateRegel(r.id, 'prijs', Number(e.target.value))} style={{ background: 'rgba(255,255,255,.05)', border: '0.5px solid var(--border2)', borderRadius: 6, padding: '7px 10px', fontSize: 12.5, color: 'var(--white)', fontFamily: 'DM Sans, sans-serif', outline: 'none', width: '100%', textAlign: 'right' }} />
                  <select value={r.btw} onChange={e => updateRegel(r.id, 'btw', Number(e.target.value))} style={{ background: 'rgba(255,255,255,.05)', border: '0.5px solid var(--border2)', borderRadius: 6, padding: '7px 6px', fontSize: 12, color: 'var(--white)', fontFamily: 'DM Sans, sans-serif', outline: 'none', width: '100%' }}>
                    <option value={21}>21%</option><option value={9}>9%</option><option value={0}>0%</option>
                  </select>
                  <button onClick={() => removeRegel(r.id)} style={{ width: 28, height: 28, background: 'transparent', border: '0.5px solid transparent', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', transition: 'all .15s' }}
                    onMouseEnter={e => { (e.target as HTMLElement).closest('button')!.style.background = 'rgba(239,68,68,.12)'; (e.target as HTMLElement).closest('button')!.style.color = 'var(--red)' }}
                    onMouseLeave={e => { (e.target as HTMLElement).closest('button')!.style.background = 'transparent'; (e.target as HTMLElement).closest('button')!.style.color = 'var(--muted)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
              <button onClick={addRegel} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'transparent', border: '0.5px dashed var(--border2)', borderRadius: 7, padding: '9px 14px', fontSize: 13, color: 'var(--muted)', cursor: 'pointer', marginTop: 10, width: '100%', transition: 'all .15s' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Regelitem toevoegen
              </button>

              {/* TOTALS */}
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 0, alignItems: 'flex-end' }}>
                {[['Subtotaal', fmt(subtotaal)], ['BTW', fmt(btwBedrag)]].map(([lbl, val]) => (
                  <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', gap: 60, width: 280 }}>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>{lbl}</span>
                    <span style={{ fontSize: 13, color: 'var(--white)', fontWeight: 500, textAlign: 'right', minWidth: 80 }}>{val}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0 6px', gap: 60, width: 280, borderTop: '0.5px solid var(--border2)', marginTop: 6 }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#fff' }}>Totaal</span>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, color: '#fff' }}>{fmt(totaal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* NOTITIES */}
          <div className="fsec">
            <div className="fsec-head" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 18px', borderBottom: '0.5px solid var(--border)' }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, color: '#fff' }}>Notities & betalingsinformatie</span>
            </div>
            <div style={{ padding: '16px 18px' }}>
              <textarea
                placeholder="Eventuele notities voor de klant, betalingsinstructies, etc."
                value={notities}
                onChange={e => setNotities(e.target.value)}
                rows={3}
                style={{ width: '100%', background: 'rgba(255,255,255,.05)', border: '0.5px solid var(--border2)', borderRadius: 7, padding: '9px 12px', fontSize: 13, color: 'var(--white)', fontFamily: 'DM Sans, sans-serif', outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
              />
            </div>
          </div>
        </div>

        {/* PREVIEW PANE */}
        <div style={{ width: 420, flexShrink: 0, overflowY: 'auto', background: 'var(--navy2)', padding: 24 }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', animation: 'blink 2s infinite' }} />
            Live voorbeeld
          </div>

          <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', fontFamily: 'DM Sans, sans-serif' }}>
            <div style={{ background: '#080c1a', padding: '20px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-.5px', lineHeight: 1 }}>CDS<span style={{ color: '#2456ff' }}>·</span></div>
                <div style={{ fontSize: 8, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginTop: 3 }}>Facturen</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: '#fff' }}>FACTUUR</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>FAC-2026-0001</div>
              </div>
            </div>
            <div style={{ height: 2, background: 'linear-gradient(90deg,#2456ff,#7c3aed 60%,transparent)' }} />

            <div style={{ background: '#f5f6fa', padding: '10px 24px', display: 'flex', borderBottom: '1px solid #eaedf5' }}>
              {[['Datum', datum || '—'], ['Vervaldatum', vervaldatum || '—'], ['Status', status]].map(([l, v]) => (
                <div key={l} style={{ flex: 1, paddingRight: 16 }}>
                  <div style={{ fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', color: '#9ca3af', marginBottom: 2 }}>{l}</div>
                  <div style={{ fontSize: 11, color: '#111827', fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ padding: '14px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, borderBottom: '1px solid #eaedf5' }}>
              <div>
                <div style={{ fontSize: 8, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#2456ff', fontWeight: 700, marginBottom: 5 }}>VAN</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 700, color: '#080c1a', marginBottom: 3 }}>Uw bedrijfsnaam</div>
                <div style={{ fontSize: 10, color: '#6b7280', lineHeight: 1.6 }}>facturen@bedrijf.nl</div>
              </div>
              <div>
                <div style={{ fontSize: 8, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#2456ff', fontWeight: 700, marginBottom: 5 }}>AAN</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 700, color: '#080c1a', marginBottom: 3 }}>{klant || '—'}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 50px 65px 70px', padding: '7px 24px', fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', color: '#9ca3af', borderBottom: '1.5px solid #080c1a' }}>
              <span>Omschrijving</span><span style={{ textAlign: 'right' }}>Aantal</span><span style={{ textAlign: 'right' }}>Prijs</span><span style={{ textAlign: 'right' }}>Totaal</span>
            </div>
            {regels.filter(r => r.omschrijving || r.prijs > 0).map(r => (
              <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1fr 50px 65px 70px', padding: '8px 24px', fontSize: 10.5, borderBottom: '1px solid #f0f1f5', alignItems: 'center' }}>
                <span style={{ color: '#111827', fontWeight: 500 }}>{r.omschrijving || '—'}</span>
                <span style={{ color: '#374151', textAlign: 'right' }}>{r.aantal}</span>
                <span style={{ color: '#374151', textAlign: 'right' }}>{fmt(r.prijs)}</span>
                <span style={{ color: '#374151', textAlign: 'right', fontWeight: 500 }}>{fmt(r.aantal * r.prijs)}</span>
              </div>
            ))}
            {regels.every(r => !r.omschrijving && r.prijs === 0) && (
              <div style={{ padding: '12px 24px', fontSize: 10, color: '#9ca3af', textAlign: 'center' }}>Voeg regelitems toe om ze hier te zien</div>
            )}

            <div style={{ padding: '10px 24px 14px', display: 'flex', justifyContent: 'flex-end', background: '#f5f6fa', borderTop: '1px solid #eaedf5' }}>
              <div style={{ width: 160 }}>
                {[['Subtotaal', fmt(subtotaal)], ['BTW', fmt(btwBedrag)]].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 10, color: '#6b7280' }}>
                    <span>{l}</span><span style={{ fontWeight: 500, color: '#374151' }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid #080c1a', marginTop: 5, paddingTop: 7 }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 700, color: '#080c1a' }}>Totaal</span>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 800, color: '#080c1a' }}>{fmt(totaal)}</span>
                </div>
              </div>
            </div>

            <div style={{ background: '#080c1a', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)' }}>
                <strong style={{ color: '#fff', fontSize: 10, display: 'block', marginBottom: 2, fontFamily: 'Syne, sans-serif' }}>IBAN</strong>
                NL00 BANK 0000 0000 00
              </div>
            </div>
            <div style={{ background: '#f0f4ff', borderTop: '1px solid #dde3f5', padding: '5px 24px', textAlign: 'center', fontSize: 9, color: '#9ca3af' }}>
              Gemaakt met <span style={{ color: '#2456ff', fontWeight: 700 }}>CDS Facturen</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`toast${toast ? ' show' : ''}`}>
        <div className="toast-dot" />
        <span>{toast}</span>
      </div>

      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </AppLayout>
  )
}
