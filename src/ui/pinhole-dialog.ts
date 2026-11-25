import { type Language } from '../i18n';
import { requireElement } from './dom';
import { bindDialogBackdrop, closeDialog } from './dialog';
import { bindNumericInput } from './numeric-input';

export function createPinholeDialog(getLanguage: () => Language) {
  const dialog = requireElement<HTMLDialogElement>('#pinhole-dialog');
  const trigger = requireElement<HTMLAnchorElement>('#pinhole-help');
  const diameter = requireElement<HTMLInputElement>('#pinhole-diameter');
  const distance = requireElement<HTMLInputElement>('#pinhole-distance');
  const next = requireElement<HTMLButtonElement>('#pinhole-continue');
  const form = requireElement<HTMLFormElement>('#pinhole-form');
  bindNumericInput(distance);

  function update(): void {
    const format = new Intl.NumberFormat(getLanguage(), {
      maximumFractionDigits: 2,
    });
    const d = diameter.valueAsNumber;
    const length = distance.valueAsNumber;
    const valid = diameter.validity.valid && distance.validity.valid;
    requireElement('#pinhole-diameter-value').textContent =
      `${format.format(d)} mm`;
    diameter.setAttribute('aria-valuetext', `${format.format(d)} mm`);
    distance.setAttribute(
      'aria-invalid',
      String(distance.value !== '' && !distance.validity.valid),
    );
    next.disabled = !valid;
    requireElement<HTMLElement>('#pinhole-result-section').hidden = !valid;
    requireElement('#pinhole-result').textContent = valid
      ? `f/${format.format(length / d)}`
      : '';
    requireElement('#pinhole-substitution').textContent = valid
      ? `${format.format(length)} mm ÷ ${format.format(d)} mm = ${format.format(length / d)}`
      : '';
  }

  form.addEventListener('input', update);
  form.addEventListener('change', update);
  trigger.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
      event.preventDefault();
      trigger.click();
    }
  });
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    distance.value = '50';
    update();
    dialog.showModal();
    requireElement<HTMLElement>('#pinhole-title').focus();
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const input = requireElement<HTMLInputElement>('#pinhole');
    input.value = String(
      Number((distance.valueAsNumber / diameter.valueAsNumber).toFixed(2)),
    );
    input.dispatchEvent(new Event('input', { bubbles: true }));
    void closeDialog(dialog, trigger);
  });
  requireElement('#close-pinhole').addEventListener('click', () => {
    void closeDialog(dialog, trigger);
  });
  bindDialogBackdrop(dialog, () => {
    void closeDialog(dialog, trigger);
  });
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    void closeDialog(dialog, trigger);
  });
  return { update };
}
