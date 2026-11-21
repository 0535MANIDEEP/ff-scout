export const APPEARANCE_STORAGE_KEY = 'fc-appearance';
export const LEGACY_THEME_KEY = 'ff-theme';

export const PRESET_IDS = ['paper', 'night', 'slate', 'sand'] as const;
export type PresetId = (typeof PRESET_IDS)[number];
export type Density = 'regular' | 'compact';
export type Motion = 'system' | 'reduced' | 'full';

export interface Appearance {
  preset: PresetId;
  accent: string | null;
  density: Density;
  motion: Motion;
}

export interface Preset {
  label: string;
  bg: string;
  panel: string;
  panel2: string;
  panel3: string;
  line: string;
  text: string;
  muted: string;
  accent: string;
  accentStrong: string;
  onAccent: string;
  inputBg: string;
  cyan: string;
  success: string;
  danger: string;
  risk: string;
  hudTop: string;
  hudBottom: string;
  topbarBg: string;
  isDark: boolean;
}

export const PRESETS: Record<PresetId, Preset> = {
  paper: {
    label: 'Paper',
    bg: '#ECE7DD',
    panel: '#F5F1E8',
    panel2: '#E4DFD1',
    panel3: '#D6D1C0',
    line: '#1A1A18',
    text: '#1A1A18',
    muted: '#5B564B',
    accent: '#C81E1E',
    accentStrong: '#A01515',
    onAccent: '#F5F1E8',
    inputBg: '#FDFCF8',
    cyan: '#0F4C81',
    success: '#1F6B3A',
    danger: '#A01515',
    risk: '#8A6D1B',
    hudTop: '#F5F1E8',
    hudBottom: '#ECE7DD',
    topbarBg: 'rgba(236,231,221,0.92)',
    isDark: false,
  },
  night: {
    label: 'Night',
    bg: '#141311',
    panel: '#1E1C19',
    panel2: '#282521',
    panel3: '#322E28',
    line: '#E8E1D3',
    text: '#F5F1E8',
    muted: '#BDB5A5',
    accent: '#FF5A45',
    accentStrong: '#E0402B',
    onAccent: '#141311',
    inputBg: '#23211D',
    cyan: '#7FC4FF',
    success: '#6FD08C',
    danger: '#FF6F5E',
    risk: '#E5C15C',
    hudTop: '#1E1C19',
    hudBottom: '#141311',
    topbarBg: 'rgba(20,19,17,0.94)',
    isDark: true,
  },
  slate: {
    label: 'Slate',
    bg: '#0F172A',
    panel: '#1E293B',
    panel2: '#334155',
    panel3: '#475569',
    line: '#94A3B8',
    text: '#F8FAFC',
    muted: '#94A3B8',
    accent: '#EF4444',
    accentStrong: '#B91C1C',
    onAccent: '#FFFFFF',
    inputBg: '#0B1221',
    cyan: '#7DD3FC',
    success: '#6EE7B7',
    danger: '#F87171',
    risk: '#FCD34D',
    hudTop: '#1E293B',
    hudBottom: '#0F172A',
    topbarBg: 'rgba(15,23,42,0.94)',
    isDark: true,
  },
  sand: {
    label: 'Sand',
    bg: '#F6EFE2',
    panel: '#FFFBF3',
    panel2: '#F0E7D8',
    panel3: '#E3D7C5',
    line: '#3C3226',
    text: '#241D16',
    muted: '#6A5C4B',
    accent: '#B4471F',
    accentStrong: '#8F3417',
    onAccent: '#FFFFFF',
    inputBg: '#FFFCF6',
    cyan: '#0F4C81',
    success: '#1F6B3A',
    danger: '#8F3417',
    risk: '#8A6D1B',
    hudTop: '#FFFBF3',
    hudBottom: '#F6EFE2',
    topbarBg: 'rgba(246,239,226,0.94)',
    isDark: false,
  },
};

export const DEFAULT_APPEARANCE: Appearance = {
  preset: 'paper',
  accent: null,
  density: 'regular',
  motion: 'system',
};

