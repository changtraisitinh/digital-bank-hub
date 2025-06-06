import { WorkflowTokenService } from '@/auth/workflow-token/workflow-token.service';
import { BusinessReportService } from '@/business-report/business-report.service';
import { BusinessRepository } from '@/business/business.repository';
import { BusinessService } from '@/business/business.service';
import { ajv } from '@/common/ajv/ajv.validator';
import { AppLoggerService } from '@/common/app-logger/app-logger.service';
import { EntityRepository } from '@/common/entity/entity.repository';
import { SortOrder } from '@/common/query-filters/sort-order';
import { TDocumentsWithoutPageType, TDocumentWithoutPageType } from '@/common/types';
import { aliasIndividualAsEndUser } from '@/common/utils/alias-individual-as-end-user/alias-individual-as-end-user';
import { logDocumentWithoutId } from '@/common/utils/log-document-without-id/log-document-without-id';
import { TOcrImages, UnifiedApiClient } from '@/common/utils/unified-api-client/unified-api-client';
import { CustomerService } from '@/customer/customer.service';
import { FEATURE_LIST } from '@/customer/types';
import { EndUserRepository } from '@/end-user/end-user.repository';
import { EndUserService } from '@/end-user/end-user.service';
import { env } from '@/env';
import { ValidationError } from '@/errors';
import { PrismaService } from '@/prisma/prisma.service';
import {
  beginTransactionIfNotExistCurry,
  defaultPrismaTransactionOptions,
} from '@/prisma/prisma.util';
import { ProjectScopeService } from '@/project/project-scope.service';
// eslint-disable-next-line import/no-cycle
import { FileService } from '@/providers/file/file.service';
import { RiskRuleService, TFindAllRulesOptions } from '@/rule-engine/risk-rule.service';
import { RuleEngineService } from '@/rule-engine/rule-engine.service';
import { SalesforceService } from '@/salesforce/salesforce.service';
import { AwsSecretsManager } from '@/secrets-manager/aws-secrets-manager';
import { InMemorySecretsManager } from '@/secrets-manager/in-memory-secrets-manager';
import { SecretsManagerFactory } from '@/secrets-manager/secrets-manager.factory';
import { SentryService } from '@/sentry/sentry.service';
import { StorageService } from '@/storage/storage.service';
import type {
  InputJsonValue,
  IObjectWithId,
  PrismaTransaction,
  TProjectId,
  TProjectIds,
} from '@/types';
import { UiDefinitionService } from '@/ui-definition/ui-definition.service';
import { UserService } from '@/user/user.service';
import { WorkflowDefinitionRepository } from '@/workflow-defintion/workflow-definition.repository';
import { assignIdToDocuments } from '@/workflow/assign-id-to-documents';
import { WorkflowAssigneeId } from '@/workflow/dtos/workflow-assignee-id';
import { WorkflowDefinitionCloneDto } from '@/workflow/dtos/workflow-definition-clone';
import { WorkflowLogService, WorkflowRunnerLogEntry } from '@/workflow/workflow-log.service';
import { toPrismaOrderBy } from '@/workflow/utils/toPrismaOrderBy';
import { toPrismaWhere } from '@/workflow/utils/toPrismaWhere';
import {
  AnyRecord,
  buildCollectionFlowState,
  BusinessDataSchema,
  CollectionFlowStatusesEnum,
  DefaultContextSchema,
  getDocumentId,
  getOrderedSteps,
  IndividualDataSchema,
  isErrorWithMessage,
  isObject,
  ProcessStatus,
  setCollectionFlowStatus,
  TWorkflowHelpers,
} from '@ballerine/common';
import {
  ARRAY_MERGE_OPTION,
  BUILT_IN_EVENT,
  ChildPluginCallbackOutput,
  ChildToParentCallback,
  ChildWorkflowCallback,
  createWorkflow,
  HelpersTransformer,
  JmespathTransformer,
  SerializableTransformer,
  THelperFormatingLogic,
  Transformer,
  TWorkflowTokenPluginCallback,
} from '@ballerine/workflow-core';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApprovalState,
  BusinessPosition,
  Customer,
  EndUser,
  Prisma,
  PrismaClient,
  UiDefinitionContext,
  User,
  WorkflowDefinition,
  WorkflowRuntimeData,
  WorkflowRuntimeDataStatus,
} from '@prisma/client';
import { Static, TSchema } from '@sinclair/typebox';
import { plainToClass } from 'class-transformer';
import dayjs from 'dayjs';
import { get, isEqual, merge } from 'lodash';
import mime from 'mime';
import { WORKFLOW_FINAL_STATES } from './consts';
import { WorkflowDefinitionCreateDto } from './dtos/workflow-definition-create';
import { WorkflowDefinitionFindManyArgs } from './dtos/workflow-definition-find-many-args';
import { WorkflowDefinitionUpdateInput } from './dtos/workflow-definition-update-input';
import { WorkflowEventInputSchema } from './dtos/workflow-event-input';
import { ConfigSchema, WorkflowConfig } from './schemas/zod-schemas';
import {
  ListRuntimeDataResult,
  ListWorkflowsRuntimeParams,
  TWorkflowWithRelations,
  WorkflowRuntimeListQueryResult,
} from './types';
import { addPropertiesSchemaToDocument } from './utils/add-properties-schema-to-document';
import { entitiesUpdate } from './utils/entities-update';
import { WorkflowEventEmitterService } from './workflow-event-emitter.service';
import { WorkflowRuntimeDataRepository } from './workflow-runtime-data.repository';
import { PartialDeep } from 'type-fest';
import { WorkflowAssignee, WorkflowRuntimeListItemModel } from './workflow-runtime-list-item.model';

type TEntityId = string;

export type TEntityType = 'endUser' | 'business';

type CollectionFlowEvent = 'approved' | 'rejected' | 'revision';
const COLLECTION_FLOW_EVENTS_WHITELIST: readonly CollectionFlowEvent[] = [
  'approved',
  'rejected',
  'revision',
] as const;

const getAvatarUrl = (website: string | undefined | null) =>
  website
    ? `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${website}&size=40`
    : null;

@Injectable()
export class WorkflowService {
  constructor(
    protected readonly workflowDefinitionRepository: WorkflowDefinitionRepository,
    protected readonly workflowRuntimeDataRepository: WorkflowRuntimeDataRepository,
    protected readonly endUserRepository: EndUserRepository,
    protected readonly endUserService: EndUserService,
    protected readonly businessReportService: BusinessReportService,
    protected readonly businessRepository: BusinessRepository,
    protected readonly businessService: BusinessService,
    protected readonly entityRepository: EntityRepository,
    protected readonly customerService: CustomerService,
    protected readonly fileService: FileService,
    protected readonly workflowEventEmitter: WorkflowEventEmitterService,
    private readonly logger: AppLoggerService,
    private readonly projectScopeService: ProjectScopeService,
    private readonly userService: UserService,
    private readonly salesforceService: SalesforceService,
    private readonly workflowTokenService: WorkflowTokenService,
    private readonly uiDefinitionService: UiDefinitionService,
    private readonly prismaService: PrismaService,
    private readonly riskRuleService: RiskRuleService,
    private readonly ruleEngineService: RuleEngineService,
    private readonly sentry: SentryService,
    private readonly secretsManagerFactory: SecretsManagerFactory,
    private readonly storageService: StorageService,
    private readonly workflowLogService: WorkflowLogService,
  ) {}

  async createWorkflowDefinition(data: WorkflowDefinitionCreateDto) {
    const select = {
      id: true,
      name: true,
      version: true,
      definition: true,
      definitionType: true,
      extensions: true,
      persistStates: true,
      submitStates: true,
    };

    const createWorkflowDefinitionPayload = {
      data: {
        ...data,
        definition: data.definition as InputJsonValue,
        contextSchema: data.contextSchema as InputJsonValue,
        documentsSchema: data.documentsSchema as InputJsonValue,
        config: data.config as InputJsonValue,
        extensions: data.extensions as InputJsonValue,
        persistStates: data.persistStates as InputJsonValue,
        submitStates: data.submitStates as InputJsonValue,
      },
      select,
    } satisfies Parameters<WorkflowDefinitionRepository['create']>['0'];

    if (data.isPublic) {
      return await this.workflowDefinitionRepository.createUnscoped(
        createWorkflowDefinitionPayload,
      );
    }

    return await this.workflowDefinitionRepository.create(createWorkflowDefinitionPayload);
  }

  async cloneWorkflowDefinition(data: WorkflowDefinitionCloneDto, projectId: string) {
    const select = {
      reviewMachineId: true,
      name: true,
      version: true,
      definitionType: true,
      definition: true,
      contextSchema: true,
      config: true,
      extensions: true,
      persistStates: true,
      submitStates: true,
    };

    const workflowDefinition = await this.workflowDefinitionRepository.findTemplateByIdUnscoped(
      data.id,
      { select },
    );

    return await this.workflowDefinitionRepository.create({
      // @ts-expect-error - types of workflow definition does not propagate to the prisma creation type
      data: { ...workflowDefinition, name: data.name, projectId: projectId, isPublic: false },
      select,
    });
  }

  async getWorkflowRuntimeDataById(
    id: string,
    args: Parameters<WorkflowRuntimeDataRepository['findById']>[1],
    projectIds: TProjectIds,
  ) {
    return await this.workflowRuntimeDataRepository.findById(id, args, projectIds);
  }

  async getWorkflowRuntimeDataByIdAndLockUnscoped({
    id,
    transaction,
  }: {
    id: string;
    transaction: PrismaTransaction | PrismaClient;
  }) {
    return await this.workflowRuntimeDataRepository.findByIdAndLockUnscoped({
      id,
      transaction,
    });
  }

  async getWorkflowByIdWithRelations(id: string, projectIds: TProjectIds) {
    const workflow = await this.workflowRuntimeDataRepository.findByIdWithRelations(id, projectIds);

    return this.formatWorkflow(workflow);
  }

