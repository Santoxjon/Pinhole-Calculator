import { renderMeterFields } from './meter-fields';
import { bindNumericInput } from './numeric-input';
import { requireElement } from './dom';
import {
  calculateExposure,
  formatExposure,
  isMeterApertureValid,
  PAPER_ISO,
  type ExposureSettings,
} from '../domain/exposure';
import { translations, type Language } from '../i18n';
import { readStorage, writeStorage } from '../platform/storage';

export function createCalculator(
  getLanguage: () => Language,
  onSettingsChange: (settings: ExposureSettings) => void,
) {
  renderMeterFields();

  const form = requireElement<HTMLFormElement>('#calculator');
  const output = requireElement<HTMLOutputElement>('#exposure');
  const detail = requireElement<HTMLParagraphElement>('#result-detail');

  const settingsStorageKey = 'pinhole-settings';
  const inputIds = ['pinhole', 'iso', 'aperture', 'shutter'] as const;

  function saveInputs(): void {
    const values = Object.fromEntries(
      inputIds.map((id) => [
        id,
        requireElement<HTMLInputElement | HTMLSelectElement>(`#${id}`).value,
      ]),
    );
    writeStorage(settingsStorageKey, JSON.stringify(values));
  }

  function restoreInputs(): void {
    try {
      const values: unknown = JSON.parse(
        readStorage(settingsStorageKey) ?? 'null',
      );
      if (!values || typeof values !== 'object' || Array.isArray(values))
        return;
      for (const id of inputIds) {
        const value = (values as Record<string, unknown>)[id];
        if (typeof value !== 'string') continue;
        const input = requireElement<HTMLInputElement | HTMLSelectElement>(
          `#${id}`,
        );
        if (input instanceof HTMLSelectElement) {
          if (
            Array.from(input.options).some((option) => option.value === value)
          )
            input.value = value;
        } else if (
          value === '' ||
          (Number.isFinite(Number(value)) &&
            Number(value) > 0 &&
            (id !== 'aperture' || isMeterApertureValid(Number(value))))
        ) {
          input.value = value;
        }
      }
    } catch {
      /* Ignore malformed or unavailable saved settings. */
    }
  }

  function readSettings(): ExposureSettings {
    return {
      pinhole: Number(requireElement<HTMLInputElement>('#pinhole').value),
      aperture: Number(requireElement<HTMLInputElement>('#aperture').value),
      iso: Number(requireElement<HTMLSelectElement>('#iso').value),
      shutter: Number(requireElement<HTMLSelectElement>('#shutter').value),
    };
  }

  function update(): void {
    const settings = readSettings();
    const language = getLanguage();
    onSettingsChange(settings);
    output.classList.add('is-empty');
    output.textContent = translations[language].fillInputs;
    detail.textContent = '';
    const apertureInput = requireElement<HTMLInputElement>('#aperture');
    const apertureInRange = isMeterApertureValid(settings.aperture);
    apertureInput.setAttribute(
      'aria-invalid',
      String(apertureInput.value !== '' && !apertureInRange),
    );
    if (!apertureInRange) {
      if (apertureInput.value !== '')
        detail.textContent = translations[language].apertureRange;
      return;
    }
    try {
      const seconds = calculateExposure(settings);
      const t = translations[language];
      output.classList.remove('is-empty');
      output.textContent = formatExposure(seconds, {
        second: t.secondUnit,
        minute: t.minuteUnit,
        hour: t.hourUnit,
        locale: language,
      });
      detail.textContent = `${new Intl.NumberFormat(language, { maximumSignificantDigits: 6 }).format(seconds)} ${t.seconds} · ISO ${PAPER_ISO} · f/${settings.pinhole}`;
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
      if (
        inputIds.every(
          (id) =>
            requireElement<HTMLInputElement | HTMLSelectElement>(`#${id}`)
              .value !== '',
        )
      ) {
        detail.textContent = Object.values(settings).some(
          (value) => !Number.isFinite(value) || value <= 0,
        )
          ? translations[language].invalid
          : translations[language].range;
      }
    }
  }

  function handleInput(): void {
    update();
    saveInputs();
  }

  for (const id of ['pinhole', 'aperture']) {
    bindNumericInput(requireElement<HTMLInputElement>(`#${id}`));
  }

  form.addEventListener('input', handleInput);
  form.addEventListener('change', handleInput);
  form.addEventListener('submit', (event) => event.preventDefault());
  restoreInputs();
  return { update };
}
