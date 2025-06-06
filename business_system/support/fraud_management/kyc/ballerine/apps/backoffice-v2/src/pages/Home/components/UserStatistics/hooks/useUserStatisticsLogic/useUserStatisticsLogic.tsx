import React, { ReactNode, useMemo } from 'react';
import { HSL_PIE_COLORS } from '@/pages/Home/constants';
import { Cell, Pie, PieChart } from 'recharts';
import { ctw } from '@/common/utils/ctw/ctw';

export const useUserStatisticsLogic = () => {
  const filters = [
    {
      id: 'ckl1y5e0x0000wxrmsgft7bf0',
      name: 'Merchant Onboarding',
      value: 8,
      riskLevels: {
        low: 2,
        medium: 3,
        high: 3,
        critical: 1,
      },
    },
    {
      id: 'ckl1y5e0x0002wxrmnd8j9rb7',
      name: 'Tier 2 Account',
      value: 4,
      riskLevels: {
        low: 1,
        medium: 4,
        high: 2,
        critical: 4,
      },
    },
  ];
  const filtersWithColors = useMemo(
    () =>
      filters
        ?.slice()
        ?.sort((a, b) => b.value - a.value)
        ?.map((filter, index) => ({
          ...filter,
          color: HSL_PIE_COLORS[index],
        })),
    [filters],
  );
  const assignedFilters = useMemo(
    () => filtersWithColors?.reduce((acc, filter) => acc + filter.value, 0),
    [filtersWithColors],
  );
  const visibleCasesAssignedToYouByWorkflowAmount = 4;
  const visibleCasesAssignedToYouByWorkflow = useMemo(
    () => filtersWithColors?.slice(0, visibleCasesAssignedToYouByWorkflowAmount),
    [filtersWithColors],
  );
  const activeCases = 30;
  const casesAssignedToUser = 3;
  const casesResolvedByUser = 3;
  const statistics = [
    {
      title: 'Cases Assigned to you',
      stat: <span className={'text-2xl font-bold'}>{casesAssignedToUser}</span>,
      description: `Out of ${activeCases} active cases`,
    },
    {
      title: 'Cases Assigned to you by Workflow',
      stat: (
        <div className={'flex items-center space-x-5 pt-3'}>
          <PieChart width={70} height={70}>
            <text
              x={35}
              y={37}
              textAnchor="middle"
              dominantBaseline="middle"
              className={ctw('font-bold', {
                'text-sm': assignedFilters?.toString().length >= 5,
              })}
            >
              {assignedFilters}
            </text>
            <Pie
              data={filters}
              cx={30}
              cy={30}
              innerRadius={28}
              outerRadius={35}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              cornerRadius={9999}
            >
              {filtersWithColors?.map(filter => {
                return (
                  <Cell
                    key={filter.id}
                    className={'outline-none'}
                    style={{
                      fill: filter.color,
                    }}
                  />
                );
              })}
            </Pie>
          </PieChart>
          <ul className={'w-full max-w-sm'}>
            {visibleCasesAssignedToYouByWorkflow?.map(({ name, color, value }) => {
              return (
                <li key={name} className={'flex items-center space-x-4 text-xs'}>
                  <span
                    className="flex h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: color,
                    }}
                  />
                  <div className={'flex w-full justify-between'}>
                    <span className={'text-slate-500'}>{name}</span>
                    <span>{value}</span>
                  </div>
                </li>
              );
            })}
            {filters?.length > visibleCasesAssignedToYouByWorkflowAmount && (
              <li className={'ms-6 text-xs'}>
                {filters?.length - visibleCasesAssignedToYouByWorkflowAmount} More
              </li>
            )}
          </ul>
        </div>
      ),
    },
    {
      title: 'Cases Resolved by you',
      stat: <span className={'text-2xl font-bold'}>{casesResolvedByUser}</span>,
      description: 'During the selected time period',
    },
  ] satisfies ReadonlyArray<{
    title: string;
    stat: ReactNode | ReactNode[];
    description?: string;
  }>;

  return {
    statistics,
  };
};
