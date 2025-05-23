import { apiClient } from '@/common/api-client/api-client';
import { Method, States } from '@/common/enums';
import { env } from '@/common/env/env';
import { getOriginUrl } from '@/common/utils/get-origin-url/get-url-origin';
import { handleZodError } from '@/common/utils/handle-zod-error/handle-zod-error';
import { WorkflowDefinitionByIdSchema } from '@/domains/workflow-definitions/fetchers';
import { AmlSchema } from '@/lib/blocks/components/AmlBlock/utils/aml-adapter';
import { ObjectWithIdSchema } from '@/lib/zod/utils/object-with-id/object-with-id';
import { zPropertyKey } from '@/lib/zod/utils/z-property-key/z-property-key';
import { CollectionFlowStatusesEnum, CollectionFlowStepStatesEnum } from '@ballerine/common';
import qs from 'qs';
import { deepCamelKeys } from 'string-ts';
import { z } from 'zod';
import { IWorkflowId } from './interfaces';
import { EndUsersSchema } from '../individuals/fetchers';

export const updateContextAndSyncEntity = async ({
  workflowId,
  data,
}: {
  workflowId: string;
  data: Partial<TWorkflowById['context']>;
}) => {
  const [workflow, error] = await apiClient({
    endpoint: `../external/workflows/${workflowId}/sync-entity`,
    method: Method.PATCH,
    body: data,
    schema: z.undefined(),
  });

  return handleZodError(error, workflow);
};

export const fetchWorkflows = async (params: {
  filterId: string;
  orderBy: string;
  page: {
    number: number;
    size: number;
  };
  filter: Record<string, unknown>;
}) => {
  const queryParams = qs.stringify(params, { encode: false });

  const [workflows, error] = await apiClient({
    endpoint: `workflows?${queryParams}`,
    method: Method.GET,
    schema: z.object({
      data: z.array(
        z.object({
          id: z.string(),
          status: z.string(),
          createdAt: z.string().datetime(),
          entity: ObjectWithIdSchema.extend({
            name: z.string(),
            avatarUrl: z.string().nullable().optional(),
            approvalState: z.enum(States),
          }),
          assignee: ObjectWithIdSchema.extend({
            firstName: z.string(),
            lastName: z.string(),
            avatarUrl: z.string().nullable().optional(),
          }).nullable(),
          tags: z.array(z.string()).nullable().optional(),
        }),
      ),
      meta: z.object({
        totalItems: z.number().nonnegative(),
        totalPages: z.number().nonnegative(),
      }),
    }),
  });

  return handleZodError(error, workflows);
};

export const BaseWorkflowByIdSchema = z.object({
  id: z.string(),
  assigneeId: z.string().nullable().optional(),
  status: z.string(),
  state: z.string().nullable(),
  nextEvents: z.array(z.any()),
  tags: z.array(z.string()).nullable().optional(),
  workflowDefinition: WorkflowDefinitionByIdSchema,
  createdAt: z.string().datetime(),
  context: z.object({
    aml: AmlSchema.extend({
      vendor: z.string().optional(),
    }).optional(),
    documents: z.array(z.record(zPropertyKey, z.any())).default([]),
    entity: z.record(z.any(), z.any()),
    parentMachine: ObjectWithIdSchema.extend({
      status: z.union([z.literal('active'), z.literal('failed'), z.literal('completed')]),
    }).optional(),
    pluginsOutput: z
      .object({
        kyc_session: z.record(z.string(), z.any()).optional(),
        ubo: z
          .object({
            data: z
              .object({
                // nodes: z.array(
                //   z.object({
                //     id: z.string(),
                //     data: z.object({
                //       name: z.string(),
                //       type: z.string(),
                //       sharePercentage: z.number().optional(),
                //     }),
                //   }),
                // ),
                // edges: z.array(
                //   z.object({
                //     id: z.string(),
                //     source: z.string(),
                //     target: z.string(),
                //     data: z.object({
                //       sharePercentage: z.number().optional(),
                //     }),
                //   }),
                // ),
              })
              .passthrough()
              .optional(),
            message: z.string().optional(),
            isRequestTimedOut: z.boolean().optional(),
          })
          .passthrough()
          .optional(),
        merchantMonitoring: z
          .object({
            reportId: z.string().nullish(),
          })
          .passthrough()
          .nullish(),
      })
      .passthrough()
      .optional(),
    pluginsInput: z
      .object({
        merchantScreening: z
          .object({
            requestPayload: z.record(z.string(), z.unknown()).optional(),
          })
          .passthrough()
          .optional(),
      })
      .passthrough()
      .optional(),
    metadata: z
      .object({
        collectionFlowUrl: z.string().url().optional(),
        token: z.string().optional(),
      })
      .passthrough()
      .optional(),
    collectionFlow: z
      .object({
        config: z.object({
          apiUrl: z.string().url(),
        }),
        state: z.object({
          currentStep: z.string(),
          status: z.enum(Object.values(CollectionFlowStatusesEnum) as [string, ...string[]]),
          steps: z.array(
            z.object({
              stepName: z.string(),
              // TODO: Deprecate `isCompleted` and use `state` instead.
              isCompleted: z.boolean().optional(),
              state: z
                .enum(Object.values(CollectionFlowStepStatesEnum) as [string, ...string[]])
                .optional(),
              reason: z.string().optional(),
            }),
          ),
        }),
        additionalInformation: z.record(z.string(), z.unknown()).optional(),
      })
      .optional(),
    customData: z.record(z.string(), z.unknown()).optional(),
  }),
  entity: ObjectWithIdSchema.extend({
    name: z.string(),
    avatarUrl: z.string().nullable().optional(),
    approvalState: z.enum(States),
  }),
  assignee: ObjectWithIdSchema.extend({
    firstName: z.string(),
    lastName: z.string(),
    avatarUrl: z.string().nullable().optional(),
  }).nullable(),
  config: z.record(z.string(), z.unknown()).optional(),
  endUsers: EndUsersSchema.default([]),
});

