import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildExample } from './model.ts';

const settings = { pinhole: 180, iso: 100, aperture: 16, shutter: 1 / 125 };

test('example preserves the exact calculation, three centered steps and bold result', () => {
  const example = buildExample('en', settings);
  assert.match(example.label, /16\.875 s ≈ 17 s/);
  assert.equal(example.label.split('\n').length, 3);
  assert.equal((example.mathml.match(/<mtr>/g) ?? []).length, 3);
  assert.match(example.mathml, /columnalign="center"/);
  assert.match(example.mathml, /<mn mathvariant="bold">16\.875<\/mn>/);
  assert.match(example.tex, /\\boldsymbol\{t/);
});

test('selected settings replace every fixed example value', () => {
  const example = buildExample('en', {
    pinhole: 100,
    iso: 400,
    aperture: 20,
    shutter: 1 / 50,
  });
  assert.match(example.label, /1\/50 × \(100 ÷ 20\)² × \(400 ÷ 6\)/);
  assert.match(example.label, /33\.3333 s ≈ 33 s/);
  assert.match(example.tex, /\\frac\{1\}\{50\}/);
  assert.doesNotMatch(example.tex, /180|125|16\.875/);
});

test('both renderers use local decimal separators', () => {
  for (const language of ['es', 'eu'] as const) {
    const example = buildExample(language, settings);
    assert.match(example.label, /16,875/);
    assert.match(example.mathml, /16,875/);
    assert.match(example.tex, /16\{,\}875/);
  }
});

test('subsecond results remain nonzero and whole-second shutters stay whole', () => {
  const example = buildExample('en', {
    pinhole: 16,
    aperture: 16,
    iso: 25,
    shutter: 1 / 4000,
  });
  assert.match(example.label, /0\.00104167 s ≈ 0\.00104 s/);
  const whole = buildExample('en', { ...settings, shutter: 1 });
  assert.match(whole.label, /^t = 1 ×/);
  assert.doesNotMatch(whole.tex, /\\frac\{1\}\{1\}/);
});

test('incomplete, out-of-range and overflowing inputs cannot produce examples', () => {
  for (const overrides of [
    { pinhole: 0 },
    { iso: NaN },
    { aperture: 33 },
    { shutter: -1 },
    { pinhole: Number.MAX_VALUE },
  ]) {
    assert.throws(
      () => buildExample('en', { ...settings, ...overrides }),
      RangeError,
    );
  }
});
