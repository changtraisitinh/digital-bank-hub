import { useCallback, useMemo } from 'react';

import { createBlocksTyped } from '@/lib/blocks/create-blocks-typed/create-blocks-typed';
import { WarningFilledSvg } from '@ballerine/ui';

export const useKybRegistryInfoBlock = ({ pluginsOutput, workflow }) => {
  const getCell = useCallback(() => {
    if (Object.keys(pluginsOutput?.businessInformation?.data?.[0] ?? {}).length) {
      return {
        id: 'nested-details',
        type: 'details',
        hideSeparator: true,
        value: {
          data: Object.entries(pluginsOutput?.businessInformation?.data?.[0])?.map(
            ([title, value]) => ({
              title,
              value,
            }),
          ),
        },
        workflowId: workflow?.id,
        documents: workflow?.context?.documents?.map(
          ({ details: _details, ...document }) => document,
        ),
        isDocumentsV2: !!workflow?.workflowDefinition?.config?.isDocumentsV2,
      };
    }

    const message =
      pluginsOutput?.businessInformation?.message ??
      pluginsOutput?.businessInformation?.data?.message;

    if (message) {
      return {
        type: 'paragraph',
        value: (
          <span className="flex text-sm text-black/60">
            <WarningFilledSvg
              className={'me-2 mt-px text-black/20 [&>:not(:first-child)]:stroke-background'}
              width={'20'}
              height={'20'}
            />
            <span>{message}</span>
          </span>
        ),
      } satisfies Extract<
        Parameters<ReturnType<typeof createBlocksTyped>['addCell']>[0],
        {
          type: 'paragraph';
        }
      >;
    }

    if (pluginsOutput?.businessInformation?.isRequestTimedOut) {
      return {
        type: 'paragraph',
        value: (
          <span className="flex text-sm text-black/60">
            <WarningFilledSvg
              className={'me-2 mt-px text-black/20 [&>:not(:first-child)]:stroke-background'}
              width={'20'}
              height={'20'}
            />
            <span>
              The request timed out either because the company was not found in the registry, or the
              information is currently unavailable.
            </span>
          </span>
        ),
      } satisfies Extract<
        Parameters<ReturnType<typeof createBlocksTyped>['addCell']>[0],
        {
          type: 'paragraph';
        }
      >;
    }
  }, [pluginsOutput, workflow]);

  return useMemo(() => {
    const cell = getCell();

    if (!cell) {
      return [];
    }

    return createBlocksTyped()
      .addBlock()
      .addCell({
        type: 'block',
        value: createBlocksTyped()
          .addBlock()
          .addCell({
            id: 'nested-details-heading',
            type: 'heading',
            value: 'Registry Information',
          })
          .addCell({
            id: 'nested-details-subheading',
            type: 'subheading',
            value: 'Registry-Provided Data',
            props: {
              className: 'mb-4',
            },
          })
          .addCell(cell)
          .build()
          .flat(1),
      })
      .build();
  }, [getCell]);
};