  private formatWorkflow(
    workflow: TWorkflowWithRelations,
    addNextEvents = true,
  ): TWorkflowWithRelations {
    const getEntity = (workflow: TWorkflowWithRelations) => {
      if ('endUser' in workflow && !!workflow?.endUser) {
        return {
          id: workflow?.endUser?.id,
          name: [workflow?.endUser?.firstName, workflow?.endUser?.lastName]
            .filter(Boolean)
            .join(' '),
          avatarUrl: workflow?.endUser?.avatarUrl,
          approvalState: workflow?.endUser?.approvalState,
        };
      }

      if ('business' in workflow && workflow?.business) {
        return {
          id: workflow?.business?.id,
          name: workflow?.business?.companyName,
          approvalState: workflow?.business?.approvalState,
          avatarUrl: getAvatarUrl(workflow?.business?.website),
        };
      }

      throw new InternalServerErrorException('Workflow entity is not defined');
    };

    let nextEvents;

    if (addNextEvents) {
      const service = createWorkflow({
        runtimeId: workflow.id,
        // @ts-expect-error - error from Prisma types fix
        definition: workflow.workflowDefinition.definition,
        // Might want to change to type string in `createWorkflow` or add a type for `workflowDefinition` of 'statechart-json' | 'bpmn-json'
        definitionType: workflow.workflowDefinition.definitionType as 'statechart-json',
        workflowContext: {
          machineContext: workflow.context,
          // @ts-expect-error - error from Prisma types fix
          state: workflow.state ?? workflow.workflowDefinition.definition?.initial,
        },
      });

      nextEvents = service.getSnapshot().nextEvents;
    }

    return {
      ...workflow,
      endUsers: workflow.endUsers ?? [],
      context: {
        ...workflow.context,
        documents: workflow.context?.documents?.map(
          (document: DefaultContextSchema['documents'][number]) => {
            return addPropertiesSchemaToDocument(
              document,
              workflow.workflowDefinition.documentsSchema,
            );
          },
        ),
        pluginsOutput: Object.fromEntries(
          Object.entries(workflow.context.pluginsOutput || {}).map(([pluginName, pluginValue]) => {
            if (
              isObject(pluginValue) &&
              pluginValue.status === ProcessStatus.IN_PROGRESS &&
              pluginValue.invokedAt
            ) {
              const parsedDate = new Date(Number(pluginValue.invokedAt));

              const TIMEOUT_IN_MS = 24 * 60 * 60 * 1000;

              return [
                pluginName,
                {
                  ...pluginValue,
                  ...(parsedDate && !isNaN(parsedDate.getTime())
                    ? { isRequestTimedOut: Date.now() - parsedDate.getTime() > TIMEOUT_IN_MS }
                    : {}),
                },
              ];
            }

            return [pluginName, pluginValue];
          }),
        ),
      },
      entity: getEntity(workflow),
      endUser: undefined,
      // @ts-expect-error - error from Prisma types fix
      business: undefined,
      nextEvents,
      childWorkflows: workflow.childWorkflowsRuntimeData?.map(childWorkflow =>
        this.formatWorkflow(childWorkflow),
      ),
    };
  }

  async persistChildEvent(
    childPluginConfig: ChildPluginCallbackOutput,
    projectIds: TProjectIds,
    currentProjectId: TProjectId,
    transaction: PrismaTransaction,
  ) {
    this.logger.log('Persisting child event', {
      childPluginConfig,
      projectIds,
      currentProjectId,
    });
    const childWorkflow = (
      await this.createOrUpdateWorkflowRuntime(
        {
          workflowDefinitionId: childPluginConfig.definitionId,
          context: childPluginConfig.initOptions.context as unknown as DefaultContextSchema,
          config: childPluginConfig.initOptions.config as unknown as AnyRecord,
          parentWorkflowId: childPluginConfig.parentWorkflowRuntimeId,
          projectIds,
          currentProjectId,
        },
        transaction,
      )
    )[0];

    if (childWorkflow) {
      const newContext = {
        childWorkflows: {
          [childWorkflow.workflowRuntimeData.id]: {
            [childWorkflow.workflowRuntimeData.id]: {
              entityId: childWorkflow.workflowRuntimeData.context.entity.id,
              status: childWorkflow.workflowRuntimeData.status || 'active',
              state: childWorkflow.workflowRuntimeData.state,
            },
          },
        },
      };

      await this.event(
        {
          id: childPluginConfig.parentWorkflowRuntimeId,
          name: BUILT_IN_EVENT.DEEP_MERGE_CONTEXT,
          payload: {
            newContext,
            arrayMergeOption: ARRAY_MERGE_OPTION.REPLACE,
          },
        },
        projectIds,
        currentProjectId,
        transaction,
      );
    } else {
      this.logger.warn('Child workflow not created', {
        childPluginConfig,
        projectIds,
        currentProjectId,
      });
    }

    return childWorkflow;
  }

  async getWorkflowDefinitionById(
    id: string,
    args: Parameters<WorkflowDefinitionRepository['findById']>[1],
    projectIds: TProjectIds,
    transaction?: PrismaTransaction,
  ) {
    return await this.workflowDefinitionRepository.findById(id, args, projectIds, transaction);
  }

  async getWorkflowsByState(state: string[], args: Prisma.WorkflowRuntimeDataFindManyArgs) {
    return await this.workflowRuntimeDataRepository.findManyUnscoped({
      where: { state: { in: state } },
      ...args,
    });
  }

  async listActiveWorkflowsRuntimeStates(projectIds: TProjectIds) {
    return await this.workflowRuntimeDataRepository.findMany(
      {
        select: {
          state: true,
          endUserId: true,
          businessId: true,
          assigneeId: true,
          id: true,
          status: true,
          workflowDefinitionId: true,
        },
      },
      projectIds,
    );
  }

  async listWorkflowRuntimeDataWithRelations(
    {
      args,
      entityType,
      orderBy,
      page,
      filters,
      search,
    }: {
      search?: string;
      args: Parameters<WorkflowRuntimeDataRepository['findMany']>[0];
      entityType: 'individuals' | 'businesses';
      orderBy: Parameters<typeof toPrismaOrderBy>[0];
      page: {
        number: number;
        size: number;
      };
      filters?: {
        assigneeId?: Array<string | null>;
        status?: WorkflowRuntimeDataStatus[];
        caseStatus?: string[];
      };
    },
    projectIds: TProjectIds,
  ) {
    const skip = (page.number - 1) * page.size;

    const query = this.projectScopeService.scopeFindMany(
      merge(
        args,
        {
          orderBy: toPrismaOrderBy(orderBy, entityType),
          where: filters ? toPrismaWhere(filters) : {},
          skip,
          take: page.size,
        },
        {
          where:
            entityType === 'individuals'
              ? { endUserId: { not: null } }
              : { businessId: { not: null } },
        },
      ),
      projectIds,
    );

    const getWorkflowDefinitionIds = () => {
      if (typeof query?.where?.workflowDefinitionId === 'string') {
        return [query.where.workflowDefinitionId];
      }

      if (Array.isArray(query?.where?.workflowDefinitionId?.in)) {
        return query?.where?.workflowDefinitionId?.in;
      }

      return [];
    };

    const workflowIds = await this.workflowRuntimeDataRepository.search(
      {
        query: {
          skip,
          take: page.size,
          search: search ?? '',
          entityType,
          statuses:
            ((query.where.status as Prisma.EnumWorkflowRuntimeDataStatusFilter)?.in as string[]) ||
            [],
          workflowDefinitionIds: getWorkflowDefinitionIds(),
          orderBy,
        },
        filters,
      },
      projectIds,
    );

    const workflowsQuery = {
      ...query,
      where: { id: { in: workflowIds.map(workflowId => workflowId.id) } },
    };

    const [workflowCount, workflows] = await Promise.all([
      this.workflowRuntimeDataRepository.count({ where: query.where }, projectIds),
      this.workflowRuntimeDataRepository.findMany(
        {
          where: workflowsQuery.where,
          select: workflowsQuery.select,
          orderBy: workflowsQuery.orderBy,
        },
        projectIds,
      ),
    ]);

    if (page.number > 1 && workflowCount < skip + 1) {
      throw new NotFoundException('Page not found');
    }

    return {
      data: this.formatWorkflowsRuntimeData(workflows as unknown as TWorkflowWithRelations[]),
      meta: {
        totalItems: workflowCount,
        totalPages: Math.max(Math.ceil(workflowCount / page.size), 1),
      },
    };
  }

  private formatWorkflowsRuntimeData(workflows: TWorkflowWithRelations[]) {
    return workflows.map(workflow => {
      const isIndividual = 'endUser' in workflow;

      return {
        id: workflow?.id,
        status: workflow?.status,
        createdAt: workflow?.createdAt,
        entity: {
          id: isIndividual ? workflow?.endUser?.id : workflow?.business?.id,
          name: isIndividual
            ? `${String(workflow?.endUser?.firstName)} ${String(workflow?.endUser?.lastName)}`
            : workflow?.business?.companyName,
          avatarUrl: isIndividual
            ? workflow?.endUser?.avatarUrl
            : getAvatarUrl(workflow?.business?.website),
          approvalState: isIndividual
            ? workflow?.endUser?.approvalState
            : workflow?.business?.approvalState,
        },
        assignee: workflow?.assigneeId
          ? {
              id: workflow?.assigneeId,
              firstName: workflow?.assignee?.firstName,
              lastName: workflow?.assignee?.lastName,
              avatarUrl: workflow?.assignee?.avatarUrl,
            }
          : null,
        tags: workflow?.tags,
      };
    });
  }

  async listWorkflowRuntimeDataByUserId(userId: string, projectIds: TProjectIds) {
    return await this.workflowRuntimeDataRepository.findMany(
      {
        where: { endUserId: userId },
      },
      projectIds,
    );
  }

  async listFullWorkflowDataByUserId(
    {
      entityId,
      entity,
    }: {
      entityId: string;
      entity: TEntityType;
    },
    projectIds: TProjectIds,
  ) {
    return await this.workflowRuntimeDataRepository.findMany(
      {
        where: {
          [`${entity}Id`]: entityId,
        },
        include: { workflowDefinition: true },
      },
      projectIds,
    );
  }

