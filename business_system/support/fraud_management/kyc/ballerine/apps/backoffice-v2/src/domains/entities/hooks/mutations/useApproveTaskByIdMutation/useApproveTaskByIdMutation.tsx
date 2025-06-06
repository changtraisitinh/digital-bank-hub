import { useMutation, useQueryClient } from '@tanstack/react-query';
import { t } from 'i18next';
import { toast } from 'sonner';
import { Action } from '../../../../../common/enums';
import { TWorkflowById, updateWorkflowDecision } from '../../../../workflows/fetchers';
import { workflowsQueryKeys } from '../../../../workflows/query-keys';

export const useApproveTaskByIdMutation = (workflowId: string) => {
  const queryClient = useQueryClient();
  const workflowById = workflowsQueryKeys.byId({ workflowId });

  return useMutation({
    mutationFn: ({
      directorId,
      documentId,
      contextUpdateMethod = 'base',
      comment,
    }: {
      directorId?: string;
      documentId: string;
      contextUpdateMethod?: 'base' | 'director';
      comment?: string;
    }) =>
      updateWorkflowDecision({
        workflowId,
        documentId,
        body: {
          directorId,
          decision: Action.APPROVE,
          comment,
        },
        contextUpdateMethod,
      }),
    onMutate: async ({ documentId }) => {
      await queryClient.cancelQueries({
        queryKey: workflowById.queryKey,
      });
      const previousWorkflow = queryClient.getQueryData(workflowById.queryKey);

      queryClient.setQueryData(workflowById.queryKey, (oldWorkflow: TWorkflowById) => {
        return {
          ...oldWorkflow,
          context: {
            ...oldWorkflow?.context,
            documents: oldWorkflow?.context?.documents?.map(document => {
              if (document?.id !== documentId) {
                return document;
              }

              return {
                ...document,
                decision: {
                  ...document?.decision,
                  status: 'approved',
                  rejectionReason: null,
                  revisionReason: null,
                },
              };
            }),
          },
        };
      });

      return { previousWorkflow };
    },
    onSuccess: () => {
      // workflowsQueryKeys._def is the base key for all workflows queries
      void queryClient.invalidateQueries(workflowsQueryKeys._def);

      toast.success(t('toast:approve_document.success'));
    },
    onError: (_error, _variables, context) => {
      toast.error(t('toast:approve_document.error', { errorMessage: _error.message }));
      queryClient.setQueryData(workflowById.queryKey, context.previousWorkflow);
    },
  });
};
