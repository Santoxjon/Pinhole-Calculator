import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateExposure,
  formatExposure,
  isMeterApertureValid,
} from './exposure.ts';

test('converts the agreed meter reading to ISO 6 at f/180', () => {
  assert.equal(
    calculateExposure({
      pinhole: 180,
      iso: 100,
      aperture: 16,
      shutter: 1 / 125,
    }),
    16.875,
  );
});
test('equal ISO and aperture preserve shutter time', () => {
  assert.equal(
    calculateExposure({ pinhole: 180, iso: 6, aperture: 180, shutter: 2 }),
    2,
  );
});
test('rejects missing, negative and nonfinite readings', () => {
  for (const iso of [0, -1, NaN, Infinity])
    assert.throws(
      () => calculateExposure({ pinhole: 180, iso, aperture: 16, shutter: 1 }),
      RangeError,
    );
});
test('formats fractions and minute/hour boundaries', () => {
  assert.equal(formatExposure(0.125), '0.125 sec');
  assert.equal(formatExposure(59.9), '1 min');
  assert.equal(formatExposure(3600), '1 hr');
  assert.equal(formatExposure(3661), '1 hr 1 min 1 sec');
});

test('formats translated duration units and decimal separators', () => {
  const units = { second: 's', minute: 'min', hour: 'h', locale: 'es' };
  assert.equal(formatExposure(0.125, units), '0,125 s');
  assert.equal(formatExposure(3661, units), '1 h 1 min 1 s');
  assert.equal(formatExposure(0.125, { ...units, locale: 'eu' }), '0,125 s');
});

test('meter aperture limits are shared independently of the exposure equation', () => {
  for (const aperture of [1, 16, 32])
    assert.equal(isMeterApertureValid(aperture), true);
  for (const aperture of [0, 0.99, 32.01, Infinity, NaN])
    assert.equal(isMeterApertureValid(aperture), false);
});

test('rejects overflowing and underflowing exposure results', () => {
  for (const pinhole of [Number.MAX_VALUE, Number.MIN_VALUE]) {
    assert.throws(
      () => calculateExposure({ pinhole, aperture: 16, iso: 100, shutter: 1 }),
      RangeError,
    );
  }
});
