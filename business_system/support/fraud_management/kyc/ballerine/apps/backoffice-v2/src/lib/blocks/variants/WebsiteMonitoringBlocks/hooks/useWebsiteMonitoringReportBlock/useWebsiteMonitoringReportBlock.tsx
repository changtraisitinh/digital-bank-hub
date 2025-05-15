import { createBlocksTyped } from '@/lib/blocks/create-blocks-typed/create-blocks-typed';
import React, { useMemo } from 'react';
import { useCurrentCaseQuery } from '@/pages/Entity/hooks/useCurrentCaseQuery/useCurrentCaseQuery';
import { WebsiteMonitoringBusinessReportTab } from '@/lib/blocks/variants/WebsiteMonitoringBlocks/hooks/useWebsiteMonitoringReportBlock/WebsiteMonitoringBusinessReportTab';
import { useBusinessReportByIdQuery } from '@/domains/business-reports/hooks/queries/useBusinessReportByIdQuery/useBusinessReportByIdQuery';

export const useWebsiteMonitoringReportBlock = () => {
  const { data: workflow } = useCurrentCaseQuery();

  const reportId = workflow?.context?.pluginsOutput?.merchantMonitoring?.reportId;

  const { data: businessReport } = useBusinessReportByIdQuery({
    id: reportId ?? '',
  });

  const blocks = useMemo(() => {
    if (!businessReport?.data) {
      return [];
    }

    return createBlocksTyped()
      .addBlock()
      .addCell({
        type: 'container',
        props: {
          className: 'rounded-md overflow-hidden h-full',
        },
        value: createBlocksTyped()
          .addBlock()
          .addCell({
            type: 'node',
            value: <WebsiteMonitoringBusinessReportTab businessReport={businessReport} />,
          })
          .buildFlat(),
      })
      .build();
  }, [businessReport]);

  return blocks;
};