  async listRuntimeData(
    { page, size, status, orderBy, orderDirection }: ListWorkflowsRuntimeParams,
    projectIds: TProjectIds,
  ): Promise<ListRuntimeDataResult> {
    const query = {
      where: {
        ...(status ? { status: { in: status } } : undefined),
        ...(projectIds ? { projectId: { in: projectIds } } : undefined),
      },
    };

    const [workflowsRuntimeCount, workflowsRuntime] = await Promise.all([
      this.workflowRuntimeDataRepository.count(query, projectIds),
      this.workflowRuntimeDataRepository.findMany(
        {
          ...query,
          skip: page && size ? (page - 1) * size : undefined,
          take: size,
          include: {
            workflowDefinition: true,
            assignee: true,
          },
          orderBy: this._resolveOrderByParams(orderBy, orderDirection),
        },
        projectIds,
      ),
    ]);

    return {
      results: this.workflowsRuntimeListItemsFactory(
        workflowsRuntime as unknown as WorkflowRuntimeListQueryResult[],
      ),
      meta: {
        pages: size ? Math.max(Math.ceil(workflowsRuntimeCount / size)) : 0,
        total: workflowsRuntimeCount,
      },
    };
  }

  private _resolveOrderByParams(
    orderBy: string | undefined,
    orderDirection: SortOrder | undefined,
  ): object {
    if (!orderBy && !orderDirection) {
      return {};
    }

    if (orderBy === 'assignee') {
      return {
        assignee: {
          firstName: orderDirection,
        },
      };
    }

    if (orderBy === 'workflowDefinitionName') {
      return {
        workflowDefinition: {
          name: orderDirection,
        },
      };
    }

    return {
      [orderBy as string]: orderDirection,
    };
  }

  private workflowsRuntimeListItemsFactory(
    workflows: WorkflowRuntimeListQueryResult[],
  ): WorkflowRuntimeListItemModel[] {
    return workflows.map(workflow => {
      const { assignee, workflowDefinition } = workflow;

      return plainToClass(
        WorkflowRuntimeListItemModel,
        {
          ...workflow,
          assignee: assignee ? plainToClass(WorkflowAssignee, assignee) : null,
          workflowDefinitionName: workflowDefinition?.name || null,
        },
        { excludeExtraneousValues: true },
      );
    });
  }

  async listWorkflowDefinitions(args: WorkflowDefinitionFindManyArgs, projectIds: TProjectIds) {
    const select = {
      id: true,
      name: true,
      version: true,
      definition: true,
      definitionType: true,
      extensions: true,
      persistStates: true,
      submitStates: true,
    };

    return await this.workflowDefinitionRepository.findMany({ ...args, select }, projectIds);
  }

  async updateDecisionAndSendEvent({
    id,
    name,
    reason,
    projectId,
  }: {
    id: string;
    name: 'approve' | 'reject' | 'revision';
    reason?: string;
    projectId: TProjectId;
  }) {
    return await this.prismaService.$transaction(async transaction => {
      const runtimeData = await this.workflowRuntimeDataRepository.findByIdAndLock(
        id,
        {
          include: {
            workflowDefinition: true,
          },
        },
        [projectId],
        transaction,
      );
      // `name` is always `approve` and not `approved` etc.
      const Status = {
        approve: 'approved',
        reject: 'rejected',
        revision: 'revision',
      } as const satisfies Record<
        Exclude<typeof name, null>,
        NonNullable<DefaultContextSchema['documents'][number]['decision']>['status']
      >;
      const status = Status[name as keyof typeof Status];
      const decision = (() => {
        if (status === 'approved') {
          return {
            revisionReason: null,
            rejectionReason: null,
          };
        }

        if (status === 'rejected') {
          return {
            revisionReason: null,
            rejectionReason: reason,
          };
        }

        if (status === 'revision') {
          return {
            revisionReason: reason,
            rejectionReason: null,
          };
        }

        throw new BadRequestException(`Invalid decision status: ${status}`);
      })();
      const documentsWithDecision = runtimeData?.context?.documents?.map(
        (document: DefaultContextSchema['documents'][number]) => ({
          ...document,
          decision: {
            ...document?.decision,
            ...decision,
            status,
          },
        }),
      );
      const updatedWorkflow = await this.updateWorkflowRuntimeData(
        id,
        {
          context: {
            ...runtimeData.context,
            documents: documentsWithDecision,
          },
        },
        projectId,
        transaction,
      );

      await this.event(
        {
          id,
          name,
        },
        projectId ? [projectId] : null,
        projectId,
        transaction,
      );

      return updatedWorkflow;
    }, defaultPrismaTransactionOptions);
  }

  async updateDocumentDecisionById(
    {
      workflowId,
      directorId,
      documentId,
      documentsUpdateContextMethod,
    }: {
      workflowId: string;
      directorId?: string;
      documentId: string;
      documentsUpdateContextMethod?: 'base' | 'director';
    },
    decision: {
      status: 'approve' | 'reject' | 'revision' | 'revised' | null;
      reason?: string;
      comment?: string;
    },
    projectIds: TProjectIds,
    currentProjectId: TProjectId,
  ) {
    return await this.prismaService.$transaction(async transaction => {
      const workflow = await this.workflowRuntimeDataRepository.findByIdAndLock(
        workflowId,
        {},
        projectIds,
        transaction,
      );
      const workflowDefinition = await this.workflowDefinitionRepository.findById(
        workflow?.workflowDefinitionId,
        {},
        projectIds,
        transaction,
      );
      // `name` is always `approve` and not `approved` etc.
      const Status = {
        approve: 'approved',
        reject: 'rejected',
        revision: 'revision',
        revised: 'revised',
      } as const satisfies Record<
        Exclude<typeof decision.status, null>,
        NonNullable<DefaultContextSchema['documents'][number]['decision']>['status']
      >;
      const status = decision.status ? Status[decision.status] : null;
      const newDecision = (() => {
        if (!status || status === 'approved') {
          return {
            revisionReason: null,
            rejectionReason: null,
            comment: decision.comment,
          };
        }

        if (status === 'rejected') {
          return {
            revisionReason: null,
            rejectionReason: decision?.reason,
            comment: decision.comment,
          };
        }

        if (['revision', 'revised'].includes(status)) {
          return {
            revisionReason: decision?.reason,
            rejectionReason: null,
            comment: decision.comment,
          };
        }

        throw new BadRequestException(`Invalid decision status: ${status}`);
      })();

      const documents = this.getDocuments(workflow.context, documentsUpdateContextMethod);
      let document = documents.find((document: any) => document.id === documentId);
      const updatedStatus =
        (documentId === document.id ? status : document?.decision?.status) ?? undefined;

      const updatedContext = this.updateDocumentInContext(
        workflow.context,
        {
          ...document,
          decision: {
            ...document?.decision,
            status: updatedStatus,
          },
          type:
            document?.type === 'unknown' && updatedStatus === 'approved'
              ? undefined
              : document?.type,
        },
        documentsUpdateContextMethod,
        directorId,
      );

      document = this.getDocuments(updatedContext, documentsUpdateContextMethod)?.find(
        (document: any) => document.id === documentId,
      );

      this.__validateWorkflowDefinitionContext(workflowDefinition, updatedContext);

      const documentWithDecision = {
        ...document,
        id: document.id,
        decision: {
          ...newDecision,
          status,
        },
      };
      const validateDocumentSchema = status === 'approved';

      const updatedWorkflow = await this.updateDocumentById(
        {
          workflowId,
          directorId,
          documentId,
          validateDocumentSchema,
          documentsUpdateContextMethod: documentsUpdateContextMethod,
        },
        documentWithDecision as unknown as DefaultContextSchema['documents'][number],
        projectIds![0]!,
        transaction,
      );

      logDocumentWithoutId({
        line: 'updateDocumentDecisionById 770',
        logger: this.logger,
        workflowRuntimeData: updatedWorkflow,
      });

      return updatedWorkflow;
    }, defaultPrismaTransactionOptions);
  }

  async updateDocumentById(
    {
      workflowId,
      documentId,
      validateDocumentSchema = true,
      documentsUpdateContextMethod,
      directorId,
    }: {
      workflowId: string;
      documentId: string;
      validateDocumentSchema?: boolean;
      documentsUpdateContextMethod?: 'base' | 'director';
      directorId?: string;
    },
    data: DefaultContextSchema['documents'][number] & { propertiesSchema?: object },
    projectId: TProjectId,
    transaction?: PrismaTransaction,
  ) {
    const beginTransactionIfNotExist = beginTransactionIfNotExistCurry({
      transaction,
      prismaService: this.prismaService,
      options: defaultPrismaTransactionOptions,
    });

    return await beginTransactionIfNotExist(async transaction => {
      const runtimeData = await this.workflowRuntimeDataRepository.findByIdAndLock(
        workflowId,
        {},
        [projectId],
        transaction,
      );
      const workflowDef = await this.workflowDefinitionRepository.findById(
        runtimeData.workflowDefinitionId,
        {},
        [projectId],
        transaction,
      );
      const documentToUpdate = runtimeData?.context?.documents?.find(
        (document: DefaultContextSchema['documents'][number]) => document.id === documentId,
      );

      const document = {
        ...data,
        id: documentId,
      };

      const documentWithPropertiesSchema = addPropertiesSchemaToDocument(
        document,
        workflowDef.documentsSchema,
      );
      const propertiesSchema = documentWithPropertiesSchema?.propertiesSchema ?? {};

      if (Object.keys(propertiesSchema)?.length && validateDocumentSchema) {
        const propertiesSchemaForValidation = propertiesSchema;

        const validatePropertiesSchema = ajv.compile(propertiesSchemaForValidation);

        const isValidPropertiesSchema = validatePropertiesSchema(
          documentWithPropertiesSchema?.properties,
        );

        if (!isValidPropertiesSchema && document.type === documentToUpdate.type) {
          throw ValidationError.fromAjvError(validatePropertiesSchema.errors!);
        }
      }

      let updatedWorkflow = await this.event(
        {
          id: workflowId,
          name: BUILT_IN_EVENT.DEEP_MERGE_CONTEXT,
          payload: {
            newContext: this.updateDocumentInContext(
              runtimeData.context,
              documentWithPropertiesSchema,
              documentsUpdateContextMethod,
              directorId,
            ),
            arrayMergeOption:
              documentsUpdateContextMethod === 'director'
                ? ARRAY_MERGE_OPTION.BY_INDEX
                : ARRAY_MERGE_OPTION.BY_ID,
          },
        },
        [projectId],
        projectId,
        transaction,
      );

      const updatedDocuments = this.getDocuments(
        updatedWorkflow.context,
        documentsUpdateContextMethod,
      );

      logDocumentWithoutId({
        line: 'updateDocumentDecisionById 844',
        logger: this.logger,
        workflowRuntimeData: updatedWorkflow,
      });

      this.__validateWorkflowDefinitionContext(workflowDef, updatedWorkflow.context);
      const correlationId = await this.getCorrelationIdFromWorkflow(updatedWorkflow, [projectId]);

      if (
        ['active'].includes(updatedWorkflow.status) &&
        workflowDef.config?.completedWhenTasksResolved
      ) {
        const allDocumentsResolved =
          updatedDocuments?.length &&
          updatedDocuments?.every((document: DefaultContextSchema['documents'][number]) => {
            return ['approved', 'rejected', 'revision'].includes(
              document?.decision?.status as string,
            );
          });

        if (allDocumentsResolved) {
          updatedWorkflow = await this.workflowRuntimeDataRepository.updateStateById(
            workflowId,
            {
              data: {
                status: allDocumentsResolved ? 'completed' : updatedWorkflow.status,
                resolvedAt: new Date().toISOString(),
              },
            },
            transaction,
          );

          this.workflowEventEmitter.emit('workflow.completed', {
            runtimeData: updatedWorkflow,
            state: updatedWorkflow.state,
            //@ts-expect-error
            entityId: updatedWorkflow.businessId || updatedWorkflow.endUserId,
            correlationId,
          });
        }
      }

      return updatedWorkflow;
    });
  }

