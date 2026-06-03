import type { CSSProperties } from 'react'

export const colors = {
  navy: '#070b18',
  navy2: '#0d1224',
  blue: '#2456ff',
  white: '#f0f4ff',
  muted: 'rgba(240,244,255,0.45)',
  border2: 'rgba(240,244,255,0.13)',
  surface: 'rgba(255,255,255,0.04)',
  green: '#10b981',
  red: '#ef4444',
  amber: '#f59e0b',
  navy3: '#111827',
  surface2: 'rgba(255,255,255,0.07)',
  muted2: 'rgba(240,244,255,0.25)',
  blueSoft: 'rgba(36,86,255,0.12)',
}

export const fonts = {
  heading: 'var(--font-syne), Syne, sans-serif',
  body: 'var(--font-dm-sans), "DM Sans", sans-serif',
}

export const rootVariables: CSSProperties = {
  '--navy': colors.navy,
  '--navy2': colors.navy2,
  '--blue': colors.blue,
  '--white': colors.white,
  '--muted': colors.muted,
  '--border2': colors.border2,
  '--surface': colors.surface,
  '--green': colors.green,
  '--red': colors.red,
  '--amber': colors.amber,
} as CSSProperties

export const appShell: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  height: '100vh',
  background: colors.navy,
  color: colors.white,
  fontFamily: fonts.body,
  overflow: 'hidden',
}

export const mainScroll: CSSProperties = {
  flex: 1,
  minWidth: 0,
  overflow: 'auto',
  padding: 'clamp(16px, 3vw, 32px)',
}

export const pageHeader: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  flexWrap: 'wrap',
  marginBottom: 24,
}

export const titleStyle: CSSProperties = {
  fontFamily: fonts.heading,
  fontSize: 21,
  fontWeight: 800,
  color: '#fff',
  letterSpacing: 0,
}

export const mutedText: CSSProperties = {
  color: colors.muted,
  fontSize: 13,
  lineHeight: 1.55,
}

export const cardStyle: CSSProperties = {
  background: colors.surface,
  border: `0.5px solid ${colors.border2}`,
  borderRadius: 8,
}

export const sectionHeadStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '16px 18px',
  borderBottom: `0.5px solid ${colors.border2}`,
}

export const sectionTitleStyle: CSSProperties = {
  fontFamily: fonts.heading,
  fontSize: 14,
  fontWeight: 700,
  color: '#fff',
}

export const inputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.05)',
  border: `0.5px solid ${colors.border2}`,
  borderRadius: 8,
  color: colors.white,
  fontFamily: fonts.body,
  fontSize: 13,
  outline: 'none',
  padding: '10px 12px',
}

export const labelStyle: CSSProperties = {
  color: colors.muted,
  fontSize: 12,
  fontWeight: 600,
}

export const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
}

export const thStyle: CSSProperties = {
  textAlign: 'left',
  color: colors.muted,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 1,
  textTransform: 'uppercase',
  borderBottom: `0.5px solid ${colors.border2}`,
  padding: '11px 14px',
  whiteSpace: 'nowrap',
}

export const tdStyle: CSSProperties = {
  color: colors.white,
  fontSize: 13,
  borderBottom: `0.5px solid rgba(240,244,255,0.07)`,
  padding: '13px 14px',
  verticalAlign: 'middle',
}

export function kpiTopColor(color: string): CSSProperties {
  return {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    background: color,
  }
}

export function grid(min = 220): CSSProperties {
  return formGrid(min, 3)
}

export function formGrid(min = 220, maxColumns = 3, gap = 14): CSSProperties {
  const totalGap = Math.max(0, maxColumns - 1) * gap
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, max(${min}px, calc((100% - ${totalGap}px) / ${maxColumns}))), 1fr))`,
    gap,
    width: '100%',
    overflow: 'hidden',
  }
}
