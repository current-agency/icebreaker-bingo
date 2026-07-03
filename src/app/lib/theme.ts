import type { CSSProperties } from 'react';

export const FONT_SANS = '"Aeonik", "Helvetica Neue", Helvetica, Arial, sans-serif';
export const FONT_MONO = '"Aeonik Fono", "Helvetica Neue", ui-monospace, monospace';

export const monoLabelStyle: CSSProperties = {
  fontFamily: FONT_MONO,
  fontSize: 11,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: '#5C5C5C',
};

export const pageStyle: CSSProperties = {
  minHeight: '100vh',
  background: '#E7E8E3',
  fontFamily: FONT_SANS,
  boxSizing: 'border-box',
};

export function monoButtonStyle(variant: 'outline' | 'primary'): CSSProperties {
  const base: CSSProperties = {
    fontFamily: FONT_MONO,
    fontSize: 14,
    fontWeight: 700,
    borderRadius: '0.25rem',
    padding: '8px 20px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    border: '1.5px solid',
  };

  if (variant === 'primary') {
    return { ...base, color: '#FBFCF9', background: '#0100FE', borderColor: '#0100FE' };
  }

  return { ...base, color: '#2C2C2C', background: 'transparent', borderColor: '#2C2C2C' };
}
