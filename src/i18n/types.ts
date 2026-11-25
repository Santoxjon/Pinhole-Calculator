import type { en } from './en';

export type Language = 'es' | 'eu' | 'en';
export type TranslationKey = keyof typeof en;
export type Translation = Record<TranslationKey, string>;
