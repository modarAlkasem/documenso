import {
  Html,
  Body,
  Container,
  Head,
  Preview,
  Section,
  Img,
} from "../components";
import { TemplateForgotPassword } from "../template-components/template-forgot-password";
import { TemplateFooter } from "../template-components/template-footer";
import type { TemplateForgotPasswordProps } from "../template-components/template-forgot-password";

export type ForgotPasswordTemplateProps = Partial<TemplateForgotPasswordProps>;

export const ForgotPasswordTemplate = ({
  assetBaseUrl = "http://localhost:3000",
  resetPasswordLink = "https://www.documenso-clone.com",
}: ForgotPasswordTemplateProps) => {
  const previewText = "Password Reset Requested";

  const getAssetUrl = (path: string) => {
    return new URL(assetBaseUrl, path).toString();
  };

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body className="m-auto bg-white font-sans">
        <Section>
          <Container className="m-auto mb-2 mt-8 max-w-xl rounded-lg border border-solid border-slate-200 p-4 backdrop-blur-sm">
            <Section>
              <Img
                src={getAssetUrl("/static/logo.png")}
                alt="Documenso Logo"
                className="mb-4 h-6"
              />
              <TemplateForgotPassword
                assetBaseUrl={assetBaseUrl}
                resetPasswordLink={resetPasswordLink}
              />
            </Section>
          </Container>
          <div className="mx-auto mt-12 max-w-lg" />
          <Container className="m-auto mb-2 max-w-xl">
            <TemplateFooter isDocument={false} />
          </Container>
        </Section>
      </Body>
    </Html>
  );
};
