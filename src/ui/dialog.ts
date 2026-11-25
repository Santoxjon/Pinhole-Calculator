export async function closeDialog(
  target: HTMLDialogElement,
  trigger: HTMLButtonElement,
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
