'use client'

import { useEffect, useRef, useState } from 'react'
import { Modal } from './ui'
import { colors, fonts } from '@/app/lib/theme'
import { getPlanMessage, type Plan, usePlan } from '@/app/lib/data'

const planLabels: Record<Plan, string> = {
  gratis: 'Gratis',
  basis: 'Basis',
  professional: 'Professional',
}

const comparisonRows = [
  { feature: 'Facturen', gratis: '5 per maand', basis: 'Onbeperkt', professional: 'Onbeperkt' },
  { feature: 'Offertes', gratis: 'Nee', basis: 'Ja', professional: 'Ja' },
  { feature: 'iDEAL', gratis: 'Nee', basis: 'Ja', professional: 'Ja' },
  { feature: 'Bedrijfsprofielen', gratis: '1', basis: '3', professional: 'Onbeperkt' },
  { feature: 'Incasso', gratis: 'Nee', basis: 'Nee', professional: 'Ja' },
]

export default function DevPlanToolbar() {
  const [plan, setPlan] = usePlan()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current) return
      if (event.target instanceof Node && rootRef.current.contains(event.target)) return
      setOpen(false)
    }
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('touchstart', onPointerDown)
    window.addEventListener('keydown', onEscape)
    return () => {
      window.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('touchstart', onPointerDown)
      window.removeEventListener('keydown', onEscape)
    }
  }, [open])

  function selectPlan(nextPlan: Plan) {
    if (nextPlan === plan) {
      setOpen(false)
      return
    }
    setPlan(nextPlan)
    setOpen(false)
    window.setTimeout(() => window.location.reload(), 0)
  }

  return (
    <div ref={rootRef} style={{ position: 'fixed', right: 18, bottom: 18, zIndex: 90, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
      {open ? (
        <div style={{ width: 190, border: `1px solid ${colors.border2}`, borderRadius: 8, overflow: 'hidden', background: colors.navy2, boxShadow: '0 18px 40px rgba(0,0,0,0.42)' }}>
          {(['gratis', 'basis', 'professional'] as Plan[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => selectPlan(item)}
              style={{
                width: '100%',
                border: 0,
                borderBottom: item === 'professional' ? 0 : `1px solid ${colors.border2}`,
                background: item === plan ? colors.blueSoft : 'transparent',
                color: colors.white,
                padding: '10px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                fontFamily: fonts.body,
                fontSize: 13,
              }}
            >
              <span>{planLabels[item]}</span>
              {item === plan ? <span style={{ color: colors.blue }}>Actief</span> : null}
            </button>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        style={{
          border: `1px solid ${colors.border2}`,
          background: colors.navy2,
          color: colors.white,
          borderRadius: 999,
          padding: '8px 12px',
          minHeight: 34,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          boxShadow: '0 14px 32px rgba(0,0,0,0.35)',
          fontFamily: fonts.heading,
          fontSize: 11.5,
          fontWeight: 800,
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: 999, background: colors.blue }} />
        Plan: {planLabels[plan]}
        <span style={{ color: colors.muted }}>▾</span>
      </button>
    </div>
  )
}

export function PlanRestrictionModal({
  open,
  onClose,
  plan,
  title = 'Upgrade nodig',
  message,
}: {
  open: boolean
  onClose: () => void
  plan: Plan
  title?: string
  message?: string
}) {
  return (
    <Modal open={open} title={title} onClose={onClose} footer={<button type="button" onClick={onClose} style={{ border: 0, background: colors.blue, color: '#fff', borderRadius: 8, padding: '9px 14px', cursor: 'pointer', fontFamily: fonts.heading, fontWeight: 800 }}>Sluiten</button>}>
      <div style={{ display: 'grid', gap: 16 }}>
        <div style={{ color: colors.white, lineHeight: 1.7 }}>{message || getPlanMessage(plan)}</div>
        <div style={{ border: `0.5px solid ${colors.border2}`, borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr repeat(3, 1fr)', background: colors.surface2, color: colors.white, fontFamily: fonts.heading, fontWeight: 800, fontSize: 11.5 }}>
            {['Functie', 'Gratis', 'Basis', 'Professional'].map((label) => (
              <div key={label} style={{ padding: '10px 9px', borderRight: label === 'Professional' ? 0 : `0.5px solid ${colors.border2}` }}>{label}</div>
            ))}
          </div>
          {comparisonRows.map((row) => (
            <div key={row.feature} style={{ display: 'grid', gridTemplateColumns: '1.2fr repeat(3, 1fr)', borderTop: `0.5px solid ${colors.border2}`, color: colors.muted, fontSize: 12 }}>
              <div style={{ padding: '9px', color: colors.white, fontWeight: 700, borderRight: `0.5px solid ${colors.border2}` }}>{row.feature}</div>
              <div style={{ padding: '9px', borderRight: `0.5px solid ${colors.border2}` }}>{row.gratis}</div>
              <div style={{ padding: '9px', borderRight: `0.5px solid ${colors.border2}` }}>{row.basis}</div>
              <div style={{ padding: '9px' }}>{row.professional}</div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}
