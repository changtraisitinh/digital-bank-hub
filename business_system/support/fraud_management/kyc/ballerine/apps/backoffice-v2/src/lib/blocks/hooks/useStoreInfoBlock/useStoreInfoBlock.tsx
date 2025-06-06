import { createBlocksTyped } from '@/lib/blocks/create-blocks-typed/create-blocks-typed';
import { omitPropsFromObject } from '@/pages/Entity/hooks/useEntityLogic/utils';
import { useMemo } from 'react';

export const useStoreInfoBlock = ({ storeInfo, workflow }) => {
  return useMemo(() => {
    if (Object.keys(storeInfo ?? {}).length === 0) {
      return [];
    }

    return createBlocksTyped()
      .addBlock()
      .addCell({
        type: 'block',
        value: createBlocksTyped()
          .addBlock()
          .addCell({
            type: 'heading',
            value: 'Store',
          })
          .addCell({
            type: 'subheading',
            value: 'User-Provided Data',
          })
          .addCell({
            type: 'container',
            value: createBlocksTyped()
              .addBlock()
              .addCell({
                type: 'details',
                value: {
                  data: Object.entries(omitPropsFromObject(storeInfo, 'websiteUrls'))?.map(
                    ([title, value]) => ({
                      title,
                      value,
                      isEditable: false,
                    }),
                  ),
                },
                workflowId: workflow?.id,
                documents: workflow?.context?.documents?.map(
                  ({ details: _details, ...document }) => document,
                ),
                hideSeparator: true,
                isDocumentsV2: !!workflow?.workflowDefinition?.config?.isDocumentsV2,
              })
              .addCell({
                type: 'table',
                value: {
                  columns: [
                    {
                      accessorKey: 'websiteUrl',
                      header: 'Website URLs',
                    },
                  ],
                  data: storeInfo?.websiteUrls
                    ? storeInfo?.websiteUrls
                        ?.split(',')
                        ?.map(websiteUrl => ({ websiteUrl: websiteUrl?.trim() }))
                    : [],
                },
                hideSeparator: true,
              })
              .build()
              .flat(1),
          })
          .build()
          .flat(1),
      })
      .build();
  }, [storeInfo, workflow]);
};