  private updateDocumentInContext(
    context: WorkflowRuntimeData['context'],
    updatePayload: any,
    method: 'base' | 'director' = 'base',
    directorId?: string,
  ): WorkflowRuntimeData['context'] {
    switch (method) {
      case 'base':
        return {
          ...context,
          documents: [updatePayload],
        };

      case 'director':
        return this.updateDirectorDocument(context, updatePayload, directorId);

      default:
        return context;
    }
  }

  private getDocuments(
    context: WorkflowRuntimeData['context'],
    documentsUpdateContextMethod: 'base' | 'director' = 'base',
  ) {
    switch (documentsUpdateContextMethod) {
      case 'base':
        return context.documents;
      case 'director':
        return this.getDirectorsDocuments(context);
      default:
        'base';
    }
  }

  private updateDirectorDocument(
    context: WorkflowRuntimeData['context'],
    documentUpdatePayload: any,
    directorId: string | undefined,
  ): WorkflowRuntimeData['context'] {
    if (!directorId) {
      throw new BadRequestException('Attempted to update director document without a director id');
    }

    const directorsDocuments = this.getDirectorsDocuments(context, directorId);

    this.logger.log('directorsDocuments', { directorsDocuments });

    directorsDocuments.forEach(document => {
      if (document?.id === documentUpdatePayload?.id) {
        Object.entries(documentUpdatePayload).forEach(([key, value]) => {
          document[key] = value;
        });
      }
    });

    return context;
  }

  private getDirectorsDocuments(
    context: WorkflowRuntimeData['context'],
    directorId?: string,
  ): any[] {
    return (
      this.getDirectors(context)
        .filter(director => {
          if (!directorId) {
            return true;
          }

          return director.ballerineEntityId === directorId;
        })
        .map(director => director.additionalInfo?.documents)
        .filter(Boolean)
        .flat() || ([] as any[])
    );
  }

  private getDirectors(context: WorkflowRuntimeData['context']): any[] {
    return (context?.entity?.data?.additionalInfo?.directors as any[]) || [];
  }

  async updateWorkflowRuntimeData(
    workflowRuntimeId: string,
    data: WorkflowDefinitionUpdateInput,
    projectId: TProjectId,
    transaction?: PrismaTransaction,
  ): Promise<WorkflowRuntimeData> {
    const beginTransactionIfNotExist = beginTransactionIfNotExistCurry({
      transaction,
      prismaService: this.prismaService,
      options: defaultPrismaTransactionOptions,
    });

    return await beginTransactionIfNotExist(async transaction => {
      const projectIds: TProjectIds = projectId ? [projectId] : null;

      const runtimeData = await this.workflowRuntimeDataRepository.findByIdAndLock(
        workflowRuntimeId,
        {},
        projectIds,
        transaction,
      );
      const workflowDef = await this.workflowDefinitionRepository.findById(
        runtimeData.workflowDefinitionId,
        {},
        projectIds,
        transaction,
      );

      const correlationId: string = await this.getCorrelationIdFromWorkflow(
        runtimeData,
        projectIds,
      );

      let contextHasChanged;

      if (data.context) {
        data.context.documents = assignIdToDocuments(data.context.documents);
        contextHasChanged = !isEqual(data.context, runtimeData.context);

        this.__validateWorkflowDefinitionContext(workflowDef, {
          ...data.context,
          documents: data.context?.documents?.map(
            (document: DefaultContextSchema['documents'][number]) => ({
              ...document,
              decision: {
                ...document?.decision,
                status:
                  document?.decision?.status === null ? undefined : document?.decision?.status,
              },
              type:
                document?.type === 'unknown' && document?.decision?.status === 'approved'
                  ? undefined
                  : document?.type,
            }),
          ),
        });

        // @ts-ignore
        data?.context?.documents?.forEach(({ propertiesSchema, ...document }) => {
          if (document?.decision?.status !== 'approve') {
            return;
          }

          if (!Object.keys(propertiesSchema ?? {})?.length) {
            return;
          }

          const validatePropertiesSchema = ajv.compile(propertiesSchema ?? {}); // we shouldn't rely on schema from the client, add to tech debt
          const isValidPropertiesSchema = validatePropertiesSchema(document?.properties);

          if (!isValidPropertiesSchema) {
            throw ValidationError.fromAjvError(validatePropertiesSchema.errors!);
          }
        });
      }

      this.logger.log('Workflow state transition', {
        id: workflowRuntimeId,
        from: runtimeData.state,
        to: data.state,
      });

      // in case current state is a final state, we want to create another machine, of type manual review.
      // assign runtime to user, copy the context.
      const currentState = data.state;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // TODO: Use snapshot.done instead
      const isFinal = workflowDef.definition?.states?.[currentState]?.type === 'final';
      const isResolved = isFinal || data.status === WorkflowRuntimeDataStatus.completed;

      const updatedResult = (await this.workflowRuntimeDataRepository.updateStateById(
        runtimeData.id,
        {
          data: {
            ...data,
            resolvedAt: isResolved ? new Date().toISOString() : null,
          },
          include: { assignee: true },
        },
        transaction,
      )) as WorkflowRuntimeData & { assignee: User | null };

      if (isResolved) {
        this.logger.log('Workflow resolved', { id: workflowRuntimeId });

        this.workflowEventEmitter.emit('workflow.completed', {
          runtimeData: updatedResult,
          state: currentState ?? updatedResult.state,
          // @ts-ignore - error from Prisma types fix
          entityId: updatedResult.businessId || updatedResult.endUserId,
          correlationId,
        });
      }

      if (contextHasChanged) {
        this.workflowEventEmitter.emit('workflow.context.changed', {
          assignee: updatedResult.assignee,
          assignedAt: updatedResult.assignedAt,
          oldRuntimeData: runtimeData,
          updatedRuntimeData: updatedResult,
          state: currentState as string,
          entityId: (runtimeData.businessId || runtimeData.endUserId) as string,
          correlationId: correlationId,
        });
      }

      return updatedResult;
    });
  }

  async updateWorkflowRuntimeLanguage(
    workflowRuntimeId: string,
    language: string,
    projectId: TProjectId,
  ): Promise<WorkflowRuntimeData> {
    const projectIds: TProjectIds = projectId ? [projectId] : null;

    return await this.workflowRuntimeDataRepository.updateRuntimeConfigById(
      workflowRuntimeId,
      { language },
      ARRAY_MERGE_OPTION.BY_INDEX,
      projectIds,
    );
  }

  async assignWorkflowToUser(
    workflowRuntimeId: string,
    { assigneeId }: WorkflowAssigneeId,
    projectIds: TProjectIds,
    currentProjectId: TProjectId,
  ) {
    const workflowRuntimeData = await this.workflowRuntimeDataRepository.findById(
      workflowRuntimeId,
      {},
      projectIds,
    );
    const workflowCompleted =
      workflowRuntimeData.status === 'completed' || workflowRuntimeData.state === 'failed';

    if (workflowCompleted) {
      throw new BadRequestException(
        `Workflow ${workflowRuntimeId} is already completed or failed, cannot assign to user`,
      );
    }

    const updatedWorkflowRuntimeData = await this.workflowRuntimeDataRepository.updateById(
      workflowRuntimeId,
      { data: { assigneeId, assignedAt: new Date(), projectId: currentProjectId } },
    );

    if (
      updatedWorkflowRuntimeData.salesforceObjectName &&
      updatedWorkflowRuntimeData.salesforceRecordId
    ) {
      let agentName = '';

      if (assigneeId) {
        const user = await this.userService.getById(assigneeId, {}, projectIds);
        agentName = `${user.firstName} ${user.lastName}`;
      }

      await this.updateSalesforceRecord({
        workflowRuntimeData: updatedWorkflowRuntimeData,
        data: {
          KYB_Assigned_Agent__c: agentName,
        },
      });
    }

    return updatedWorkflowRuntimeData;
  }

  private async getCorrelationIdFromWorkflow(
    runtimeData: WorkflowRuntimeData,
    projectIds: TProjectIds,
  ) {
    let correlationId: string;

    if (runtimeData.businessId) {
      correlationId = (await this.businessRepository.getCorrelationIdById(
        runtimeData.businessId,
        projectIds,
      )) as string;
    } else if (runtimeData.endUserId) {
      correlationId = (await this.endUserRepository.getCorrelationIdById(
        runtimeData.endUserId,
        projectIds,
      )) as string;
    } else {
      correlationId = '';
      console.error('No entity Id found');
      // throw new Error('No entity Id found');
    }

    return correlationId;
  }

