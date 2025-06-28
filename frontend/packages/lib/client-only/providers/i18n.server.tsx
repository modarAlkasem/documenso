import "server-only";

import type { I18n, Messages } from "@lingui/core";
import { setupI18n } from "@lingui/core";
import { setI18n } from "@lingui/react/server";
import { cookies, headers } from "next/headers";

import {
  APP_I18N_OPTIONS,
  SUPPORTED_LANGUAGE_CODES,
  isValidLanguageCode,
  SupportedLanguageCodes,
} from "../../constants/i18n";
import { extractLocaleData } from "../../utils/i18n";
import { remember } from "../../utils/remember";

export const loadCatalog = async (
  lang: SupportedLanguageCodes
): Promise<{ [k: string]: Messages }> => {
  const extension = process.env.NODE_ENV === "development" ? "po" : "js";
  const { messages } = await import(
    `../../translations/${lang}/web.${extension}`
  );
  return {
    [lang]: messages,
  };
};

const catalogs = await Promise.all(
  SUPPORTED_LANGUAGE_CODES.map((lang) => loadCatalog)
);

export const allMessages = catalogs.reduce(
  (acc, catalog) => ({
    ...acc,
    ...catalog,
  }),
  {}
) as { [k in SupportedLanguageCodes]: Messages };

type AllI18nInstances = { [K in SupportedLanguageCodes]: I18n };

export const allI18nInstances = remember("i18n.allI18nInstances", () => {
  return SUPPORTED_LANGUAGE_CODES.reduce((acc, lang) => {
    const i18n = setupI18n({
      locale: lang,
      messages: { [lang]: allMessages[lang] },
    });
    return { ...acc, [lang]: i18n };
  }, {}) as AllI18nInstances;
});

export const getI18nInstance = (
  lang?: SupportedLanguageCodes | (string & {})
) => {
  if (!isValidLanguageCode(lang))
    return allI18nInstances[APP_I18N_OPTIONS.sourceLang];

  return (
    allI18nInstances[lang] ?? allI18nInstances[APP_I18N_OPTIONS.sourceLang]
  );
};

export const setupI18nSSR = async () => {
  const { lang, locales } = extractLocaleData({
    cookies: await cookies(),
    headers: await headers(),
  });
  const i18n = getI18nInstance(lang);
  i18n.activate(lang);
  setI18n(i18n);
  return {
    lang,
    locales,
    i18n,
  };
};
