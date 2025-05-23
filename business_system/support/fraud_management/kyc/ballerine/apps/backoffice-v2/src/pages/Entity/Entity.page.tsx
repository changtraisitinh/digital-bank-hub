import { TWorkflowById } from '@/domains/workflows/fetchers';
import { BlocksVariant } from '@/lib/blocks/variants/BlocksVariant/BlocksVariant';
import { useEntityLogic } from '@/pages/Entity/hooks/useEntityLogic/useEntityLogic';
import { Case } from './components/Case/Case';

export const Entity = () => {
  const { workflow, selectedEntity } = useEntityLogic();

  if (!workflow || !selectedEntity) {
    return null;
  }

  // Selected entity
  return (
    <Case key={workflow.id}>
      {/* Reject and approve header */}
      <Case.Actions
        id={workflow.id}
        entityId={selectedEntity.id}
        fullName={selectedEntity.name}
        showResolutionButtons={
          workflow.workflowDefinition?.config?.workflowLevelResolution ??
          workflow.context?.entity?.type === 'business'
        }
        workflow={workflow as TWorkflowById}
      />
      <Case.Content key={selectedEntity?.id}>
        {workflow.workflowDefinition && (
          <BlocksVariant
            workflowDefinition={{
              version: workflow.workflowDefinition?.version,
              variant: workflow.workflowDefinition?.variant,
              config: workflow.workflowDefinition?.config,
              name: workflow.workflowDefinition?.name,
            }}
          />
        )}
      </Case.Content>
    </Case>
  );
};
