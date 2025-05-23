import { TBusinessReport } from '@/domains/business-reports/fetchers';
import React from 'react';
import { Link } from 'react-router-dom';
import { Tabs } from '@/common/components/organisms/Tabs/Tabs';
import { TabsList } from '@/common/components/organisms/Tabs/Tabs.List';
import { TabsTrigger } from '@/common/components/organisms/Tabs/Tabs.Trigger';
import { ctw } from '@/common/utils/ctw/ctw';
import { TabsContent } from '@/common/components/organisms/Tabs/Tabs.Content';
import { useWebsiteMonitoringBusinessReportTab } from '@/lib/blocks/variants/WebsiteMonitoringBlocks/hooks/useWebsiteMonitoringReportBlock/hooks/useWebsiteMonitoringBusinessReportTab/useWebsiteMonitoringBusinessReportTab';
import { BusinessReportSummary } from '@ballerine/ui';
import { RiskIndicatorLink } from '@/domains/business-reports/components/RiskIndicatorLink/RiskIndicatorLink';
import { MERCHANT_REPORT_TYPES_MAP } from '@ballerine/common';

export const WebsiteMonitoringBusinessReportTab = ({
  businessReport,
}: {
  businessReport: TBusinessReport;
}) => {
  const {
    activeMonitoringTab,
    riskIndicators,
    tabs,
    getUpdatedSearchParamsWithActiveMonitoringTab,
    search,
  } = useWebsiteMonitoringBusinessReportTab({
    businessReport,
  });

  return (
    <div className={'grid gap-y-4'}>
      <BusinessReportSummary
        summary={businessReport.data!.summary!}
        ongoingMonitoringSummary={businessReport.data!.ongoingMonitoringSummary!}
        riskIndicators={riskIndicators}
        riskLevel={businessReport.data!.riskLevel!}
        homepageScreenshotUrl={businessReport.data!.homepageScreenshotUrl}
        Link={RiskIndicatorLink}
      />
      <Tabs defaultValue={activeMonitoringTab} className="w-full" key={activeMonitoringTab}>
        <TabsList className={'mb-4 bg-transparent'}>
          {tabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} asChild>
              <Link
                to={{
                  search: getUpdatedSearchParamsWithActiveMonitoringTab({ tab: tab.value, search }),
                }}
                className={ctw({
                  '!bg-foreground !text-background': activeMonitoringTab === tab.value,
                })}
              >
                {tab.label}
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map(tab => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