  async deleteWorkflowDefinitionById(
    id: string,
    args: Parameters<WorkflowDefinitionRepository['deleteById']>[1],
    projectIds: TProjectIds,
  ) {
    return await this.workflowDefinitionRepository.deleteById(id, args, projectIds);
  }

  omitTypeFromDocumentsPages(documents: DefaultContextSchema['documents']) {
    return documents?.map(document => ({
      ...document,
      pages: document?.pages?.map(({ type: _type, ...page }) => page),
    }));
  }

  async createOrUpdateWorkflowRuntime(
    {
      workflowDefinitionId,
      context,
      config,
      parentWorkflowId,
      projectIds,
      currentProjectId,
      ...salesforceData
    }: {
      workflowDefinitionId: string;
      context: DefaultContextSchema;
      config?: WorkflowConfig;
      parentWorkflowId?: string;
      projectIds: TProjectIds;
      currentProjectId: TProjectId;
      // eslint-disable-next-line @typescript-eslint/ban-types
    } & ({ salesforceObjectName: string; salesforceRecordId: string } | {}),
    transaction?: PrismaTransaction,
  ) {
    const beginTransactionIfNotExist = beginTransactionIfNotExistCurry({
      transaction,
      prismaService: this.prismaService,
      options: defaultPrismaTransactionOptions,
    });

    return await beginTransactionIfNotExist(async transaction => {
      const workflowDefinition = await this.workflowDefinitionRepository.findById(
        workflowDefinitionId,
        {},
        projectIds,
      );

      config = merge(workflowDefinition.config, config);
      let validatedConfig: WorkflowConfig;
      const result = ConfigSchema.safeParse(config);

      if (!result.success) {
        this.logger.error('Invalid workflow config', {
          config,
          error: result.error,
        });

        throw ValidationError.fromZodError(result.error);
      }

      const customer = await this.customerService.getByProjectId(projectIds![0]!);
      // @ts-ignore
      context.customerName = customer.displayName;
      this.__validateWorkflowDefinitionContext(workflowDefinition, context);
      const entityId = await this.__findOrPersistEntityInformation(
        context,
        projectIds,
        currentProjectId,
      );
      const entityType = context.entity.type === 'business' ? 'business' : 'endUser';
      const existingWorkflowRuntimeData =
        await this.workflowRuntimeDataRepository.findActiveWorkflowByEntityAndLock(
          {
            entityId,
            entityType,
            workflowDefinitionId: workflowDefinition.id,
          },
          projectIds,
          transaction,
        );

      let contextToInsert = structuredClone(context);

      // @ts-ignore
      contextToInsert.entity.ballerineEntityId ||= entityId;

      const entityConnect = {
        [`${entityType}Id`]: entityId,
      };

      let workflowRuntimeData: WorkflowRuntimeData, newWorkflowCreated: boolean;

      const mergedConfig: WorkflowConfig = merge(
        workflowDefinition.config,
        validatedConfig || {},
      ) as InputJsonValue;

      const entities: Array<{
        id: string;
        type: 'individual' | 'business';
        tags?: Array<'mainRepresentative' | 'UBO'>;
      }> = [];

      // Creating new workflow
      if (
        !existingWorkflowRuntimeData ||
        (existingWorkflowRuntimeData && mergedConfig?.allowMultipleActiveWorkflows)
      ) {
        const contextWithoutDocumentPageType = {
          ...contextToInsert,
          documents: this.omitTypeFromDocumentsPages(contextToInsert.documents),
        };

        const documentsWithPersistedImages = await this.copyDocumentsPagesFilesAndCreate(
          contextWithoutDocumentPageType?.documents,
          entityId,
          currentProjectId,
          customer.name,
        );
        let uiDefinition;

        try {
          uiDefinition = await this.uiDefinitionService.getByWorkflowDefinitionId(
            workflowDefinitionId,
            UiDefinitionContext.collection_flow,
            projectIds,
          );
        } catch (err) {
          if (isErrorWithMessage(err)) {
            this.logger.warn(err.message);
          }
        }

        workflowRuntimeData = await this.workflowRuntimeDataRepository.create(
          {
            data: {
              ...entityConnect,
              workflowDefinitionVersion: workflowDefinition.version,
              context: {
                ...contextToInsert,
                documents: documentsWithPersistedImages,
                metadata: {
                  customerId: customer.id,
                  customerNormalizedName: customer.name,
                  customerName: customer.displayName,
                },
              } as InputJsonValue,
              config: mergedConfig as InputJsonValue,
              // @ts-expect-error - error from Prisma types fix
              state: workflowDefinition.definition.initial as string,
              status: 'active',
              workflowDefinitionId: workflowDefinition.id,
              ...(parentWorkflowId &&
                ({
                  parentRuntimeDataId: parentWorkflowId,
                } satisfies Omit<
                  Prisma.WorkflowRuntimeDataCreateArgs['data'],
                  'context' | 'workflowDefinitionVersion'
                >)),
              ...('salesforceObjectName' in salesforceData && salesforceData),
              projectId: currentProjectId,
            },
          },
          transaction,
        );

        logDocumentWithoutId({
          line: 'createOrUpdateWorkflow 1476',
          logger: this.logger,
          workflowRuntimeData,
        });

        let endUserId: string | null = null;
        const entityData =
          workflowRuntimeData.context.entity?.data?.additionalInfo?.mainRepresentative;

        if (mergedConfig.createCollectionFlowToken) {
          if (entityType === 'endUser') {
            endUserId = entityId;
            entities.push({ type: 'individual', id: entityId });
          } else if (entityData) {
            endUserId = await this.__generateEndUserWithBusiness({
              entityType,
              workflowRuntimeData,
              entityData: entityData,
              currentProjectId,
              entityId,
              position: BusinessPosition.representative,
            });

            entities.push({
              type: 'individual',
              id: endUserId,
            });

            entities.push({ type: 'business', id: entityId });

            if (entityData) {
              workflowRuntimeData.context.entity.data.additionalInfo.mainRepresentative.ballerineEntityId =
                endUserId;
            }
          }

          const nowPlus30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          let workflowToken;
          try {
            workflowToken = await this.workflowTokenService.create(
              currentProjectId,
              {
                workflowRuntimeDataId: workflowRuntimeData.id,
                endUserId: endUserId ?? null,
                expiresAt: nowPlus30Days,
              },
              transaction,
            );
          } catch (error) {
            this.logger.error('Failed to create workflow token', {
              error,
              workflowRuntimeDataId: workflowRuntimeData.id,
              endUserId,
            });
            this.sentry.captureException(error as Error);
          }

          const collectionFlow = buildCollectionFlowState({
            apiUrl: env.APP_API_URL,
            steps: uiDefinition?.definition
              ? getOrderedSteps(
                  (uiDefinition?.definition as Prisma.JsonObject)?.definition as Record<
                    string,
                    Record<string, unknown>
                  >,
                  { finalStates: [...WORKFLOW_FINAL_STATES] },
                ).map(stepName => ({
                  stateName: stepName,
                }))
              : [],
            additionalInformation: {
              customerCompany: customer.displayName,
            },
          });

          workflowRuntimeData = await this.workflowRuntimeDataRepository.updateStateById(
            workflowRuntimeData.id,
            {
              data: {
                context: {
                  ...workflowRuntimeData.context,
                  collectionFlow,
                  metadata: {
                    ...(workflowRuntimeData.context.metadata ?? {}),
                    token: workflowToken?.token,
                    collectionFlowUrl: env.COLLECTION_FLOW_URL,
                    webUiSDKUrl: env.WEB_UI_SDK_URL,
                    endUserId,
                  },
                } as InputJsonValue,
                projectId: currentProjectId,
              },
            },
            transaction,
          );
        }

        if (mergedConfig?.initialEvent) {
          workflowRuntimeData = await this.event(
            {
              id: workflowRuntimeData.id,
              name: mergedConfig?.initialEvent,
            },
            projectIds,
            currentProjectId,
            transaction,
          );
        }

        if ('salesforceObjectName' in salesforceData && salesforceData.salesforceObjectName) {
          await this.updateSalesforceRecord({
            workflowRuntimeData,
            data: {
              KYB_Started_At__c: workflowRuntimeData.createdAt,
              KYB_Status__c: 'In Progress',
              KYB_Assigned_Agent__c: '',
            },
          });
        }

        newWorkflowCreated = true;
      } else {
        // Updating existing workflow
        this.logger.log('existing documents', existingWorkflowRuntimeData.context.documents);
        this.logger.log('documents', contextToInsert.documents);

        contextToInsert.documents = assignIdToDocuments(contextToInsert.documents);

        const documentsWithPersistedImages = await this.copyDocumentsPagesFilesAndCreate(
          contextToInsert?.documents,
          entityId,
          currentProjectId,
          customer.name,
        );

        contextToInsert = {
          ...contextToInsert,
          documents: documentsWithPersistedImages as DefaultContextSchema['documents'],
        };

        workflowRuntimeData = await this.workflowRuntimeDataRepository.updateStateById(
          existingWorkflowRuntimeData.id,
          {
            data: {
              ...entityConnect,
              context: contextToInsert as InputJsonValue,
              config: merge(
                existingWorkflowRuntimeData.config,
                validatedConfig || {},
              ) as InputJsonValue,
              projectId: currentProjectId,
            },
          },
          transaction,
        );

        logDocumentWithoutId({
          line: 'createOrUpdateWorkflow 1584',
          logger: this.logger,
          workflowRuntimeData,
        });

        newWorkflowCreated = false;
      }

      this.logger.log(existingWorkflowRuntimeData ? 'Workflow updated' : 'Workflow created', {
        workflowRuntimeDataId: workflowRuntimeData.id,
        entityId,
        entityType,
        newWorkflowCreated,
      });

      return [
        {
          workflowDefinition,
          workflowRuntimeData,
          ballerineEntityId: entityId,
          entities,
        },
      ] as const;
    });
  }

