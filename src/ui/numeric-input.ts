export function bindNumericInput(input: HTMLInputElement): void {
  // Number inputs otherwise accept exponent notation and signs.
  input.addEventListener('keydown', (event) => {
    if (
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      ['e', 'E', '+', '-'].includes(event.key)
    )
      event.preventDefault();
  });
  input.addEventListener('beforeinput', (event) => {
    if (event.data && !/^[0-9.,]+$/.test(event.data)) event.preventDefault();
  });
  input.addEventListener('paste', (event) => {
    const text = event.clipboardData?.getData('text').trim() ?? '';
    if (!/^(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(text)) event.preventDefault();
  });
  input.addEventListener('input', () => {
    if (input.max && input.valueAsNumber > Number(input.max))
      input.value = input.max;
  });
  input.addEventListener('change', () => {
    if (input.value !== '' && Number.isFinite(input.valueAsNumber)) {
      const minimum = Number(input.min);
      const maximum = input.max ? Number(input.max) : Infinity;
      input.value = String(
        Math.min(maximum, Math.max(minimum, input.valueAsNumber)),
      );
    }
  });
}
