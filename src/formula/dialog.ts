import { translations, type Language } from '../i18n';
import type { ExposureSettings } from '../domain/exposure';
import { requireElement } from '../ui/dom';
import { bindDialogBackdrop, closeDialog } from '../ui/dialog';
import {
  buildExample,
  GENERAL_MATHML,
  GENERAL_TEX,
  type FormulaContent,
} from './model';
import { nativeFormula } from './native';
import { loadMathJax } from './mathjax';

export function createFormulaDialog() {
  const dialog = requireElement<HTMLDialogElement>('#formula-dialog');
  const trigger = requireElement<HTMLButtonElement>('#formula-help');
  const equation = requireElement<HTMLElement>('#formula-equation');
  const example = requireElement<HTMLElement>('#formula-example');
  const intro = requireElement<HTMLElement>('#formula-example-intro');
  let lastKey = '';
  let revision = 0;
  let pendingEnhancement: (() => void) | undefined;

  trigger.addEventListener('click', () => {
    dialog.showModal();
    requireElement<HTMLElement>('#formula-title').focus();
  });
  requireElement('#close-formula').addEventListener('click', () => {
    void closeDialog(dialog, trigger);
  });
  bindDialogBackdrop(dialog, () => {
    void closeDialog(dialog, trigger);
  });
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    void closeDialog(dialog, trigger);
  });
  // One listener and one pending update, even when settings change during loading.
  dialog.addEventListener('close', () => {
    pendingEnhancement?.();
    pendingEnhancement = undefined;
  });

  async function render(
    language: Language,
    settings: ExposureSettings,
  ): Promise<void> {
    const key = JSON.stringify([language, settings]);
    if (key === lastKey) return;
    lastKey = key;
    const current = ++revision;
    pendingEnhancement = undefined;
    const t = translations[language];
    equation.replaceChildren(nativeFormula(GENERAL_MATHML, t.formulaEquation));
    let content: FormulaContent | undefined;
    try {
      content = buildExample(language, settings);
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
    }
    intro.textContent = content ? t.formulaExampleIntro : t.fillInputs;
    example.hidden = !content;
    example.replaceChildren(
      ...(content ? [nativeFormula(content.mathml, content.label)] : []),
    );

    try {
      const math = await loadMathJax();
      if (current !== revision) return;
      const formulaNode = await math.tex2svgPromise(GENERAL_TEX, {
        display: true,
      });
      if (current !== revision) return;
      const exampleNode = content
        ? await math.tex2svgPromise(content.tex, { display: true })
        : undefined;
      if (current !== revision) return;
      const enhance = () => {
        if (current !== revision) return;
        replaceWithAccessibleSvg(equation, formulaNode, t.formulaEquation);
        if (exampleNode && content)
          replaceWithAccessibleSvg(example, exampleNode, content.label);
      };
      // Keep typography stable while the dialog is being read.
      if (dialog.open) pendingEnhancement = enhance;
      else enhance();
    } catch {
      /* Native MathML remains usable if the CDN is unavailable. */
    }
  }

  return { render };
}

function replaceWithAccessibleSvg(
  target: HTMLElement,
  node: HTMLElement,
  label: string,
): void {
  node.setAttribute('aria-hidden', 'true');
  const description = document.createElement('span');
  description.className = 'formula-description';
  description.textContent = label;
  target.replaceChildren(description, node);
}