  private async __generateEndUserWithBusiness({
    entityData,
    workflowRuntimeData,
    currentProjectId,
    entityType,
    entityId,
    position,
  }: {
    entityType: string;
    workflowRuntimeData: WorkflowRuntimeData;
    entityData: { firstName: string; lastName: string };
    currentProjectId: string;
    entityId: string;
    position?: BusinessPosition;
  }) {
    if (entityType !== 'business') {
      throw new BadRequestException(`Invalid entity type: ${entityType}. Expected 'business'.`);
    }

    try {
      const result = await this.endUserService.createWithBusiness(
        {
          endUser: {
            ...entityData,
            isContactPerson: true,
          },
          business: {
            companyName: '',
            ...workflowRuntimeData.context.entity.data,
            projectId: currentProjectId,
          },
          position,
        },
        currentProjectId,
        entityId,
      );

      return result.id;
    } catch (error) {
      this.logger.error('Failed to create end user with business', {
        error,
        entityType,
        entityId,
        currentProjectId,
      });
      throw new Error('Failed to create end user with business. Please try again later.');
    }
  }

  private async __persistDocumentPagesFiles(
    document: TDocumentWithoutPageType,
    entityId: string,
    projectId: TProjectId,
    customerName: string,
  ) {
    return await Promise.all(
      document?.pages?.map(async documentPage => {
        if (documentPage.ballerineFileId) {
          return documentPage;
        }

        const documentId = document.id! || getDocumentId(document, false);

        const persistedFile = await this.fileService.copyToDestinationAndCreate(
          {
            id: documentId,
            // @ts-ignore
            uri: documentPage.uri,
            // @ts-ignore
            provider: documentPage.provider,
            // TODO: Solve once DefaultContextSchema is typed by Typebox
            fileName: (
              documentPage as typeof documentPage & {
                fileName: string;
              }
            ).fileName,
          },
          entityId,
          projectId,
          customerName,
        );

        const ballerineFileId = documentPage.ballerineFileId || persistedFile?.id;
        const mimeType =
          persistedFile?.mimeType ||
          mime.getType(persistedFile.fileName || persistedFile.uri || '') ||
          undefined;

        return {
          ...documentPage,
          type: mimeType,
          ballerineFileId,
          fileName: persistedFile?.fileName,
        };
      }),
    );
  }

  private async __findOrPersistEntityInformation(
    context: DefaultContextSchema,
    projectIds: TProjectIds,
    currentProjectId: TProjectId,
  ) {
    const { entity } = context;
    const entityId = await this.__tryToFetchExistingEntityId(entity, projectIds);

    if (entityId) {
      return entityId;
    }

    if (!entity.data) {
      throw new BadRequestException('Entity data is required');
    }

    if (entity.type === 'individual') {
      return await this.__persistEndUserInfo(entity, context, currentProjectId);
    } else {
      return await this.__persistBusinessInformation(entity, context, projectIds, currentProjectId);
    }
  }

  private async __persistEndUserInfo(
    entity: { [p: string]: unknown },
    context: DefaultContextSchema,
    projectId: TProjectId,
  ) {
    const data = context.entity.data as Record<PropertyKey, unknown>;

    const correlationId =
      typeof entity.id === 'string' && entity.id.length > 0 ? entity.id : undefined;

    const { id } = await this.endUserService.create({
      data: {
        correlationId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth ? dayjs(data.dateOfBirth as string).toDate() : undefined,
        nationalId: data.nationalId,
        additionalInfo: data.additionalInfo,
        project: { connect: { id: projectId } },
      } as Prisma.EndUserCreateInput,
    });

    return id;
  }

  private async __persistBusinessInformation(
    entity: { [p: string]: unknown },
    context: DefaultContextSchema,
    projectIds: TProjectIds,
    currentProjectId: TProjectId,
  ) {
    const correlationId =
      typeof entity.id === 'string' && entity.id.length > 0 ? entity.id : undefined;
    const getBusinessWebsite = (data: Record<string, any>) => {
      if (!data?.additionalInfo) {
        return;
      }

      if ('store' in data.additionalInfo && data.additionalInfo.store?.website?.mainWebsite) {
        return data?.additionalInfo?.store?.website?.mainWebsite;
      }

      if ('companyWebsite' in data.additionalInfo && data.additionalInfo.companyWebsite) {
        return data?.additionalInfo?.companyWebsite;
      }

      return;
    };
    const businessWebsite = getBusinessWebsite(context.entity.data ?? {});
    const { id } = await this.businessService.create({
      data: {
        correlationId,
        ...(context.entity.data as object),
        ...(businessWebsite && { website: businessWebsite }),
        project: { connect: { id: currentProjectId } },
      } as Prisma.BusinessCreateInput,
    });

    return id;
  }

  private async __tryToFetchExistingEntityId(
    entity: {
      [p: string]: unknown;
    },
    projectIds: TProjectIds,
  ): Promise<TEntityId | null> {
    if (entity.ballerineEntityId) {
      return entity.ballerineEntityId as TEntityId;
    } else if ('data' in entity && isObject(entity.data) && entity.data.ballerineEntityId) {
      return entity.data.ballerineEntityId as TEntityId;
    } else if (!entity.id) {
      return null;
    } else {
      if (entity.type === 'business') {
        const res = await this.businessRepository.findByCorrelationId(
          entity.id as TEntityId,
          projectIds,
        );

        return res && res.id;
      } else {
        const res = await this.endUserRepository.findByCorrelationId(
          entity.id as TEntityId,
          {},
          projectIds,
        );

        return res && res.id;
      }
    }
  }

  private __validateWorkflowDefinitionContext(
    workflowDefinition: WorkflowDefinition,
    context: DefaultContextSchema,
  ) {
    if (!Object.keys(workflowDefinition?.contextSchema ?? {}).length) {
      return;
    }

    // @ts-expect-error - error from Prisma types fix
    const validate = ajv.compile(workflowDefinition?.contextSchema?.schema); // TODO: fix type
    const isValid = validate({
      ...context,
      // Validation should not include the documents' 'propertiesSchema' prop.
      documents: (context?.documents || []).map(
        ({
          // @ts-ignore
          propertiesSchema: _propertiesSchema,
          ...document
        }) => document,
      ),
    });

    if (isValid) {
      return;
    }

    this.sentry.captureException(new Error('Workflow definition context validation failed'));
    this.logger.error('Workflow definition context validation failed', {
      errors: validate.errors,
      errorData: validate.errors?.map(error => ({
        path: error.instancePath,
        value: get(context, error.instancePath.split('/').filter(Boolean)),
      })),
      workflowDefinitionId: workflowDefinition.id,
    });
  }

