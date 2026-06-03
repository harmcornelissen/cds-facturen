import Link from 'next/link'
import type { CSSProperties, FormEvent, ReactNode } from 'react'
import { colors, fonts, inputStyle, kpiTopColor, labelStyle, mutedText } from '@/app/lib/theme'
import { Icon, type IconName } from './Icon'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

function buttonStyle(variant: ButtonVariant): CSSProperties {
  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 8,
    border: `0.5px solid ${colors.border2}`,
    cursor: 'pointer',
    minHeight: 36,
    padding: '9px 14px',
    fontFamily: fonts.heading,
    fontSize: 13,
    fontWeight: 700,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
  }

  if (variant === 'primary') {
    return { ...base, background: colors.blue, borderColor: colors.blue, color: '#fff' }
  }
  if (variant === 'danger') {
    return { ...base, background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.35)', color: colors.red }
  }
  if (variant === 'ghost') {
    return { ...base, background: 'transparent', color: colors.muted }
  }
  return { ...base, background: colors.surface, color: colors.white }
}

export function Button({
  children,
  href,
  icon,
  variant = 'primary',
  type = 'button',
  disabled,
  onClick,
  style,
}: {
  children: ReactNode
  href?: string
  icon?: IconName
  variant?: ButtonVariant
  type?: 'button' | 'submit'
  disabled?: boolean
  onClick?: () => void
  style?: CSSProperties
}) {
  const composed = { ...buttonStyle(variant), opacity: disabled ? 0.55 : 1, ...style }
  const content = (
    <>
      {icon ? <Icon name={icon} size={14} /> : null}
      {children}
    </>
  )

  if (href) {
    return (
      <Link href={href} style={composed}>
        {content}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} style={composed}>
      {content}
    </button>
  )
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: ReactNode
  hint?: string
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <span style={labelStyle}>{label}</span>
      {children}
      {hint ? <span style={{ ...mutedText, fontSize: 11 }}>{hint}</span> : null}
    </label>
  )
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  style,
}: {
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  style?: CSSProperties
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      type={type}
      style={{ ...inputStyle, ...style }}
    />
  )
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
    />
  )
}

export function SelectInput({
  value,
  onChange,
  children,
  style,
}: {
  value: string | number
  onChange: (value: string) => void
  children: ReactNode
  style?: CSSProperties
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      style={{ ...inputStyle, appearance: 'auto', ...style }}
    >
      {children}
    </select>
  )
}

export function KpiCard({
  label,
  value,
  sub,
  color,
}: {
  label: string
  value: string
  sub: string
  color: string
}) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: colors.surface, border: `0.5px solid ${colors.border2}`, borderRadius: 8, padding: '18px 20px' }}>
      <div style={kpiTopColor(color)} />
      <div style={{ color: colors.muted, fontSize: 10, letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: fonts.heading, color: '#fff', fontSize: 25, fontWeight: 800, marginBottom: 4 }}>{value}</div>
      <div style={{ color: colors.muted, fontSize: 12 }}>{sub}</div>
    </div>
  )
}

export function SectionCard({
  title,
  action,
  children,
  style,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
  style?: CSSProperties
}) {
  return (
    <section style={{ background: colors.surface, border: `0.5px solid ${colors.border2}`, borderRadius: 8, overflow: 'hidden', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '15px 18px', borderBottom: `0.5px solid ${colors.border2}` }}>
        <h2 style={{ margin: 0, fontFamily: fonts.heading, fontSize: 14, color: '#fff' }}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function EmptyState({
  icon,
  title,
  body,
  action,
  compact,
}: {
  icon: IconName
  title: string
  body: string
  action?: ReactNode
  compact?: boolean
}) {
  return (
    <div style={{ padding: compact ? 28 : 56, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ width: 54, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.surface, border: `0.5px solid ${colors.border2}`, borderRadius: 8, color: colors.muted, marginBottom: 16 }}>
        <Icon name={icon} size={25} />
      </div>
      <div style={{ fontFamily: fonts.heading, fontWeight: 700, color: '#fff', fontSize: 15, marginBottom: 6 }}>{title}</div>
      <div style={{ ...mutedText, maxWidth: 440, marginBottom: action ? 18 : 0 }}>{body}</div>
      {action}
    </div>
  )
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    concept: { label: 'Concept', color: colors.muted, bg: colors.surface2 },
    verzonden: { label: 'Verzonden', color: colors.amber, bg: 'rgba(245,158,11,0.12)' },
    openstaand: { label: 'Verzonden', color: colors.amber, bg: 'rgba(245,158,11,0.12)' },
    betaald: { label: 'Betaald', color: colors.green, bg: 'rgba(16,185,129,0.12)' },
    verlopen: { label: 'Verlopen', color: colors.red, bg: 'rgba(239,68,68,0.12)' },
    incasso: { label: 'Incasso', color: '#6f8cff', bg: 'rgba(36,86,255,0.13)' },
  }
  const cfg = map[status] || map.concept
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: cfg.color, background: cfg.bg, borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>
      <span style={{ width: 5, height: 5, borderRadius: 999, background: cfg.color }} />
      {cfg.label}
    </span>
  )
}

export function Modal({
  open,
  title,
  children,
  footer,
  onClose,
}: {
  open: boolean
  title: string
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
}) {
  if (!open) return null
  return (
    <div
      onClick={(event) => {
        if (event.currentTarget === event.target) onClose()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(7,11,24,0.78)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
      }}
    >
      <div style={{ width: '100%', maxWidth: 620, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: colors.navy2, border: `0.5px solid ${colors.border2}`, borderRadius: 8 }}>
        <div style={{ padding: '18px 22px', borderBottom: `0.5px solid ${colors.border2}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: fonts.heading, fontWeight: 800, color: '#fff', fontSize: 16 }}>{title}</div>
          <button onClick={onClose} type="button" style={{ width: 30, height: 30, borderRadius: 8, border: `0.5px solid ${colors.border2}`, background: colors.surface, color: colors.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="x" size={15} />
          </button>
        </div>
        <div style={{ padding: 22, overflow: 'auto' }}>{children}</div>
        {footer ? <div style={{ padding: '16px 22px', borderTop: `0.5px solid ${colors.border2}`, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>{footer}</div> : null}
      </div>
    </div>
  )
}

export function Toast({ message }: { message: string }) {
  if (!message) return null
  return (
    <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 70, display: 'flex', alignItems: 'center', gap: 10, background: colors.navy3, color: colors.white, border: `0.5px solid ${colors.green}`, borderRadius: 8, padding: '12px 16px', boxShadow: '0 10px 35px rgba(0,0,0,0.35)', fontSize: 13 }}>
      <span style={{ width: 7, height: 7, borderRadius: 999, background: colors.green }} />
      {message}
    </div>
  )
}

export function preventDefault(handler: () => void) {
  return (event: FormEvent) => {
    event.preventDefault()
    handler()
  }
}
