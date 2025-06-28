import type {ReadonlyRequestCookies} from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { SupportedLanguageCodes,APP_I18N_OPTIONS, I18nLocaleData } from "../constants/i18n";
import { IS_APP_WEB, IS_APP_WEB_I18N_ENABLED } from "../constants/app";


const parseLanguageFromLocale = (locale:string) :SupportedLanguageCodes | null =>{
const [language,_country] = locale.split("-");
const foundSupportedLanguage = APP_I18N_OPTIONS.supportedLangs.find((lang): lang is SupportedLanguageCodes =>lang== language)
if (!foundSupportedLanguage) {
    return null;
  }

  return foundSupportedLanguage;
}
export const extractLocaleDataFromCookies = (cookies:ReadonlyRequestCookies):SupportedLanguageCodes | null =>{
    const preferredLocale = cookies.get("language")?.value || '';
    const language = parseLanguageFromLocale(preferredLocale);

    if (!language) {
        return null;
      }
    
      return language;
}


export const extractLocaleFromHeaders = (headers:Headers): { lang: SupportedLanguageCodes | null; locales: string[] } =>{
    const headerLocales = (headers.get("accept-language")??'').split(",");
    const language = parseLanguageFromLocale(headerLocales[0]);
    return{
        lang:language,
        locales:[headerLocales[0]]
    }

}
type ExtractLocaleDataOptions = {
    headers:Headers,
    cookies:ReadonlyRequestCookies
}

export const extractLocaleData = ({
headers,
cookies
}:ExtractLocaleDataOptions) :I18nLocaleData=>{
    let lang:SupportedLanguageCodes | null = extractLocaleDataFromCookies(cookies);

    const languageHeader = extractLocaleFromHeaders(headers);
    if(!lang && languageHeader) 
        lang = languageHeader.lang;
    if(!IS_APP_WEB_I18N_ENABLED && IS_APP_WEB)
        lang = "en";

    const locales = (languageHeader?.locales ?? []).filter((locale =>{
        try{
            new Intl.Locale(locale)
        }catch{
            return false;
        }
    }))

    return {
        lang:lang || APP_I18N_OPTIONS.sourceLang,
        locales:locales
    }
}