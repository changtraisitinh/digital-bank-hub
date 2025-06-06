import { CommonWorkflowStates } from '@ballerine/common';
import { TWorkflowById } from '../../../../domains/workflows/fetchers';

export interface ICaseCallToActionLegacyProps {
  value: string;
  data: {
    parentWorkflowId: string;
    childWorkflowId: string;
    childWorkflowContextSchema: TWorkflowById['childWorkflows'][number]['workflowDefinition']['contextSchema'];
    disabled: boolean;
    decision:
      | typeof CommonWorkflowStates.REJECTED
      | typeof CommonWorkflowStates.APPROVED
      | typeof CommonWorkflowStates.REVISION;
    isKYC: boolean;
  };
}
