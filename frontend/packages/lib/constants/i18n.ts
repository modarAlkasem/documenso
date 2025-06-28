

export const SUPPORTED_LANGUAGE_CODES = ['de', 'en', 'fr', 'es'] as const;

export const APP_I18N_OPTIONS = {
    supportedLangs : SUPPORTED_LANGUAGE_CODES,
    sourceLang: "en",
    defaultLocale : "en-US"
} as const;

export type SupportedLanguageCodes = (typeof SUPPORTED_LANGUAGE_CODES) [number]
export type I18nLocaleData = {
    lang:SupportedLanguageCodes,
    locales:string[]
}

export const isValidLanguageCode = (code:unknown): code is SupportedLanguageCodes => SUPPORTED_LANGUAGE_CODES.includes(code as SupportedLanguageCodes)