  async event(
    { name: type, id, payload }: Static<typeof WorkflowEventInputSchema> & IObjectWithId,
    projectIds: TProjectIds,
    currentProjectId: TProjectId,
    transaction?: PrismaTransaction,
  ) {
    const beginTransactionIfNotExist = beginTransactionIfNotExistCurry({
      transaction,
      prismaService: this.prismaService,
      options: defaultPrismaTransactionOptions,
    });

    return await beginTransactionIfNotExist(async transaction => {
      this.logger.log('Workflow event received', { id, type });

      const workflowRuntimeData = await this.workflowRuntimeDataRepository.findByIdAndLock(
        id,
        {},
        projectIds,
        transaction,
      );

      const workflowDefinition = await this.workflowDefinitionRepository.findById(
        workflowRuntimeData.workflowDefinitionId,
        {},
        projectIds,
        transaction,
      );

      const customer = await this.customerService.getByProjectId(projectIds![0]!, {
        select: {
          id: true,
          name: true,
          displayName: true,
          logoImageUri: true,
          faviconImageUri: true,
          country: true,
          language: true,
          websiteUrl: true,
          projects: true,
          subscriptions: true,
          config: true,
          authenticationConfiguration: true,
        },
      });

      const secretsManager = this.secretsManagerFactory.create({
        provider: env.SECRETS_MANAGER_PROVIDER,
        customerId: customer.id,
      });

      const service = createWorkflow({
        runtimeId: workflowRuntimeData.id,
        // @ts-expect-error - error from Prisma types fix
        definition: workflowDefinition.definition,
        // @ts-expect-error - error from Prisma types fix
        definitionType: workflowDefinition.definitionType,
        config: workflowRuntimeData.config,
        workflowContext: {
          machineContext: workflowRuntimeData.context,
          state: workflowRuntimeData.state,
        },
        extensions: workflowDefinition.extensions,
        helpers: {
          getEndUserById: async (endUserId: string) => {
            return await this.endUserService.getById(endUserId, {}, projectIds);
          },
        },
        invokeRiskRulesAction: async (
          context: object,
          ruleStoreServiceOptions: TFindAllRulesOptions,
          helpers: TWorkflowHelpers,
        ) => {
          const rules = await this.riskRuleService.findAll(ruleStoreServiceOptions);

          return Promise.all(
            rules.map(async rule => {
              try {
                return {
                  result: await this.ruleEngineService.run(rule.ruleSet, context, helpers),
                  ...rule,
                } as const;
              } catch (ex) {
                return {
                  ...rule,
                  result: {
                    status: 'FAILED',
                    message: isErrorWithMessage(ex) ? ex.message : undefined,
                    error: ex,
                  },
                } as const;
              }
            }),
          );
        },
        invokeChildWorkflowAction: async (childPluginConfiguration: ChildPluginCallbackOutput) => {
          const runnableChildWorkflow = await this.persistChildEvent(
            childPluginConfiguration,
            projectIds,
            currentProjectId,
            transaction,
          );

          if (!runnableChildWorkflow || !childPluginConfiguration.initOptions.event) {
            this.logger.log('Child workflow not runnable', {
              childWorkflowId: runnableChildWorkflow?.workflowRuntimeData.id,
            });

            return;
          }

          await this.event(
            {
              id: runnableChildWorkflow.workflowRuntimeData.id,
              name: childPluginConfiguration.initOptions.event,
            },
            projectIds,
            currentProjectId,
            transaction,
          );
        },
        secretsManager: { getAll: this.getCustomerSecrets(secretsManager, customer) },
        invokeWorkflowTokenAction: async (workflowTokenAction: TWorkflowTokenPluginCallback) => {
          const workflowRuntimeId = workflowTokenAction.workflowRuntimeId;
          const defaultDaysExpiry = 30;

          const expiresAt = workflowTokenAction.expiresInMinutes
            ? new Date(Date.now() + workflowTokenAction.expiresInMinutes * 60 * 1000)
            : new Date(Date.now() + defaultDaysExpiry * 24 * 60 * 60 * 1000);

          const customer = await this.customerService.getByProjectId(currentProjectId);

          const representativeEndUserId =
            await this.workflowRuntimeDataRepository.findMainBusinessWorkflowRepresentative(
              {
                workflowRuntimeId: workflowRuntimeId,
                transaction: transaction,
              },
              [currentProjectId],
            );

          const uiDefinition = await this.uiDefinitionService.findByArgs(
            {
              where: {
                OR: [
                  {
                    id: workflowTokenAction.uiDefinitionId,
                  },
                  {
                    projectId: currentProjectId,
                    name: workflowTokenAction.uiDefinitionId,
                  },
                ],
              },
            },
            [currentProjectId],
          );

          if (!uiDefinition.id) {
            throw new InternalServerErrorException({
              descriptionOrOptions:
                "Couldn't find uiDefinitionId for token action, Make sure you set the plugin Properly",
            });
          }

          const { token } = await this.workflowTokenService.create(
            currentProjectId,
            {
              workflowRuntimeDataId: workflowRuntimeId,
              expiresAt,
              endUserId: representativeEndUserId,
            },
            transaction,
          );

          const collectionFlow = buildCollectionFlowState({
            apiUrl: env.APP_API_URL,
            steps: uiDefinition?.definition
              ? getOrderedSteps(
                  (uiDefinition?.definition as Prisma.JsonObject)?.definition as Record<
                    string,
                    Record<string, unknown>
                  >,
                  { finalStates: [...WORKFLOW_FINAL_STATES] },
                ).map(stepName => ({
                  stateName: stepName,
                }))
              : [],
            additionalInformation: {
              customerCompany: customer.displayName,
            },
          });

          await this.workflowRuntimeDataRepository.updateById(
            workflowRuntimeId,
            {
              data: {
                uiDefinitionId: uiDefinition.id,
              },
            },
            transaction,
          );

          return {
            collectionFlow,
            metadata: {
              token: token,
              customerName: customer.displayName,
              customerNormalizedName: customer.name,
              collectionFlowUrl: env.COLLECTION_FLOW_URL ?? '',
            },
          };
        },
      });

      service.subscribe('ENTITIES_UPDATE', async ({ payload }) => {
        if (
          !payload?.ubos ||
          !payload?.directors ||
          !Array.isArray(payload.ubos) ||
          !Array.isArray(payload.directors)
        ) {
          return;
        }

        const typedPayload = payload as {
          ubos: Array<Partial<EndUser>>;
          directors: Array<Partial<EndUser>>;
        };

        await entitiesUpdate({
          endUserService: this.endUserService,
          projectId: currentProjectId,
          businessId: workflowRuntimeData.businessId,
          sendEvent: e => service.sendEvent(e),
          payload: typedPayload,
        });
      });

      service.subscribe('PERSIST_WEBSITE', async ({ payload = {} }) => {
        if (!payload.website) {
          return;
        }

        const typedPayload = payload as {
          website: string;
        };

        await this.businessService.updateById(
          workflowRuntimeData.context.entity.ballerineEntityId,
          {
            data: {
              website: typedPayload.website,
            },
          },
        );
      });

      if (!service.getSnapshot().nextEvents.includes(type)) {
        throw new BadRequestException(
          `Event ${type} does not exist for workflow ${workflowDefinition.id}'s state: ${workflowRuntimeData.state}`,
        );
      }

      // Send the event to the workflow
      await service.sendEvent({
        type,
        ...(payload ? { payload } : {}),
      });

      try {
        const logs = (service as any).getLogs?.();

        if (logs && Array.isArray(logs) && logs.length > 0) {
          await this.workflowLogService.processWorkflowRunnerLogs(
            workflowRuntimeData.id,
            currentProjectId,
            logs as WorkflowRunnerLogEntry[],
            transaction,
          );
          (service as any).clearLogs?.();
        }
      } catch (error) {
        this.logger.error('Failed to process workflow logs', { error });
      }

      // Get the snapshot after sending the event
      const snapshot = service.getSnapshot();
      const currentState = snapshot.value;
      const context = snapshot.machine?.context;

      // Checking if event type is candidate for "revision" state
      const nextCollectionFlowState = COLLECTION_FLOW_EVENTS_WHITELIST.includes(type)
        ? type
        : // Using current state of workflow for approved, rejected, failed
        COLLECTION_FLOW_EVENTS_WHITELIST.includes(currentState)
        ? currentState
        : undefined;

      this.logger.log('Next collection flow state', {
        nextCollectionFlowState: nextCollectionFlowState || 'N/A',
      });

      if (nextCollectionFlowState) {
        if (currentState in CollectionFlowStatusesEnum) {
          setCollectionFlowStatus(context, currentState);
        }
      }

      // TODO: Refactor to use snapshot.done instead
      // @ts-ignore
      const isFinal = snapshot.machine?.states[currentState].type === 'final';
      const entityType = aliasIndividualAsEndUser(context?.entity?.type);
      const entityId = workflowRuntimeData[`${entityType}Id`];

      this.logger.log('Workflow state transition', {
        id: id,
        from: workflowRuntimeData.state,
        to: currentState,
      });

      const updatedRuntimeData = await this.updateWorkflowRuntimeData(
        workflowRuntimeData.id,
        {
          context,
          // @ts-ignore
          state: currentState,
          tags: Array.from(snapshot.tags) as unknown as WorkflowDefinitionUpdateInput['tags'],
          status: isFinal ? 'completed' : workflowRuntimeData.status,
        },
        currentProjectId,
        transaction,
      );

      if (workflowRuntimeData.parentRuntimeDataId) {
        await this.persistChildWorkflowToParent(
          workflowRuntimeData,
          workflowDefinition,
          isFinal,
          projectIds,
          currentProjectId,
          transaction,
          // @ts-ignore
          currentState,
        );
      }

      if (currentState !== workflowRuntimeData.state) {
        this.workflowEventEmitter.emit('workflow.state.changed', {
          //@ts-expect-error
          entityId,
          state: updatedRuntimeData.state,
          correlationId: updatedRuntimeData.context.ballerineEntityId,
          runtimeData: updatedRuntimeData,
        });
      }

      if (!isFinal || (currentState !== 'approved' && currentState !== 'rejected')) {
        return updatedRuntimeData;
      }

      const approvalState = ApprovalState[currentState.toUpperCase() as keyof typeof ApprovalState];

      if (!entityType) {
        throw new BadRequestException(`entity.type is required`);
      }

      if (!entityId) {
        throw new BadRequestException(`entity.${entityType}Id is required`);
      }

      if (entityType === 'endUser') {
        await this.entityRepository[entityType].updateById(
          entityId,
          {
            data: {
              approvalState,
            },
          },
          transaction,
        );
      }

      if (entityType === 'business') {
        await this.entityRepository[entityType].updateById(
          entityId,
          {
            data: {
              approvalState,
            },
          },
          transaction,
        );
      }

      return updatedRuntimeData;
    });
  }

  private getCustomerSecrets(
    secretsManager: AwsSecretsManager | InMemorySecretsManager,
    { authenticationConfiguration }: Customer,
  ) {
    return async () => {
      const secrets = await secretsManager.getAll();
      const webhookSharedSecret = authenticationConfiguration?.webhookSharedSecret;

      return {
        ...(webhookSharedSecret ? { webhookSharedSecret } : {}),
        ...secrets,
      } as Record<string, string>;
    };
  }

  async persistChildWorkflowToParent(
    workflowRuntimeData: WorkflowRuntimeData,
    workflowDefinition: WorkflowDefinition,
    isFinal: boolean,
    projectIds: TProjectIds,
    currentProjectId: TProjectId,
    transaction: PrismaTransaction,
    childRuntimeState?: string,
  ) {
    let parentWorkflowRuntime = await this.workflowRuntimeDataRepository.findByIdAndLock(
      // @ts-expect-error - error from Prisma types fix
      workflowRuntimeData.parentRuntimeDataId,
      { include: { childWorkflowsRuntimeData: true } },
      projectIds,
      transaction,
    );

    const parentWorkflowDefinition = await this.getWorkflowDefinitionById(
      parentWorkflowRuntime.workflowDefinitionId,
      {},
      projectIds,
    );

    const callbackTransformations = (
      parentWorkflowDefinition?.config
        ?.childCallbackResults as ChildToParentCallback['childCallbackResults']
    )
      // @ts-ignore - fix as childCallbackResults[number]
      ?.filter(childCallbackResult => workflowDefinition.id === childCallbackResult.definitionId)
      ?.map(async callbackTransformation => {
        const childWorkflowCallback = (callbackTransformation ||
          workflowDefinition.config.callbackResult!) as ChildWorkflowCallback;

        const childrenOfSameDefinition = // @ts-ignore - error from Prisma types fix
          (parentWorkflowRuntime.childWorkflowsRuntimeData as WorkflowRuntimeData[])?.filter(
            childWorkflow =>
              childWorkflow.workflowDefinitionId === workflowRuntimeData.workflowDefinitionId,
          );

        const isPersistableState =
          !!(
            childRuntimeState &&
            childWorkflowCallback.persistenceStates &&
            childWorkflowCallback.persistenceStates.includes(childRuntimeState)
          ) || isFinal;

        if (!isPersistableState) {
          return;
        }

        const parentContext = await this.generateParentContextWithInjectedChildContext(
          childrenOfSameDefinition,
          childWorkflowCallback.transformers,
          parentWorkflowRuntime,
          workflowDefinition,
        );

        parentWorkflowRuntime = await this.event(
          {
            id: parentWorkflowRuntime.id,
            name: BUILT_IN_EVENT.DEEP_MERGE_CONTEXT,
            payload: {
              newContext: parentContext,
              arrayMergeOption: ARRAY_MERGE_OPTION.BY_ID,
            },
          },
          projectIds,
          currentProjectId,
          transaction,
        );

        if (
          childWorkflowCallback.deliverEvent &&
          parentWorkflowRuntime.status !== WorkflowRuntimeDataStatus.completed &&
          childRuntimeState &&
          childWorkflowCallback.persistenceStates?.includes(childRuntimeState)
        ) {
          try {
            await this.event(
              {
                id: parentWorkflowRuntime.id,
                name: childWorkflowCallback.deliverEvent,
              },
              projectIds,
              currentProjectId,
              transaction,
            );
          } catch (ex) {
            console.warn(
              'Error while delivering event to parent workflow',
              isErrorWithMessage(ex) && ex.message,
            );
          }
        }
      });

    if (!callbackTransformations?.length) {
      return;
    }

    await Promise.all(callbackTransformations);
  }

