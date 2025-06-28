"use client";

import { useState } from "react";
import { type Messages, setupI18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";

import type { I18nLocaleData } from "../../constants/i18n";

type Props = {
  children: React.ReactNode;
  initialLocaleData: I18nLocaleData;
  initialMessages: Messages;
};
export const I18nClientProvider = ({
  children,
  initialLocaleData,
  initialMessages,
}: Props) => {
  const { lang, locales } = initialLocaleData;
  const [i18n] = useState(() => {
    return setupI18n({
      locale: lang,
      locales: locales,
      messages: { [lang]: initialMessages },
    });
  });
  return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
};
