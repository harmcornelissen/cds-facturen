'use client'

import { useState, type CSSProperties } from 'react'
import { inputStyle } from '@/app/lib/theme'

const hiddenIconColor = 'rgba(240,244,255,0.45)'
const hoverIconColor = 'rgba(240,244,255,0.8)'

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeSlashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

export function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete,
  style,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoComplete?: string
  style?: CSSProperties
}) {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{ ...inputStyle, paddingRight: '44px', ...style }}
      />
      <button
        type="button"
        aria-label={visible ? 'Wachtwoord verbergen' : 'Wachtwoord tonen'}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: hovered ? hoverIconColor : hiddenIconColor,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
      >
        {visible ? <EyeSlashIcon /> : <EyeIcon />}
      </button>
    </div>
  )
}
