export const Colors = {
  // ─── Primary (Forest Green) ──────────────────────
  primary: '#2D6A4F',
  primaryDark: '#1F4E37',
  primaryLight: '#52B788',
  primarySoft: '#D8F3DC',

  // ─── Accent (Warm Orange) ────────────────────────
  accent: '#F4A261',
  accentDark: '#E76F51',
  accentSoft: '#FCE3CC',

  // ─── Backgrounds ────────────────────────────────
  bg: '#FAFAF7',
  bgAlt: '#F3F2EC',
  card: '#FFFFFF',

  // ─── Text / Ink ─────────────────────────────────
  ink: '#1B2A24',
  ink2: '#4E5C56',
  ink3: '#8A958F',

  // ─── Borders ────────────────────────────────────
  line: '#E7E5DC',

  // ─── Semantic ───────────────────────────────────
  good: '#2D6A4F',
  bad: '#E63946',
  badSoft: '#FCE6E8',
  warn: '#F4A261',

  // ─── Dark Mode Overrides ────────────────────────
  dark: {
    bg: '#0F1A14',
    bgAlt: '#162019',
    card: '#1B2A24',
    ink: '#E8EDE9',
    ink2: '#A8B5AE',
    ink3: '#6B7C73',
    line: '#2D3D34',
  },
} as const;

export type ColorKey = keyof typeof Colors;
