import { requireElement } from './dom';
import {
  translations,
  languageNames,
  flagPaths,
  isLanguage,
  type Language,
  type TranslationKey,
} from '../i18n';
import { readStorage, writeStorage } from '../platform/storage';
import { bindDialogBackdrop, closeDialog } from './dialog';

export function createLanguagePicker(onChange: (language: Language) => void) {
  const storageKey = 'pinhole-language';
  const storedLanguage = readStorage(storageKey);
  let language: Language = isLanguage(storedLanguage) ? storedLanguage : 'eu';
  let hasSelection = isLanguage(storedLanguage);
  const dialog = requireElement<HTMLDialogElement>('#language-dialog');
  const languageButton = requireElement<HTMLButtonElement>('#change-language');
  const closeButton = requireElement<HTMLButtonElement>('#close-language');
  const formulaButton = requireElement<HTMLButtonElement>('#formula-help');

  function applyLanguage(): void {
    const t = translations[language];
    document.documentElement.lang = language;
    document.title = `${t.title} · ${t.subtitle}`;
    requireElement<HTMLMetaElement>('meta[name="description"]').content =
      t.meta;
    document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((element) => {
      const key = element.dataset.i18n as TranslationKey;
      if (!(key in t)) throw new Error(`Unknown translation key: ${key}`);
      const text = t[key];
      element.textContent = text;
      if (key === 'aperture' || key === 'cameraAperture') {
        const match = /\bf\b/.exec(text);
        if (match) {
          const forte = document.createElement('span');
          forte.className = 'aperture-f';
          forte.textContent = 'f';
          element.replaceChildren(
            text.slice(0, match.index),
            forte,
            text.slice(match.index + 1),
          );
        }
      }
    });
    languageButton.innerHTML = `<img src="${flagPaths[language]}" alt="" />`;
    languageButton.setAttribute('aria-label', t.changeLanguage);
    formulaButton.setAttribute('aria-label', t.formulaTitle);
    document
      .querySelectorAll<HTMLButtonElement>('.language-option')
      .forEach((button) => {
        button.setAttribute(
          'aria-pressed',
          String(hasSelection && button.dataset.language === language),
        );
      });
    closeButton.textContent = t.close;
    closeButton.hidden = !hasSelection;
    requireElement('#language-title').textContent = hasSelection
      ? t.chooseLanguage
      : 'Euskara · English · Español';
    requireElement('#language-prompt').textContent = hasSelection
      ? t.changeLanguage
      : 'Aukera ezazu zure hizkuntza\nChoose your language\nElige tu idioma';
    onChange(language);
  }

  for (const code of ['eu', 'en', 'es'] as const) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'language-option';
    button.dataset.language = code;
    button.lang = code;
    button.innerHTML = `<img src="${flagPaths[code]}" alt="" /><span>${languageNames[code]}</span>`;
    button.addEventListener('click', () => {
      language = code;
      hasSelection = true;
      writeStorage(storageKey, code);
      applyLanguage();
      void closeLanguageDialog();
    });
    requireElement('#language-options').append(button);
  }
  function openLanguageDialog(): void {
    dialog.classList.remove('is-closing');
    dialog.showModal();
    const focusTarget = hasSelection
      ? dialog.querySelector<HTMLButtonElement>('[aria-pressed="true"]')
      : dialog.querySelector<HTMLHeadingElement>('#language-title');
    focusTarget?.focus();
  }
  async function closeLanguageDialog(): Promise<void> {
    await closeDialog(dialog, languageButton);
  }
  languageButton.addEventListener('click', openLanguageDialog);
  closeButton.addEventListener('click', () => {
    void closeLanguageDialog();
  });
  bindDialogBackdrop(dialog, () => {
    if (hasSelection) void closeLanguageDialog();
  });
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    if (hasSelection) void closeLanguageDialog();
  });
  return {
    getLanguage: () => language,
    start: () => {
      applyLanguage();
      if (!hasSelection) openLanguageDialog();
    },
  };
}
