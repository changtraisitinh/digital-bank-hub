import { ChildDocumentBlocks } from '@/lib/blocks/components/ChildDocumentBlocks/ChildDocumentBlocks';
import { createBlocksTyped } from '@/lib/blocks/create-blocks-typed/create-blocks-typed';
import { TCaseBlocksCreationProps } from '@/lib/blocks/variants/DefaultBlocks/hooks/useCaseBlocksLogic/utils/useTabsToBlocksMap';

export const createAssociatedCompanyDocumentBlocks = ({
  workflow,
  onReuploadNeeded,
  isLoadingReuploadNeeded,
}: TCaseBlocksCreationProps) => {
  const blocks = createBlocksTyped().addBlock();

  const childWorkflows = workflow?.childWorkflows?.filter(
    childWorkflow => childWorkflow?.context?.entity?.type === 'business',
  );

  if (!childWorkflows?.length) {
    return [];
  }

  childWorkflows.forEach(childWorkflow => {
    blocks.addCell({
      type: 'node',
      value: (
        <ChildDocumentBlocks
          parentWorkflowId={workflow.id}
          childWorkflow={childWorkflow}
          parentMachine={workflow?.context?.parentMachine}
          key={childWorkflow?.id}
          onReuploadNeeded={onReuploadNeeded}
          isLoadingReuploadNeeded={isLoadingReuploadNeeded}
        />
      ),
    });
  });

  return blocks.build();
};
