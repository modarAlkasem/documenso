import { PublicEnvScript } from "next-runtime-env";
import { cn } from "@documenso/ui/lib/utils";
// import { TooltipProvider } from "@documenso/ui/primitives/tooltip";
import { ThemeProvider } from "~/providers/next-theme";
import { Caveat, Inter } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";
import {
  IS_APP_WEB_I18N_ENABLED,
  NEXT_PUBLIC_WEBAPP_URL,
} from "@documenso/lib/constants/app";
import { I18nClientProvider } from "@documenso/lib/client-only/providers/i18n.client";
import { setupI18nSSR } from "@documenso/lib/client-only/providers/i18n.server";
import { Toaster } from "@documenso/ui/primitives/toaster";
import { TRPCProvider } from "@documenso/trpc/react";

const interFont = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});
const caveatFont = Caveat({
  subsets: ["latin"],
  variable: "--font-signature",
});

export const metadata: Metadata = {
  title: {
    template: "%s - Documenso",
    default: "Documenso",
  },
  description:
    "Join Documenso, the open signing infrastructure, and get 10x better signing experience. Pricing starts at $30/mo. forever! sign in now and enjoy a faster, smarter, and more beautiful document signing process. Integrates with your favorite tools, customizable and expandable. Support our mission and become a part of our open-source community.",
  keywords: [
    "Documenso",
    "open source",
    "DocSign alternative",
    "document signing",
    "open signing infrastructure",
    "open-source community",
    "fast signing",
    "beautiful signing",
    "smart templates",
  ],
  authors: [{ name: "Documenso Inc." }],
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(NEXT_PUBLIC_WEBAPP_URL() ?? "http://localhost:3000"),
  openGraph: {
    title: "Documenso - The Open Source DocuSign Alternative",
    description:
      "Join Documenso, the open signing infrastructure, and get a 10x better signing experience. Pricing starts at $30/mo. forever! Sign in now and enjoy a faster, smarter, and more beautiful document signing process. Integrates with your favorite tools, customizable, and expandable. Support our mission and become a part of our open-source community.",
    type: "website",
    images: ["/opengraph-image.jpg"],
  },
  twitter: {
    site: "@documenso",
    card: "summary_large_image",
    images: ["/opengraph-image.jpg"],
    description:
      "Join Documenso, the open signing infrastructure, and get a 10x better signing experience. Pricing starts at $30/mo. forever! Sign in now and enjoy a faster, smarter, and more beautiful document signing process. Integrates with your favorite tools, customizable, and expandable. Support our mission and become a part of our open-source community.",
  },
};
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { i18n, lang, locales } = await setupI18nSSR();

  return (
    <html
      lang={lang}
      className={cn(interFont.variable, caveatFont.variable)}
      suppressContentEditableWarning
    >
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link rel="icon" type="image/png" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest.json" />
        <PublicEnvScript />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TRPCProvider>
            {" "}
            <I18nClientProvider
              initialMessages={i18n.messages}
              initialLocaleData={{ lang, locales }}
            >
              {children}
            </I18nClientProvider>
          </TRPCProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
