import * as ReactEmail from "@react-email/render";
import config from "@documenso/tailwind-config";
import { Tailwind } from "./components";
import { BrandingProvider, type BrandingSettings } from "./providers/branding";

export type RenderOptions = ReactEmail.Options & {
  branding?: BrandingSettings;
};

export const render = (
  element: React.ReactElement,
  options?: RenderOptions
) => {
  const { branding, ...otherOptions } = options ?? {};
  return ReactEmail.render(
    <Tailwind
      config={{
        theme: {
          extend: {
            colors: config.theme?.colors,
          },
        },
      }}
    >
      <BrandingProvider branding={branding}>{element}</BrandingProvider>
    </Tailwind>,
    otherOptions
  );
};

export const renderAsync = async (
  element: React.ReactNode,
  options?: ReactEmail.Options & {
    branding?: BrandingSettings;
  }
) => {
  const { branding, ...otherOptions } = options ?? {};
  return await ReactEmail.render(
    <Tailwind
      config={{
        theme: {
          extend: {
            colors: config.theme?.colors,
          },
        },
      }}
    >
      <BrandingProvider branding={branding}>{element}</BrandingProvider>
    </Tailwind>,
    otherOptions
  );
};
