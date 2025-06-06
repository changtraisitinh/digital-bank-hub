import { Static, Type } from '@sinclair/typebox';
import { CollectionFlowStepStatesEnum } from '../enums/collection-flow-step-state-enum';

const InputCollectionFlowStepSchema = Type.Object({
  stateName: Type.String(),
  state: Type.Optional(Type.Enum(CollectionFlowStepStatesEnum)),
});

export const CollectionFlowConfigSchema = Type.Object({
  apiUrl: Type.String(),
  steps: Type.Array(InputCollectionFlowStepSchema),
  additionalInformation: Type.Optional(
    Type.Object(
      {
        customerCompany: Type.Optional(Type.String()),
      },
      { additionalProperties: true },
    ),
  ),
});

export type TCollectionFlowConfig = Static<typeof CollectionFlowConfigSchema>;
