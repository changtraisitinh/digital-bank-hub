import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { t } from 'i18next';
import { createBusinessReport } from '@/domains/business-reports/fetchers';
import { useCustomerQuery } from '@/domains/customer/hooks/queries/useCustomerQuery/useCustomerQuery';
import { HttpError } from '@/common/errors/http-error';
import { isObject } from '@ballerine/common';

export const useCreateBusinessReportMutation = (options?: {
  onSuccess?: <TData>(data: TData) => void;
  disableToast?: boolean;
}) => {
  const { onSuccess, disableToast } = options ?? {};

  const queryClient = useQueryClient();
  const { data: customer } = useCustomerQuery();

  const reportType = customer?.features?.createBusinessReport?.options.type ?? 'MERCHANT_REPORT_T1';
  const workflowVersion = customer?.features?.createBusinessReport?.options.version ?? '2';

  return useMutation({
    mutationFn: async ({
      websiteUrl,
      operatingCountry,
      companyName,
      businessCorrelationId,
    }: {
      websiteUrl: string;
      companyName?: string;
      operatingCountry?: string;
      businessCorrelationId?: string;
    }) => {
      await createBusinessReport({
        websiteUrl,
        operatingCountry,
        companyName,
        businessCorrelationId,
        reportType,
        workflowVersion,
        isExample: customer?.config?.isExample ?? false,
      });
    },
    onSuccess: data => {
      if (customer?.config?.isExample) {
        return;
      }

      void queryClient.invalidateQueries();

      if (!disableToast) {
        toast.success(t(`toast:business_report_creation.success`));
      }

      onSuccess?.(data);
    },
    onError: (error: unknown) => {
      if (error instanceof HttpError && error.code === 400) {
        toast.error(error.message);

        return;
      }

      toast.error(
        t(`toast:business_report_creation.error`, {
          errorMessage: isObject(error) && 'message' in error ? error.message : error,
        }),
      );
    },
  });
};
