export const colors = {
  teal:    "#00d4c8",
  red:     "#ff4d6d",
  yellow:  "#f5c842",
  green:   "#3dffa0",
  bgDark:  "#060d1a",
  bgCard:  "#0c1828",
  bgPanel: "#0a1520",
  border:  "#1a3050",
  textPrimary: "#e8eef6",
  textMuted:   "#94afc8",
  textFaint:   "#5a7a99",
  textDisabled:"#3a5570",
} as const;

export const rgba = {
  teal:    (a: number) => `rgba(0,212,200,${a})`,
  red:     (a: number) => `rgba(255,77,109,${a})`,
  green:   (a: number) => `rgba(61,255,160,${a})`,
  blue:    (a: number) => `rgba(0,80,160,${a})`,
} as const;

export const passwordStrengthColors = [
  "transparent",
  colors.red,
  colors.yellow,
  colors.teal,
  colors.green,
] as const;
