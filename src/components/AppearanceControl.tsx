'use client';

import { useEffect, useState } from 'react';
import {
  APPEARANCE_STORAGE_KEY,
  DEFAULT_APPEARANCE,
  LEGACY_THEME_KEY,
  PRESET_IDS,
  PRESETS,
  applyAppearance,
  contrastRatio,
  deriveOnAccent,
  isAccessibleAccent,
  parseStoredAppearance,
  type Appearance,
  type Density,
  type Motion,
  type PresetId,
} from '@/lib/appearance';

const DENSITIES: Density[] = ['regular', 'compact'];
const MOTIONS: Motion[] = ['system', 'reduced', 'full'];

export default function AppearanceControl() {
  const [open, setOpen] = useState(false);
  const [appearance, setAppearance] = useState<Appearance>(DEFAULT_APPEARANCE);
  const [draftAccent, setDraftAccent] = useState(PRESETS.paper.accent);

  useEffect(() => {
    let raw: string | null = null;
    let legacy: string | null = null;
    try {
      raw = localStorage.getItem(APPEARANCE_STORAGE_KEY);
      legacy = localStorage.getItem(LEGACY_THEME_KEY);
    } catch {
      // Storage may be blocked. The control still works for this page view.
    }
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = parseStoredAppearance(raw, legacy, systemDark);
    setAppearance(initial);
    setDraftAccent(initial.accent ?? PRESETS[initial.preset].accent);
    applyAppearance(document.documentElement, initial);
    try {
      localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(initial));
      localStorage.removeItem(LEGACY_THEME_KEY);
    } catch {
      // Storage may be blocked. The migrated state still applies in memory.
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  const preset = PRESETS[appearance.preset];
  const accentRatio = contrastRatio(preset.bg, draftAccent);
  const accentValid = isAccessibleAccent(draftAccent, preset.bg);
  const accentError = accentValid
    ? ''
    : `Below 4.5:1 on ${preset.label}. Pick a ${preset.isDark ? 'lighter' : 'darker'} color.`;

  function save(next: Appearance) {
    setAppearance(next);
    applyAppearance(document.documentElement, next);
    try {
      localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage may be blocked. The choice still applies in memory.
    }
  }

  function changePreset(nextPreset: PresetId) {
    const accent = appearance.accent && isAccessibleAccent(appearance.accent, PRESETS[nextPreset].bg)
      ? appearance.accent
      : null;
    const next = { ...appearance, preset: nextPreset, accent };
    setDraftAccent(accent ?? PRESETS[nextPreset].accent);
    save(next);
  }

  function applyDraftAccent() {
    if (!accentValid) return;
    save({ ...appearance, accent: draftAccent.toLowerCase() });
  }

  function resetAppearance() {
    setDraftAccent(preset.accent);
    save({ ...DEFAULT_APPEARANCE, preset: appearance.preset });
  }

  return (
    <div className="appearance-wrap">
      <button
        type="button"
        className="appearance-button"
        aria-expanded={open}
        aria-controls="appearance-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="appearance-swatch" aria-hidden="true" />
        Appearance
      </button>
      {open && (
        <div id="appearance-panel" className="appearance-panel" aria-label="Appearance options">
          <fieldset className="appearance-fieldset">
            <legend className="appearance-legend">Palette</legend>
            <div className="appearance-choices">
              {PRESET_IDS.map((id) => (
                <label key={id} className="appearance-choice">
                  <input
                    type="radio"
                    name="appearance-preset"
                    checked={appearance.preset === id}
                    onChange={() => changePreset(id)}
                  />
                  <span>{PRESETS[id].label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="appearance-fieldset">
            <legend className="appearance-legend">Accent</legend>
            <div className="appearance-accent-row">
              <input
                id="appearance-accent"
                className="appearance-color"
                type="color"
                value={draftAccent}
                onChange={(event) => setDraftAccent(event.target.value)}
              />
              <button
                type="button"
                className="appearance-sample"
                style={{
                  background: accentValid ? draftAccent : 'var(--panel-2)',
                  color: accentValid ? deriveOnAccent(draftAccent, appearance.preset) : 'var(--muted)',
                }}
                onClick={applyDraftAccent}
                disabled={!accentValid}
              >
                Use {accentRatio.toFixed(1)}:1
              </button>
            </div>
            {accentError && <p className="appearance-error" role="alert">{accentError}</p>}
          </fieldset>

          <fieldset className="appearance-fieldset">
            <legend className="appearance-legend">Density</legend>
            <div className="appearance-choices">
              {DENSITIES.map((value) => (
                <label key={value} className="appearance-choice">
                  <input
                    type="radio"
                    name="appearance-density"
                    checked={appearance.density === value}
                    onChange={() => save({ ...appearance, density: value })}
                  />
                  <span>{value === 'regular' ? 'Regular' : 'Compact'}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="appearance-fieldset">
            <legend className="appearance-legend">Motion</legend>
            <div className="appearance-choices appearance-choices-three">
              {MOTIONS.map((value) => (
                <label key={value} className="appearance-choice">
                  <input
                    type="radio"
                    name="appearance-motion"
                    checked={appearance.motion === value}
                    onChange={() => save({ ...appearance, motion: value })}
                  />
                  <span>{value === 'system' ? 'System' : value === 'reduced' ? 'Reduced' : 'Full'}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <button type="button" className="appearance-reset" onClick={resetAppearance}>Reset {preset.label}</button>
        </div>
      )}
    </div>
  );
}
