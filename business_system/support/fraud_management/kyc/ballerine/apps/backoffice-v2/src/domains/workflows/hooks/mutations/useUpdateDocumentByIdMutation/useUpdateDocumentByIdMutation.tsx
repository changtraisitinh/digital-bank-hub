import { useMutation, useQueryClient } from '@tanstack/react-query';
import { t } from 'i18next';
import { toast } from 'sonner';
import { useFilterId } from '../../../../../common/hooks/useFilterId/useFilterId';
import { TWorkflowById, updateWorkflowDocumentById } from '../../../fetchers';
import { workflowsQueryKeys } from '../../../query-keys';

export const useUpdateDocumentByIdMutation = ({
  workflowId,
  directorId,
  documentId,
}: {
  workflowId: string;
  directorId?: string;
  documentId: string;
}) => {
  const queryClient = useQueryClient();
  const workflowById = workflowsQueryKeys.byId({ workflowId });

  return useMutation({
    mutationFn: ({
      document,
      contextUpdateMethod,
    }: {
      document: Record<PropertyKey, unknown>;
      action: 'update_document_properties';
      contextUpdateMethod: 'base' | 'director';
    }) => {
      return updateWorkflowDocumentById({
        workflowId,
        documentId,
        body: {
          directorId,
          document,
        },
        contextUpdateMethod,
      });
    },
    onMutate: async ({ document }) => {
      await queryClient.cancelQueries({
        queryKey: workflowById.queryKey,
      });
      const previousWorkflow = queryClient.getQueryData(workflowById.queryKey);

      queryClient.setQueryData(workflowById.queryKey, (oldWorkflow: TWorkflowById) => {
        if (!oldWorkflow) {
          return;
        }

        return {
          ...oldWorkflow,
          context: {
            ...oldWorkflow.context,
            documents: oldWorkflow.context.documents.map((doc: { id: string }) => {
              if (doc.id === documentId) {
                return document;
              }

              return doc;
            }),
          },
        };
      });

      return { previousWorkflow };
    },
    onSuccess: (data, { action }) => {
      toast.success(t(`toast:${action}.success`));
    },
    onError: (error, { action }, context) => {
      toast.error(t(`toast:${action}.error`, { errorMessage: error.message }));
      queryClient.setQueryData(workflowById.queryKey, context.previousWorkflow);
    },
    onSettled: () => {
      void queryClient.invalidateQueries();
    },
  });
};
