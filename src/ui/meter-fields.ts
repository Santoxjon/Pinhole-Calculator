import { requireElement } from './dom';
import { METER_APERTURE_MIN, METER_APERTURE_MAX } from '../domain/exposure';

type MeterKey = 'iso' | 'aperture' | 'shutter';
const fields: {
  key: MeterKey;
  label: string;
  values: number[];
  initial: number;
}[] = [
  {
    key: 'iso',
    label: 'ISO',
    values: [25, 50, 100, 200, 400, 800, 1600, 3200],
    initial: 100,
  },
  { key: 'aperture', label: 'Aperture f', values: [], initial: 16 },
  {
    key: 'shutter',
    label: 'Shutter speed',
    values: [
      1,
      1 / 2,
      1 / 4,
      1 / 8,
      1 / 15,
      1 / 30,
      1 / 60,
      1 / 125,
      1 / 250,
      1 / 500,
      1 / 1000,
      1 / 2000,
      1 / 4000,
    ],
    initial: 1 / 60,
  },
];

export function renderMeterFields(): void {
  const container = requireElement<HTMLDivElement>('#meter-fields');
  for (const field of fields) {
    const label = (value: number) =>
      field.key === 'aperture'
        ? `f/${value}`
        : field.key === 'shutter'
          ? `${value < 1 ? `1/${Math.round(1 / value)}` : value}`
          : String(value);
    const control =
      field.key === 'aperture'
        ? `<div class="aperture-input"><input class="input" id="aperture" name="aperture" type="number" inputmode="decimal" min="${METER_APERTURE_MIN}" max="${METER_APERTURE_MAX}" step="any" placeholder="${field.initial}" required /></div>`
        : `<div class="select is-fullwidth is-medium"><select id="${field.key}" name="${field.key}">${field.values.map((value) => `<option value="${value}" ${value === field.initial ? 'selected' : ''}>${label(value)}</option>`).join('')}</select></div>`;
    container.insertAdjacentHTML(
      'beforeend',
      `<div class="field"><label class="label" for="${field.key}">${field.key === 'shutter' ? '<span class="shutter-label-full" data-i18n="shutter">Shutter speed</span><span class="shutter-label-short" data-i18n="shutterShort">s. speed</span>' : `<span data-i18n="${field.key}">${field.label}</span>`}</label>${control}</div>`,
    );
  }
}