  private async generateParentContextWithInjectedChildContext(
    childrenOfSameDefinition: WorkflowRuntimeData[],
    transformers: ChildWorkflowCallback['transformers'],
    parentWorkflowRuntime: WorkflowRuntimeData,
    workflowDefinition: WorkflowDefinition,
  ) {
    const transformerInstance = (transformers || []).map((transformer: SerializableTransformer) =>
      this.initiateTransformer(transformer),
    );

    const contextToPersist: Record<string, any> = {};

    for (const childWorkflow of childrenOfSameDefinition) {
      let childContextToPersist = childWorkflow.context;

      for (const transformer of transformerInstance || []) {
        childContextToPersist = await transformer.transform({
          ...childContextToPersist,
          projectId: parentWorkflowRuntime.projectId,
        });
      }

      contextToPersist[childWorkflow.id] = {
        entityId: childWorkflow.context.entity.id,
        status: childWorkflow.status,
        tags: childWorkflow.tags,
        state: childWorkflow.state,
        result: childContextToPersist,
      };
    }

    const parentContext = this.composeContextWithChildResponse(
      parentWorkflowRuntime.context,
      workflowDefinition.id,
      contextToPersist,
    );

    return parentContext;
  }

  private initiateTransformer(transformer: SerializableTransformer): Transformer {
    if (transformer.transformer === 'jmespath') {
      return new JmespathTransformer(transformer.mapping as string);
    }

    if (transformer.transformer === 'helper') {
      return new HelpersTransformer(transformer.mapping as THelperFormatingLogic);
    }

    throw new Error(`No transformer found for ${transformer.transformer}`);
  }

  private composeContextWithChildResponse(
    parentWorkflowContext: any,
    definitionId: string,
    contextToPersist?: any,
  ) {
    parentWorkflowContext['childWorkflows'] ||= {};
    parentWorkflowContext['childWorkflows'][definitionId] ||= {};

    parentWorkflowContext['childWorkflows'][definitionId] = contextToPersist;

    return parentWorkflowContext;
  }

  async getWorkflowRuntimeDataContext(id: string, projectIds: TProjectIds) {
    return this.workflowRuntimeDataRepository.findContext(id, projectIds);
  }

  async copyDocumentsPagesFilesAndCreate(
    documents: TDocumentsWithoutPageType,
    entityId: string,
    projectId: TProjectId,
    customerName: string,
  ) {
    if (!documents?.length) {
      return documents;
    }

    const documentsWithPersistedImages = await Promise.all(
      documents?.map(async document => {
        return {
          ...document,
          pages: await this.__persistDocumentPagesFiles(
            document,
            entityId,
            projectId,
            customerName,
          ),
        };
      }),
    );

    return documentsWithPersistedImages;
  }

  async updateSalesforceRecord({
    workflowRuntimeData,
    data,
  }: {
    workflowRuntimeData: WorkflowRuntimeData;
    data: {
      KYB_Started_At__c?: Date;
      KYB_Status__c?: 'Not Started' | 'In Progress' | 'Approved' | 'Rejected';
      KYB_Assigned_Agent__c?: string;
    };
  }) {
    return await this.salesforceService.updateRecord({
      projectId: workflowRuntimeData.projectId,
      // @ts-expect-error - error from Prisma types fix
      objectName: workflowRuntimeData.salesforceObjectName,
      // @ts-expect-error - error from Prisma types fix
      recordId: workflowRuntimeData.salesforceRecordId,
      data,
    });
  }

  async emitSystemWorkflowEvent({
    workflowRuntimeId,
    projectId,
    systemEventName,
  }: {
    workflowRuntimeId: string;
    projectId: string;
    systemEventName: 'workflow.context.changed'; // currently supports only this event
  }) {
    const runtimeData = (await this.workflowRuntimeDataRepository.findById(
      workflowRuntimeId,
      { include: { assignee: true } },
      [projectId],
    )) as WorkflowRuntimeData & { assignee: User | null };
    const correlationId = await this.getCorrelationIdFromWorkflow(runtimeData, [projectId]);

    this.workflowEventEmitter.emit(
      systemEventName,
      {
        assignee: runtimeData.assignee,
        assignedAt: runtimeData.assignedAt,
        oldRuntimeData: runtimeData,
        updatedRuntimeData: runtimeData,
        state: runtimeData.state as string,
        entityId: (runtimeData.businessId || runtimeData.endUserId) as string,
        correlationId: correlationId,
      },
      {
        forceEmit: true,
      },
    );
  }

  async updateById(workflowRuntimeDataId: string, args: Prisma.WorkflowRuntimeDataUpdateInput) {
    return await this.workflowRuntimeDataRepository.updateById(workflowRuntimeDataId, {
      data: args,
    });
  }

  async findDocumentById({
    workflowId,
    projectId,
    documentId,
    transaction,
  }: {
    workflowId: string;
    projectId: string;
    documentId: string;
    transaction: PrismaTransaction | PrismaClient;
  }) {
    const runtimeData = await this.workflowRuntimeDataRepository.findByIdAndLock(
      workflowId,
      {},
      [projectId],
      transaction,
    );
    const workflowDef = await this.workflowDefinitionRepository.findById(
      runtimeData.workflowDefinitionId,
      {},
      [projectId],
      transaction,
    );
    const document = runtimeData?.context?.documents?.find(
      (document: DefaultContextSchema['documents'][number]) => document.id === documentId,
    );

    return addPropertiesSchemaToDocument(document, workflowDef.documentsSchema);
  }

  async runOCROnDocument({
    workflowRuntimeId,
    projectId,
    documentId,
  }: {
    workflowRuntimeId: string;
    projectId: string;
    documentId: string;
  }) {
    return await this.prismaService.$transaction(
      async transaction => {
        const customer = await this.customerService.getByProjectId(projectId);

        if (!customer.features?.[FEATURE_LIST.DOCUMENT_OCR]) {
          throw new BadRequestException(
            `Document OCR is not enabled for customer id ${customer.id}`,
          );
        }

        const document = await this.findDocumentById({
          workflowId: workflowRuntimeId,
          projectId,
          documentId,
          transaction,
        });

        if (!('pages' in document)) {
          throw new BadRequestException('Cannot run document OCR on document without pages');
        }

        const documentFetchPagesContentPromise = document.pages.map(async page => {
          const ballerineFileId = page.ballerineFileId;

          if (!ballerineFileId) {
            throw new BadRequestException('Cannot run document OCR on document without pages');
          }

          const { signedUrl, mimeType, filePath } = await this.storageService.fetchFileContent({
            id: ballerineFileId,
            format: 'signed-url',
            projectIds: [projectId],
          });

          if (signedUrl) {
            return {
              remote: {
                imageUri: signedUrl,
                mimeType,
              },
            };
          }

          const base64String = this.storageService.fileToBase64(filePath!);

          return { base64: `data:${mimeType};base64,${base64String}` };
        });

        const images = (await Promise.all(documentFetchPagesContentPromise)) satisfies TOcrImages;

        return (
          await new UnifiedApiClient().runOcr({
            images,
            schema: document.propertiesSchema as unknown as TSchema,
          })
        )?.data;
      },
      {
        timeout: 180_000,
      },
    );
  }

  async updateContextAndSyncEntity({
    workflowRuntimeDataId,
    context,
    projectId,
  }: {
    workflowRuntimeDataId: string;
    context: PartialDeep<DefaultContextSchema>;
    projectId: string;
  }) {
    await this.prismaService.$transaction(async transaction => {
      await this.event(
        {
          id: workflowRuntimeDataId,
          name: BUILT_IN_EVENT.DEEP_MERGE_CONTEXT,
          payload: {
            newContext: context,
            arrayMergeOption: ARRAY_MERGE_OPTION.REPLACE,
          },
        },
        [projectId],
        projectId,
        transaction,
      );

      const workflowRuntimeData = await this.workflowRuntimeDataRepository.findById(
        workflowRuntimeDataId,
        {},
        [projectId],
        transaction,
      );

      const endUserContextToEntityAdapter = ({
        firstName,
        lastName,
        dateOfBirth,
        country,
        phone,
        email,
        additionalInfo,
        ...rest
      }: Static<typeof IndividualDataSchema>) =>
        ({
          firstName,
          lastName,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          country,
          phone,
          email,
          additionalInfo: {
            ...rest,
            ...additionalInfo,
          },
        } satisfies Parameters<typeof this.entityRepository.endUser.updateById>[1]['data']);

      const businessContextToEntityAdapter = (data: Static<typeof BusinessDataSchema>) =>
        ({
          companyName: data.companyName,
        } satisfies Parameters<typeof this.businessService.updateById>[1]['data']);

      if (workflowRuntimeData.businessId && context.entity?.data) {
        await this.businessService.updateById(workflowRuntimeData.businessId, {
          data: businessContextToEntityAdapter(
            context.entity.data as Static<typeof BusinessDataSchema>,
          ),
        });
      }

      if (workflowRuntimeData.endUserId && context.entity?.data) {
        await this.entityRepository.endUser.updateById(workflowRuntimeData.endUserId, {
          data: endUserContextToEntityAdapter(context.entity.data),
        });
      }
    });
  }
}
