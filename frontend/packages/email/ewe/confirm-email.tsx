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

export const ConfirmEmail = () => {
  const branding = useBranding();
};
