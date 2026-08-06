import { SHELL_BRANDING } from "../constants/shellBranding";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function normalizeHex(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  const short = /^#?([0-9a-f]{3})$/i.exec(trimmed);
  if (short) {
    return `#${short[1]
      .split("")
      .map((char) => `${char}${char}`)
      .join("")
      .toLowerCase()}`;
  }

  const long = /^#?([0-9a-f]{6})$/i.exec(trimmed);
  return long ? `#${long[1].toLowerCase()}` : null;
}

function hexToRgb(hex) {
  const safeHex = normalizeHex(hex);
  if (!safeHex) return null;
  const value = Number.parseInt(safeHex.slice(1), 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b]
    .map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

function rgbToHsl({ r, g, b }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const lightness = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l: lightness * 100 };

  const delta = max - min;
  const saturation =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

  let hue;
  switch (max) {
    case rn:
      hue = (gn - bn) / delta + (gn < bn ? 6 : 0);
      break;
    case gn:
      hue = (bn - rn) / delta + 2;
      break;
    default:
      hue = (rn - gn) / delta + 4;
      break;
  }

  return { h: hue * 60, s: saturation * 100, l: lightness * 100 };
}

function hslToHex({ h, s, l }) {
  const hue = (((h % 360) + 360) % 360) / 360;
  const saturation = clamp(s, 0, 100) / 100;
  const lightness = clamp(l, 0, 100) / 100;

  if (saturation === 0) {
    const gray = lightness * 255;
    return rgbToHex({ r: gray, g: gray, b: gray });
  }

  const hueToRgb = (p, q, tValue) => {
    let t = tValue;
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q =
    lightness < 0.5
      ? lightness * (1 + saturation)
      : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;

  return rgbToHex({
    r: hueToRgb(p, q, hue + 1 / 3) * 255,
    g: hueToRgb(p, q, hue) * 255,
    b: hueToRgb(p, q, hue - 1 / 3) * 255,
  });
}

function relativeLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const values = [rgb.r, rgb.g, rgb.b].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
}

export function contrastRatio(a, b) {
  const lighter = Math.max(relativeLuminance(a), relativeLuminance(b));
  const darker = Math.min(relativeLuminance(a), relativeLuminance(b));
  return (lighter + 0.05) / (darker + 0.05);
}

export function readableTextColor(background) {
  return contrastRatio(background, "#ffffff") >= contrastRatio(background, "#111827")
    ? "#ffffff"
    : "#111827";
}

function ensureSolidColor(hex, minimumContrast = 3.6) {
  let hsl = rgbToHsl(hexToRgb(hex));
  let resolved = normalizeHex(hex);
  let attempts = 0;

  while (contrastRatio(resolved, "#ffffff") < minimumContrast && attempts < 20) {
    hsl = { ...hsl, l: clamp(hsl.l - 4, 18, 62), s: clamp(hsl.s + 2, 35, 88) };
    resolved = hslToHex(hsl);
    attempts += 1;
  }

  return resolved;
}

function deriveColor(primaryHsl, hueOffset, saturation = 62, lightness = 42) {
  return hslToHex({
    h: primaryHsl.h + hueOffset,
    s: Math.max(primaryHsl.s, saturation),
    l: lightness,
  });
}

function deriveBackgroundTint(accent) {
  const accentHsl = rgbToHsl(hexToRgb(accent));
  return hslToHex({
    h: accentHsl.h,
    s: clamp(accentHsl.s, 28, 70),
    l: 94,
  });
}

export function recommendBrandingColors(primaryColor) {
  const primary =
    normalizeHex(primaryColor) || normalizeHex(SHELL_BRANDING.primaryColor);
  const safePrimary = ensureSolidColor(primary, 3.6);
  const primaryHsl = rgbToHsl(hexToRgb(safePrimary));
  const secondaryColor = ensureSolidColor(deriveColor(primaryHsl, 180), 3.6);
  const accentColor = ensureSolidColor(deriveColor(primaryHsl, 42), 3.6);

  return {
    secondaryColor,
    accentColor,
    secondaryBackgroundColor: deriveBackgroundTint(accentColor),
  };
}
