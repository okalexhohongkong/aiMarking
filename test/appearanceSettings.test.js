import assert from 'node:assert/strict';
import test from 'node:test';
import {
  applyAppearanceSettings,
  clampFontSize,
  contrastTextColor,
  loadAppearanceSettings,
  normalizeAppearance,
  normalizeHexColor,
  resolveFontFamily,
  saveAppearanceSettings
} from '../public/appearanceSettings.js';

test('normalizes appearance settings to safe colors, font, and size', () => {
  const settings = normalizeAppearance({
    accentColor: '#ABC',
    sidebarColor: '#123',
    skinColor: '#def',
    backgroundColor: 'not-a-color',
    panelColor: '#111111',
    textColor: '#222222',
    fontPreset: 'custom',
    customFont: 'My Brand Font, Bad;Font, PingFang SC',
    fontSize: 99
  });

  assert.equal(settings.accentColor, '#aabbcc');
  assert.equal(settings.sidebarColor, '#112233');
  assert.equal(settings.skinColor, '#ddeeff');
  assert.equal(settings.backgroundColor, '#f0f8ff');
  assert.equal(settings.panelColor, '#111111');
  assert.equal(settings.textColor, '#222222');
  assert.equal(settings.fontPreset, 'custom');
  assert.equal(settings.customFont, 'My Brand Font, PingFang SC');
  assert.equal(settings.fontSize, 24);
});

test('applies appearance settings as css variables', () => {
  const properties = new Map();
  const root = {
    style: {
      setProperty: (name, value) => properties.set(name, value)
    }
  };

  const applied = applyAppearanceSettings(
    {
      accentColor: '#123456',
      sidebarColor: '#0c4a6e',
      skinColor: '#dbeafe',
      backgroundColor: '#eeeeee',
      panelColor: '#ffffff',
      textColor: '#101010',
      fontPreset: 'mono',
      fontSize: 18
    },
    root
  );

  assert.equal(applied.fontSize, 18);
  assert.equal(properties.get('--accent'), '#123456');
  assert.equal(properties.get('--sidebar-bg'), '#0c4a6e');
  assert.equal(properties.get('--skin'), '#dbeafe');
  assert.equal(properties.get('--bg'), '#eeeeee');
  assert.equal(properties.get('--font-base'), '18px');
  assert.match(properties.get('--app-font-family'), /SFMono-Regular/);
  assert.ok(properties.get('--accent-contrast'));
});

test('loads and saves appearance settings from browser storage', () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value)
  };

  const saved = saveAppearanceSettings(storage, {
    accentColor: '#990000',
    sidebarColor: '#101010',
    skinColor: '#f6d7c9',
    backgroundColor: '#ffffff',
    panelColor: '#fafafa',
    textColor: '#111111',
    fontPreset: 'heiti',
    fontSize: 20
  });
  const loaded = loadAppearanceSettings(storage);

  assert.deepEqual(loaded, saved);
});

test('keeps font sizes and custom font stacks within supported bounds', () => {
  assert.equal(clampFontSize(8), 13);
  assert.equal(clampFontSize(19), 19);
  assert.equal(clampFontSize(40), 24);
  assert.equal(normalizeHexColor('#12f'), '#1122ff');
  assert.equal(normalizeHexColor('rgb(1,2,3)', '#ffffff'), '#ffffff');
  assert.equal(contrastTextColor('#ffffff'), '#16201d');
  assert.equal(contrastTextColor('#000000'), '#ffffff');
  assert.equal(resolveFontFamily({ fontPreset: 'custom', customFont: 'Avenir Next, PingFang SC' }), '"Avenir Next", "PingFang SC", sans-serif');
});
