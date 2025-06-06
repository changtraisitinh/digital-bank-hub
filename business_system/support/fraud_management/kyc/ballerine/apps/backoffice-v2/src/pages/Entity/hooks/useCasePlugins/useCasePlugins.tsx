import { useWorkflowDefinitionByIdQuery } from '@/domains/workflow-definitions/hooks/queries/useWorkflowDefinitionByQuery/useWorkflowDefinitionByIdQuery';
import { TWorkflowById } from '@/domains/workflows/fetchers';
import { useMemo } from 'react';

export const useCasePlugins = ({ workflow }: { workflow: TWorkflowById | undefined }) => {
  const { data: workflowDefinition } = useWorkflowDefinitionByIdQuery({
    workflowDefinitionId: workflow?.workflowDefinition?.id ?? '',
  });

  return useMemo(
    () => [
      ...(workflowDefinition?.extensions?.apiPlugins ?? []),
      ...(workflowDefinition?.extensions?.childWorkflowPlugins ?? []),
      ...(workflowDefinition?.extensions?.commonPlugins ?? []),
    ],
    [workflowDefinition],
  );
};
