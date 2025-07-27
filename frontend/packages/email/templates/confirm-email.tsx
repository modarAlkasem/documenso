import {
  Html,
  Body,
  Head,
  Container,
  Section,
  Preview,
  Img,
} from "../components";
import { useBranding } from "../providers/branding";
import type { TemplateConfirmationEmailProps } from "../template-components/template-confirmation-email";
import { TemplateConfirmationEmail } from "../template-components/template-confirmation-email";
import { TemplateFooter } from "../template-components/template-footer";

export const ConfirmEmail = ({
  confirmationLink,
  assetBaseUrl = "http://localhost:3002",
}: TemplateConfirmationEmailProps) => {
  const branding = useBranding();
  const assetUrl = new URL("/static/logo.png", assetBaseUrl).toString();

  return (
    <Html>
      <Head />
      <Preview>Please confirm your email address</Preview>
      <Body className="mx-auto my-auto bg-white font-sans">
        <Section>
          <Container className="max-w-xl mx-auto mt-8 mb-2 rounded-lg border border-solid border-slate-200 p-4 backdrop-blur-sm">
            <Section>
              {branding.brandingEnabled && branding.brandingLogo ? (
                <Img
                  src={branding.brandingLogo}
                  alt="Branding Logo"
                  className="mb-4 h-6"
                />
              ) : (
                <Img
                  src={assetBaseUrl}
                  alt="Documenso Logo"
                  className="mb-4 h-6"
                />
              )}
              <TemplateConfirmationEmail
                confirmationLink={confirmationLink}
                assetBaseUrl={assetBaseUrl}
              />
            </Section>
          </Container>
          <div className="mx-auto max-w-xl mt-12" />
          <Container className="max-w-xl mx-auto">
            <TemplateFooter isDocument={false} />
          </Container>
        </Section>
      </Body>
    </Html>
  );
};

export default ConfirmEmail;
