export async function closeDialog(
  target: HTMLDialogElement,
  trigger: HTMLElement,
): Promise<void> {
  if (!target.open || target.classList.contains('is-closing')) return;
  target.classList.add('is-closing');
  await Promise.allSettled(
    target.getAnimations().map((animation) => animation.finished),
  );
  target.close();
  target.classList.remove('is-closing');
  trigger.focus();
}

export function bindDialogBackdrop(
  dialog: HTMLDialogElement,
  onDismiss: () => void,
): void {
  let startedOutside = false;
  function isOutside(event: MouseEvent): boolean {
    const bounds = dialog.getBoundingClientRect();
    return (
      event.target === dialog &&
      (event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom)
    );
  }
  dialog.addEventListener('pointerdown', (event) => {
    startedOutside = isOutside(event);
  });
  dialog.addEventListener('pointercancel', () => {
    startedOutside = false;
  });
  dialog.addEventListener('click', (event) => {
    const dismiss = startedOutside && isOutside(event);
    startedOutside = false;
    if (dismiss) onDismiss();
  });
}
