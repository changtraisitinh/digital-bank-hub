import { Static, Type } from '@sinclair/typebox';

import { MerchantScreeningPluginSchema } from '@/schemas/documents/merchant-screening-plugin-schema';
import { BusinessInformationPluginSchema } from '@/schemas/documents/schemas/business-information-plugin-schema';
import { CompanySanctionsPluginSchema } from '@/schemas/documents/schemas/company-sanctions-plugin-schema';
import { MerchantMonitoringPluginSchema } from '@/schemas/documents/schemas/merchant-monitoring-plugin-schema';
import { CollectionFlowStatusesEnum } from '@/utils/collection-flow';
import { CollectionFlowStepStatesEnum } from '@/utils/collection-flow/enums/collection-flow-step-state-enum';
import { AmlSchema } from './schemas/aml-schema';
import { DocumentsSchema } from './schemas/documents-schema';
import { EntitySchema } from './schemas/entity-schema';
import { IndividualSanctionsPluginSchema } from './schemas/individual-sanctions-plugin-schema';
import { KycSessionPluginSchema } from './schemas/kyc-session-plugin-schema';
import { RiskEvaluationPluginSchema } from './schemas/risk-evaluation-plugin-schema';
import { UboPluginSchema } from './schemas/ubo-plugin-schema';

export const defaultInputContextSchema = Type.Object({
  customData: Type.Optional(Type.Object({}, { additionalProperties: true })),
  entity: Type.Union([
    Type.Composite([EntitySchema, Type.Object({ ballerineEntityId: Type.String() })]),
    Type.Composite([EntitySchema, Type.Object({ id: Type.String() })]),
  ]),
  documents: DocumentsSchema,
});

export const defaultPluginSchema = Type.Object({
  name: Type.String(),
  status: Type.String(),
  orderId: Type.String(),
  invokedAt: Type.Number(),
  data: Type.Optional(Type.Any()),
});

export const CollectionFlowStepSchema = Type.Object({
  stepName: Type.String(),
  state: Type.Optional(Type.Enum(CollectionFlowStepStatesEnum)),
  reason: Type.Optional(Type.String()),
  isCompleted: Type.Boolean(),
});

export const CollectionFlowConfigSchema = Type.Object({
  apiUrl: Type.String(),
});

export const CollectionFlowStateSchema = Type.Object({
  currentStep: Type.String(),
  status: Type.Enum(CollectionFlowStatusesEnum),
  steps: Type.Optional(Type.Array(CollectionFlowStepSchema)),
});

export const CollectionFlowSchema = Type.Object({
  config: Type.Optional(CollectionFlowConfigSchema),
  state: Type.Optional(CollectionFlowStateSchema),
  additionalInformation: Type.Optional(
    Type.Object({ customerCompany: Type.Optional(Type.String()) }),
  ),
});

export const defaultContextSchema = Type.Composite([
  defaultInputContextSchema,
  Type.Object({
    aml: AmlSchema,
    pluginsOutput: Type.Optional(
      Type.Object(
        {
          ubo: UboPluginSchema,
          kyc_session: KycSessionPluginSchema,
          companySanctions: CompanySanctionsPluginSchema,
          individualSanctions: IndividualSanctionsPluginSchema,
          merchantMonitoring: MerchantMonitoringPluginSchema,
          businessInformation: BusinessInformationPluginSchema,
          merchantScreening: MerchantScreeningPluginSchema,
          riskEvaluation: RiskEvaluationPluginSchema,
        },
        { additionalProperties: true },
      ),
    ),
  }),
  Type.Object({
    collectionFlow: Type.Optional(CollectionFlowSchema),
  }),
]);

export type DefaultContextSchema = Static<typeof defaultContextSchema>;
