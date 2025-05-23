import {
  EmptyRegistryInformationPage,
  RegistryInformationPage,
} from '@/pages/Entity/pdfs/case-information/pages/RegistryInformationPage';
import { TRegistryInformationData } from '@/pages/Entity/pdfs/case-information/pages/RegistryInformationPage/registry-information.schema';
import { BaseCaseInformationPdfSchema } from '@/pages/Entity/pdfs/case-information/schemas/base-case-information-pdf.schema';
import { IPDFRenderer } from './pdf-renderer.abstract';

export class RegistryPagePDF extends IPDFRenderer<TRegistryInformationData> {
  static PDF_NAME = 'titlePage';

  async render(): Promise<JSX.Element> {
    const pdfData = await this.getData();
    this.isValid(pdfData);

    if (this.isEmpty(pdfData)) {
      return <EmptyRegistryInformationPage {...pdfData} />;
    }

    return <RegistryInformationPage {...pdfData} />;
  }

  async getData() {
    const pdfData: TRegistryInformationData = {
      companyName: this.workflow?.context?.entity?.data?.companyName || '',
      creationDate: new Date(),
      logoUrl: await this.getLogoUrl(),
      registrationNumber: this.workflow.context?.entity?.data?.registrationNumber || '',
      incorporationDate:
        this.workflow.context?.entity?.data?.additionalInfo?.dateOfEstablishment || null,
      companyType: this.workflow.context?.entity?.data?.businessType || '',
      // companyStatus is missing in context
      companyStatus: this.workflow.context?.entity?.data?.status || '',
      registrationAddress: [
        this.workflow.context?.entity?.data?.headquarters?.street || '',
        this.workflow.context?.entity?.data?.headquarters?.streetNumber || '',
        this.workflow.context?.entity?.data?.headquarters?.city || '',
        this.workflow.context?.entity?.data?.headquarters?.country || '',
        this.workflow.context?.entity?.data?.headquarters?.postalCode || '',
      ]
        .filter(Boolean)
        .join(', '),
      registryPage: this.workflow.context?.entity?.data?.registryPage || '',
      lastUpdate: new Date(),
      registeredAt: this.workflow.context?.entity?.data?.registeredAt || '',
    };

    return pdfData;
  }

  isValid(data: TRegistryInformationData) {
    BaseCaseInformationPdfSchema.parse(data);
  }

  private isEmpty(data: TRegistryInformationData) {
    const values = [
      data.registrationNumber,
      data.incorporationDate,
      data.companyType,
      data.companyStatus,
      data.registrationAddress,
      data.registryPage,
      data.lastUpdate,
      data.registeredAt,
    ];

    return values.every(value => {
      return (Array.isArray(value) && !value.length) || !value;
    });
  }
}
