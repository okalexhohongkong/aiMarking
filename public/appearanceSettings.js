export const appearanceStorageKey = 'wecom-ai-customer-service.appearance';

export const defaultAppearance = {
  accentColor: '#0284c7',
  sidebarColor: '#0c4a6e',
  backgroundColor: '#f0f8ff',
  panelColor: '#ffffff',
  textColor: '#1f2937',
  fontPreset: 'system',
  customFont: '',
  fontSize: 14
};

export const fontPresets = {
  system: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  heiti: '"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif',
  songti: '"Songti SC", SimSun, "Noto Serif CJK SC", serif',
  kaiti: '"Kaiti SC", KaiTi, "STKaiti", serif',
  mono: '"SFMono-Regular", Consolas, "Liberation Mono", monospace'
};

const minFontSize = 13;
const maxFontSize = 24;

export function normalizeAppearance(input = {}) {
  const fontPreset = normalizeFontPreset(input.fontPreset);
  return {
    accentColor: normalizeHexColor(input.accentColor, defaultAppearance.accentColor),
    sidebarColor: normalizeHexColor(input.sidebarColor, defaultAppearance.sidebarColor),
    backgroundColor: normalizeHexColor(input.backgroundColor, defaultAppearance.backgroundColor),
    panelColor: normalizeHexColor(input.panelColor, defaultAppearance.panelColor),
    textColor: normalizeHexColor(input.textColor, defaultAppearance.textColor),
    fontPreset,
    customFont: sanitizeCustomFont(input.customFont),
    fontSize: clampFontSize(input.fontSize)
  };
}

export function applyAppearanceSettings(settings, root) {
  const normalized = normalizeAppearance(settings);
  if (!root?.style) {
    return normalized;
  }

  root.style.setProperty('--bg', normalized.backgroundColor);
  root.style.setProperty('--panel', normalized.panelColor);
  root.style.setProperty('--ink', normalized.textColor);
  root.style.setProperty('--muted', mixHexColors(normalized.textColor, normalized.panelColor, 0.42));
  root.style.setProperty('--line', mixHexColors(normalized.panelColor, normalized.textColor, 0.15));
  root.style.setProperty('--accent', normalized.accentColor);
  root.style.setProperty('--accent-strong', darkenHexColor(normalized.accentColor, 0.22));
  root.style.setProperty('--accent-soft', mixHexColors(normalized.panelColor, normalized.accentColor, 0.12));
  root.style.setProperty('--accent-contrast', contrastTextColor(normalized.accentColor));
  root.style.setProperty('--sidebar-bg', normalized.sidebarColor);
  root.style.setProperty('--sidebar-hover', mixHexColors(normalized.sidebarColor, '#ffffff', 0.1));
  root.style.setProperty('--sidebar-accent', mixHexColors(normalized.sidebarColor, normalized.accentColor, 0.38));
  root.style.setProperty('--font-base', `${normalized.fontSize}px`);
  root.style.setProperty('--app-font-family', resolveFontFamily(normalized));

  return normalized;
}

export function loadAppearanceSettings(storage) {
  if (!storage) {
    return { ...defaultAppearance };
  }

  try {
    return normalizeAppearance(JSON.parse(storage.getItem(appearanceStorageKey) || '{}'));
  } catch {
    return { ...defaultAppearance };
  }
}

export function saveAppearanceSettings(storage, settings) {
  const normalized = normalizeAppearance(settings);
  if (storage) {
    storage.setItem(appearanceStorageKey, JSON.stringify(normalized));
  }
  return normalized;
}

export function bindAppearanceSettings({ elements, root, storage } = {}) {
  let current = applyAppearanceSettings(loadAppearanceSettings(storage), root);
  writeAppearanceForm(elements, current);

  if (!elements?.form) {
    return current;
  }

  elements.form.addEventListener('submit', (event) => event.preventDefault());

  const update = () => {
    current = saveAppearanceSettings(storage, readAppearanceForm(elements));
    applyAppearanceSettings(current, root);
    writeAppearanceForm(elements, current);
  };

  [
    elements.accentColor,
    elements.sidebarColor,
    elements.backgroundColor,
    elements.panelColor,
    elements.textColor,
    elements.fontPreset,
    elements.customFont,
    elements.fontSize,
    elements.fontSizeNumber
  ]
    .filter(Boolean)
    .forEach((element) => element.addEventListener('input', update));

  elements.resetButton?.addEventListener('click', () => {
    current = saveAppearanceSettings(storage, defaultAppearance);
    applyAppearanceSettings(current, root);
    writeAppearanceForm(elements, current);
  });

  return current;
}

