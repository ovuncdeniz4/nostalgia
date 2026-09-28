// Visual tokens for the retro quiz. Shared by every screen.

export const colors = {
  bg0: '#1a0a2e',
  bg1: '#2d1b4e',
  bg2: '#0f051d',
  magenta: '#FF00FF',
  turquoise: '#00D9FF',
  purple: '#9D00FF',
  blue: '#0080FF',
  pink: '#FF1493',
  lime: '#00FF00',
  orange: '#FF8C00',
  yellow: '#FFD93B',
  hard: '#FF4C4C',
  white: '#FFFFFF',
  black: '#000000',
  card: 'rgba(255,255,255,0.05)',
  cardStrong: 'rgba(255,255,255,0.08)',
  cardBorder: 'rgba(255,255,255,0.1)',
  // Opaque panels. Glass fills let the background orbs read as if they sit on the controls.
  surface: '#221336',
  surfaceRaised: '#2d1a4a',
  textMuted: 'rgba(255,255,255,0.65)',
  overlay: 'rgba(0,0,0,0.72)',
};

// Mix a neon accent into the opaque surface so a selected tile stays solid.
export function tintSurface(hex: string, amount = 0.34): string {
  const clean = hex.replace('#', '');
  const channel = (start: number, base: number) => {
    const value = parseInt(clean.slice(start, start + 2), 16);
    return Math.round(value * amount + base * (1 - amount));
  };
  const mixed = [channel(0, 0x22), channel(2, 0x13), channel(4, 0x36)];
  return `#${mixed.map((part) => part.toString(16).padStart(2, '0')).join('')}`;
}

export const font = {
  display: 'Anton_400Regular',
};

export const layout = {
  maxWidth: 480,
  padding: 24,
  radius: 18,
};

export const teamPalettes = [
  { colors: ['#FF00FF', '#9D00FF'] as const, glow: 'rgba(255,0,255,0.5)' },
  { colors: ['#00D9FF', '#0099FF'] as const, glow: 'rgba(0,217,255,0.5)' },
  { colors: ['#FFD73B', '#FF8C00'] as const, glow: 'rgba(255,215,59,0.5)' },
  { colors: ['#FF1493', '#FF69B4'] as const, glow: 'rgba(255,20,147,0.5)' },
  { colors: ['#00FF85', '#00CC00'] as const, glow: 'rgba(0,255,133,0.5)' },
  { colors: ['#FF4C4C', '#CC0000'] as const, glow: 'rgba(255,76,76,0.5)' },
];
