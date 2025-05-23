import { useMutation, useQueryClient } from '@tanstack/react-query';
import { t } from 'i18next';
import { toast } from 'sonner';
import { fetchUpdateWorkflowById, TWorkflowById } from '../../../fetchers';
import { workflowsQueryKeys } from '../../../query-keys';

export const useUpdateWorkflowByIdMutation = ({ workflowId }: { workflowId: string }) => {
  const queryClient = useQueryClient();
  const workflowById = workflowsQueryKeys.byId({ workflowId });

  return useMutation({
    mutationFn: ({
      context,
    }: {
      context: Record<PropertyKey, unknown>;
      action:
        | 'approve_document'
        | 'reject_document'
        | 'ask_revision_document'
        | 'update_document_properties'
        | 'step_request'
        | 'step_cancel'
        | 'edit_collection_flow';
    }) =>
      fetchUpdateWorkflowById({
        workflowId,
        body: {
          context,
        },
      }),
    onMutate: async ({ context }) => {
      await queryClient.cancelQueries({
        queryKey: workflowById.queryKey,
      });
      const previousWorkflow = queryClient.getQueryData(workflowById.queryKey);

      queryClient.setQueryData(workflowById.queryKey, (oldWorkflow: TWorkflowById) => {
        return {
          ...oldWorkflow,
          context: {
            ...oldWorkflow?.context,
            ...context,
          },
        };
      });

      return { previousWorkflow };
    },
    onSuccess: (data, { action }) => {
      toast.success(t(`toast:${action}.success`));
    },
    onError: (error, { action }, context) => {
      const translatedError = t(`toast:${action}.error`, { errorMessage: error.message });

      toast.error(translatedError);

      queryClient.setQueryData(workflowById.queryKey, context.previousWorkflow);
    },
    onSettled: () => {
      void queryClient.invalidateQueries();
    },
  });
};