export function readAppearanceForm(elements = {}) {
  return normalizeAppearance({
    accentColor: elements.accentColor?.value,
    sidebarColor: elements.sidebarColor?.value,
    backgroundColor: elements.backgroundColor?.value,
    panelColor: elements.panelColor?.value,
    textColor: elements.textColor?.value,
    fontPreset: elements.fontPreset?.value,
    customFont: elements.customFont?.value,
    fontSize: elements.fontSizeNumber?.value || elements.fontSize?.value
  });
}

export function writeAppearanceForm(elements = {}, settings = defaultAppearance) {
  const normalized = normalizeAppearance(settings);
  setElementValue(elements.accentColor, normalized.accentColor);
  setElementValue(elements.sidebarColor, normalized.sidebarColor);
  setElementValue(elements.backgroundColor, normalized.backgroundColor);
  setElementValue(elements.panelColor, normalized.panelColor);
  setElementValue(elements.textColor, normalized.textColor);
  setElementValue(elements.fontPreset, normalized.fontPreset);
  setElementValue(elements.customFont, normalized.customFont);
  setElementValue(elements.fontSize, String(normalized.fontSize));
  setElementValue(elements.fontSizeNumber, String(normalized.fontSize));
  if (elements.fontSizeLabel) {
    elements.fontSizeLabel.textContent = `${normalized.fontSize}px`;
  }
  if (elements.customFont) {
    elements.customFont.disabled = normalized.fontPreset !== 'custom';
  }
}

export function resolveFontFamily(settings = defaultAppearance) {
  const normalized = normalizeAppearance(settings);
  if (normalized.fontPreset === 'custom') {
    return sanitizeCustomFontStack(normalized.customFont);
  }
  return fontPresets[normalized.fontPreset] || fontPresets.system;
}

export function normalizeHexColor(value, fallback = '#000000') {
  const text = String(value || '').trim();
  if (/^#[0-9a-f]{6}$/i.test(text)) {
    return text.toLowerCase();
  }
  if (/^#[0-9a-f]{3}$/i.test(text)) {
    return `#${text[1]}${text[1]}${text[2]}${text[2]}${text[3]}${text[3]}`.toLowerCase();
  }
  return fallback;
}

export function clampFontSize(value) {
  const size = Number.parseInt(value, 10);
  if (!Number.isFinite(size)) {
    return defaultAppearance.fontSize;
  }
  return Math.min(maxFontSize, Math.max(minFontSize, size));
}

export function darkenHexColor(hexColor, ratio = 0.2) {
  return mixHexColors(normalizeHexColor(hexColor), '#000000', ratio);
}

export function mixHexColors(fromColor, toColor, ratio) {
  const from = parseHexColor(normalizeHexColor(fromColor));
  const to = parseHexColor(normalizeHexColor(toColor));
  const weight = Math.min(1, Math.max(0, Number(ratio) || 0));
  const mixed = {
    r: Math.round(from.r + (to.r - from.r) * weight),
    g: Math.round(from.g + (to.g - from.g) * weight),
    b: Math.round(from.b + (to.b - from.b) * weight)
  };
  return rgbToHex(mixed);
}

export function contrastTextColor(hexColor) {
  const { r, g, b } = parseHexColor(normalizeHexColor(hexColor));
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? '#16201d' : '#ffffff';
}

function normalizeFontPreset(value) {
  if (value === 'custom') {
    return 'custom';
  }
  return Object.hasOwn(fontPresets, value) ? value : defaultAppearance.fontPreset;
}

function sanitizeCustomFont(value) {
  return String(value || '')
    .split(',')
    .map((item) => sanitizeFontName(item))
    .filter(Boolean)
    .slice(0, 4)
    .join(', ');
}

function sanitizeCustomFontStack(value) {
  const names = sanitizeCustomFont(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  if (!names.length) {
    return fontPresets.system;
  }
  return `${names.map((name) => JSON.stringify(name)).join(', ')}, sans-serif`;
}

function sanitizeFontName(value) {
  const trimmed = String(value || '').trim().replaceAll('"', '').replaceAll("'", '');
  if (!trimmed || trimmed.length > 40) {
    return '';
  }
  return /^[\p{L}\p{N}\s._-]+$/u.test(trimmed) ? trimmed : '';
}

function parseHexColor(hexColor) {
  const hex = normalizeHexColor(hexColor).slice(1);
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16)
  };
}

function rgbToHex({ r, g, b }) {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function toHex(value) {
  return Math.min(255, Math.max(0, value)).toString(16).padStart(2, '0');
}

function setElementValue(element, value) {
  if (element) {
    element.value = value;
  }
}