function normalizeHex(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const match = value.trim().match(/^#?([0-9a-f]{6})$/i);
  return match ? `#${match[1].toLowerCase()}` : null;
}

function channelLuminance(channel: number): number {
  const value = channel / 255;
  return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const normalized = normalizeHex(hex);
  if (!normalized) return 0;
  const [r, g, b] = normalized
    .slice(1)
    .match(/../g)!
    .map((pair) => parseInt(pair, 16));
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

export function contrastRatio(background: string, foreground: string): number {
  const a = relativeLuminance(background);
  const b = relativeLuminance(foreground);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export function isAccessibleAccent(accent: string, background: string): boolean {
  const normalized = normalizeHex(accent);
  return normalized ? contrastRatio(background, normalized) >= 4.5 : false;
}

function defaultAppearance(legacyTheme: string | null, systemDark: boolean): Appearance {
  const preset: PresetId = legacyTheme === 'dark'
    ? 'night'
    : legacyTheme === 'light'
      ? 'paper'
      : systemDark
        ? 'night'
        : 'paper';
  return { ...DEFAULT_APPEARANCE, preset };
}

export function parseStoredAppearance(
  raw: string | null,
  legacyTheme: string | null,
  systemDark: boolean,
): Appearance {
  const fallback = defaultAppearance(legacyTheme, systemDark);
  if (!raw) return fallback;

  let stored: unknown;
  try {
    stored = JSON.parse(raw);
  } catch {
    return fallback;
  }
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return fallback;

  const data = stored as Record<string, unknown>;
  const preset = PRESET_IDS.includes(data.preset as PresetId)
    ? data.preset as PresetId
    : fallback.preset;
  const candidateAccent = normalizeHex(data.accent);
  const accent = candidateAccent && isAccessibleAccent(candidateAccent, PRESETS[preset].bg)
    ? candidateAccent
    : fallback.accent;
  const density = data.density === 'compact' ? 'compact' : fallback.density;
  const motion = data.motion === 'reduced' || data.motion === 'full'
    ? data.motion
    : fallback.motion;

  return { preset, accent, density, motion };
}

function mixHex(from: string, to: string, amount: number): string {
  const fromRgb = normalizeHex(from)!.slice(1).match(/../g)!.map((pair) => parseInt(pair, 16));
  const toRgb = normalizeHex(to)!.slice(1).match(/../g)!.map((pair) => parseInt(pair, 16));
  const channels = fromRgb.map((channel, index) =>
    Math.round(channel + (toRgb[index] - channel) * amount)
      .toString(16)
      .padStart(2, '0'),
  );
  return `#${channels.join('')}`;
}

export function deriveAccentStrong(accent: string, presetId: PresetId): string {
  const preset = PRESETS[presetId];
  const source = normalizeHex(accent) ?? preset.accent;
  const target = preset.isDark ? '#FFFFFF' : '#000000';

  for (let step = 1; step <= 9; step += 1) {
    const candidate = mixHex(source, target, step / 10);
    if (contrastRatio(source, candidate) >= 1.12 && isAccessibleAccent(candidate, preset.bg)) {
      return candidate;
    }
  }
  return source;
}

export function deriveOnAccent(accent: string, presetId: PresetId): string {
  const preset = PRESETS[presetId];
  const source = normalizeHex(accent) ?? preset.accent;
  const candidates = ['#141311', '#F5F1E8'];
  return candidates.reduce((best, candidate) =>
    contrastRatio(source, candidate) > contrastRatio(source, best) ? candidate : best,
  );
}

interface AppearanceRoot {
  dataset: Record<string, string | undefined>;
  style: {
    setProperty(name: string, value: string): void;
    removeProperty(name: string): void;
  };
}

export function appearanceInitScript(): string {
  return `(function(){try{var raw=localStorage.getItem(${JSON.stringify(APPEARANCE_STORAGE_KEY)});var legacy=localStorage.getItem(${JSON.stringify(LEGACY_THEME_KEY)});var stored=raw?JSON.parse(raw):null;if(!stored||typeof stored!=='object'||Array.isArray(stored)){stored=null}var ids=${JSON.stringify(PRESET_IDS)};var dark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;var preset=stored&&ids.indexOf(stored.preset)>-1?stored.preset:(legacy==='dark'?'night':legacy==='light'?'paper':dark?'night':'paper');var density=stored&&stored.density==='compact'?'compact':'regular';var motion=stored&&(stored.motion==='reduced'||stored.motion==='full')?stored.motion:'system';var root=document.documentElement;root.dataset.preset=preset;root.dataset.density=density;root.dataset.motion=motion;root.dataset.theme=(preset==='night'||preset==='slate')?'dark':'light';root.style.setProperty('color-scheme',root.dataset.theme);}catch(e){var fallback=document.documentElement;fallback.dataset.preset='paper';fallback.dataset.density='regular';fallback.dataset.motion='system';fallback.dataset.theme='light';fallback.style.setProperty('color-scheme','light');}})()`;
}

export function applyAppearance(root: AppearanceRoot, appearance: Appearance): void {
  const preset = PRESETS[appearance.preset];
  root.dataset.preset = appearance.preset;
  root.dataset.density = appearance.density;
  root.dataset.motion = appearance.motion;
  root.dataset.theme = preset.isDark ? 'dark' : 'light';
  root.style.setProperty('color-scheme', preset.isDark ? 'dark' : 'light');

  const accent = normalizeHex(appearance.accent);
  if (!accent || !isAccessibleAccent(accent, preset.bg)) {
    root.style.removeProperty('--accent');
    root.style.removeProperty('--accent-2');
    root.style.removeProperty('--accent-on-bg');
    root.style.removeProperty('--on-accent');
    return;
  }

  root.style.setProperty('--accent', accent);
  root.style.setProperty('--accent-2', deriveAccentStrong(accent, appearance.preset));
  root.style.setProperty('--accent-on-bg', deriveAccentStrong(accent, appearance.preset));
  root.style.setProperty('--on-accent', deriveOnAccent(accent, appearance.preset));
}
