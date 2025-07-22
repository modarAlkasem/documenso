import { Row, Column, Img, Section } from "../components";

export interface TemplateDocumentImage {
  assetBaseUrl?: string;
  className?: string;
}

export const TemplateDocumentImage = ({
  assetBaseUrl,
  className,
}: TemplateDocumentImage) => {
  const imgUrl = new URL("/static/document.png", assetBaseUrl).toString();

  return (
    <Section className={className}>
      <Row className="table-fixed">
        <Column />
        <Column>
          <Img className="h-42 mx-auto" src={imgUrl} alt="Documenso" />
        </Column>
        <Column />
      </Row>
    </Section>
  );
};

export default TemplateDocumentImage;
