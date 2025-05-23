import { AccordionCard, HoverCard, HoverCardContent, HoverCardTrigger } from '@ballerine/ui';
import { FunctionComponent } from 'react';

import { Icon } from '@/common/components/molecules/ProcessTracker/constants';
import { useProcessTracker } from '@/common/components/molecules/ProcessTracker/hooks/useProcessTracker/useProcessTracker';
import { IProcessTrackerProps } from '@/common/components/molecules/ProcessTracker/interfaces';
import { HelpCircle } from 'lucide-react';

export const ProcessTracker: FunctionComponent<IProcessTrackerProps> = ({
  plugins,
  workflow,
  processes,
}) => {
  const { uncollapsedItemValue, onValueChange, trackedProcesses } = useProcessTracker({
    workflow,
    processes,
  });

  return (
    <div className={`max-w-xs`}>
      <AccordionCard value={uncollapsedItemValue} onValueChange={onValueChange}>
        <AccordionCard.Title
          className={`flex-row items-center justify-between`}
          rightChildren={
            <HoverCard openDelay={0}>
              <HoverCardTrigger className={`pb-1`}>
                <HelpCircle size={18} className={`stroke-slate-400/70`} />
              </HoverCardTrigger>
              <HoverCardContent side={'top'} align={'start'}>
                <ul className={`flex flex-col space-y-2`}>
                  <li className={`flex items-center gap-x-2`}>
                    {Icon.INDICATOR}
                    Process not started
                  </li>
                  <li className={`flex items-center gap-x-2`}>
                    {Icon.CLOCK}
                    Process started
                  </li>
                  <li className={`flex items-center gap-x-2`}>
                    {Icon.CHECK}
                    Process complete
                  </li>
                  <li className={`flex items-center gap-x-2`}>
                    {Icon.EDIT}
                    Process being handled by Agent
                  </li>
                  <li className={`flex items-center gap-x-2`}>
                    {Icon.MINUS}
                    <span className={`text-slate-400/40 line-through`}>Process cancelled</span>
                  </li>
                  <li className={`flex items-center gap-x-2`}>
                    {Icon.X}
                    Process failed
                  </li>
                  <li className={`flex items-center gap-x-2`}>
                    {Icon.REFRESH}
                    Re-do process started
                  </li>
                </ul>
              </HoverCardContent>
            </HoverCard>
          }
        >
          Processes
        </AccordionCard.Title>
        <AccordionCard.Content>
          {trackedProcesses.map(({ name, Component }) => (
            <Component key={name} workflow={workflow} plugins={plugins} processes={processes} />
          ))}
        </AccordionCard.Content>
      </AccordionCard>
    </div>
  );
};
