import { en } from './en';
import { es } from './es';
import { eu } from './eu';
import type { Language, Translation } from './types';
export type { Language, TranslationKey } from './types';

export const languageNames: Record<Language, string> = {
  es: 'Español',
  eu: 'Euskara',
  en: 'English',
};
export const flagPaths: Record<Language, string> = {
  es: '/flags/es-republic.svg',
  eu: '/flags/eu.svg',
  en: '/flags/en.svg',
};

export const translations: Record<Language, Translation> = { en, es, eu };
export function isLanguage(value: unknown): value is Language {
  return value === 'es' || value === 'eu' || value === 'en';
}