export const WorkflowByIdSchema = BaseWorkflowByIdSchema.extend({
  childWorkflows: z
    .array(
      BaseWorkflowByIdSchema.omit({
        context: true,
      }).extend({
        context: BaseWorkflowByIdSchema.shape.context.omit({
          collectionFlow: true,
        }),
      }),
    )
    .optional(),
});

export type TWorkflowById = z.output<typeof WorkflowByIdSchema>;

export const fetchWorkflowById = async ({ workflowId }: { workflowId: string }) => {
  const [workflow, error] = await apiClient({
    endpoint: `workflows/${workflowId}`,
    method: Method.GET,
    schema: WorkflowByIdSchema.transform(data => ({
      ...data,
      context: {
        ...data.context,
        pluginsOutput: {
          ...data.context?.pluginsOutput,
          // TODO: Upgrade workflows-service TypeScript version to >= 5 and use `string-ts`'s `deepCamelCase` instead on the server side in `formatWorkflow`.
          // Currently, `nest-access-control` v2.2.0 is incompatible with TypeScript >= 5.
          website_monitoring: {
            ...data.context?.pluginsOutput?.website_monitoring,
            data: deepCamelKeys(data.context?.pluginsOutput?.website_monitoring?.data ?? {}),
          },
        },
      },
    })),
  });

  return handleZodError(error, workflow);
};

export const fetchUpdateWorkflowById = async ({
  workflowId,
  body,
}: IWorkflowId & {
  body: Record<PropertyKey, unknown>;
}) => {
  const [workflow, error] = await apiClient({
    endpoint: `workflows/${workflowId}`,
    method: Method.PATCH,
    body,
    schema: z.any(),
  });

  return handleZodError(error, workflow);
};

export const updateWorkflowDocumentById = async ({
  workflowId,
  documentId,
  body,
  contextUpdateMethod,
}: IWorkflowId & {
  documentId: string;
  body: Record<PropertyKey, unknown>;
  contextUpdateMethod?: 'base' | 'director';
}) => {
  const [workflow, error] = await apiClient({
    endpoint: `workflows/${workflowId}/documents/${documentId}${
      contextUpdateMethod ? `?contextUpdateMethod=${contextUpdateMethod}` : ''
    }`,
    method: Method.PATCH,
    body,
    schema: z.any(),
  });

  return handleZodError(error, workflow);
};

export const updateWorkflowSetAssignById = async ({
  workflowId,
  body,
}: IWorkflowId & {
  body: { assigneeId: string | null; isAssignedToMe?: boolean };
}) => {
  const [workflow, error] = await apiClient({
    endpoint: `workflows/assign/${workflowId}`,
    method: Method.PATCH,
    body,
    schema: z.any(),
  });

  return handleZodError(error, workflow);
};

export const fetchWorkflowEvent = async ({
  workflowId,
  body,
}: IWorkflowId & {
  body:
    | {
        name: string;
      }
    | {
        name: string;
        document: string;
        resubmissionReason: string;
      };
}) => {
  const [workflow, error] = await apiClient({
    endpoint: `workflows/${workflowId}/event`,
    method: Method.POST,
    body,
    schema: z.any(),
  });

  return handleZodError(error, workflow);
};

export const updateWorkflowDecision = async ({
  workflowId,
  documentId,
  body,
  contextUpdateMethod,
}: IWorkflowId & {
  documentId: string;
  body: {
    decision: string | null;
    directorId?: string;
    reason?: string;
    comment?: string;
  };
  contextUpdateMethod: 'base' | 'director';
}) => {
  const [workflow, error] = await apiClient({
    endpoint: `workflows/${workflowId}/decision/${documentId}${
      contextUpdateMethod ? `?contextUpdateMethod=${contextUpdateMethod}` : ''
    }`,
    method: Method.PATCH,
    body,
    schema: WorkflowByIdSchema.pick({
      context: true,
    }),
  });

  return handleZodError(error, workflow);
};

export const fetchWorkflowEventDecision = async ({
  workflowId,
  body,
}: IWorkflowId & {
  body: {
    name: string;
    reason?: string;
  };
}) => {
  const [workflow, error] = await apiClient({
    endpoint: `workflows/${workflowId}/event-decision`,
    method: Method.PATCH,
    body,
    schema: z.any(),
  });

  return handleZodError(error, workflow);
};

export const createWorkflowRequest = async ({
  workflowDefinitionId,
  context,
}: {
  workflowDefinitionId: string;
  context: TWorkflowById['context'];
}) => {
  const [workflow, error] = await apiClient({
    method: Method.POST,
    url: `${getOriginUrl(env.VITE_API_URL)}/api/v1/case-management`,
    body: {
      workflowId: workflowDefinitionId,
      context,
    },
    schema: z.any(),
  });

  return handleZodError(error, workflow);
};

export const fetchWorkflowDocumentOCRResult = async ({
  workflowRuntimeId,
  documentId,
}: {
  workflowRuntimeId: string;
  documentId: string;
}) => {
  const [workflow, error] = await apiClient({
    method: Method.GET,
    url: `${getOriginUrl(
      env.VITE_API_URL,
    )}/api/v1/internal/workflows/${workflowRuntimeId}/documents/${documentId}/run-ocr`,
    schema: z.any(),
    timeout: 40_000,
  });

  return handleZodError(error, workflow);
};
