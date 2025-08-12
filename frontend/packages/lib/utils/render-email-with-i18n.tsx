import { render, type RenderOptions } from "@documenso/email/render";
import type { SupportedLanguageCodes } from "../constants/i18n";

export const renderEmailWithI18N = async (
  component: React.ReactElement,
  options?: RenderOptions & {
    lang?: SupportedLanguageCodes | (string & {});
  }
) => {
  const { lang: providedLang, ...otherOptions } = options ?? {};
  return render(component, otherOptions);
};
