import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { EndUserModel } from './end-user.model';
import type { PrismaTransaction, TProjectIds } from '@/types';
import { ProjectScopeService } from '@/project/project-scope.service';

@Injectable()
export class EndUserRepository {
  constructor(
    protected readonly prismaService: PrismaService,
    protected readonly scopeService: ProjectScopeService,
  ) {}

  async create<T extends Prisma.EndUserCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.EndUserCreateArgs>,
    transaction: PrismaClient | PrismaTransaction = this.prismaService,
  ) {
    return await transaction.endUser.create(args);
  }

  async findMany<T extends Prisma.EndUserFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.EndUserFindManyArgs>,
    projectIds: TProjectIds,
  ) {
    return await this.prismaService.endUser.findMany(
      this.scopeService.scopeFindMany(args, projectIds),
    );
  }

  async find<T extends Prisma.EndUserFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.EndUserFindFirstArgs>,
    projectIds: TProjectIds,
  ) {
    return await this.prismaService.endUser.findFirst(
      this.scopeService.scopeFindOne(args, projectIds),
    );
  }

  async findById<T extends Omit<Prisma.EndUserFindFirstOrThrowArgs, 'where'>>(
    id: string,
    args: Prisma.SelectSubset<T, Omit<Prisma.EndUserFindFirstOrThrowArgs, 'where'>>,
    projectIds: TProjectIds,
  ) {
    return await this.prismaService.endUser.findFirstOrThrow(
      this.scopeService.scopeFindFirst(
        {
          where: { id },
          ...args,
        },
        projectIds,
      ),
    );
  }

  async findByIdUnscoped<T extends Omit<Prisma.EndUserFindUniqueArgs, 'where'>>(
    id: string,
    args?: Prisma.SelectSubset<T, Omit<Prisma.EndUserFindUniqueArgs, 'where'>>,
  ) {
    return await this.prismaService.endUser.findFirstOrThrow(
      this.scopeService.scopeFindFirst({
        where: { id },
        // @ts-ignore
        ...args,
      }),
    );
  }

  async findByCorrelationId<T extends Omit<Prisma.EndUserFindFirstArgs, 'where'>>(
    id: string,
    args: Prisma.SelectSubset<T, Omit<Prisma.EndUserFindFirstArgs, 'where'>>,
    projectIds: TProjectIds,
  ) {
    return await this.prismaService.endUser.findFirst({
      where: { correlationId: id, projectId: { in: projectIds } },
      ...args,
    });
  }

  async updateById<T extends Omit<Prisma.EndUserUpdateArgs, 'where'>>(
    id: string,
    args: Prisma.SelectSubset<T, Omit<Prisma.EndUserUpdateArgs, 'where'>>,
    transaction: PrismaClient | PrismaTransaction = this.prismaService,
  ): Promise<EndUserModel> {
    return await transaction.endUser.update({
      where: { id },
      ...args,
    });
  }

  async getCorrelationIdById(id: string, projectIds: TProjectIds): Promise<string | null> {
    const endUser = await this.prismaService.endUser.findFirst(
      this.scopeService.scopeFindFirst(
        {
          where: { id },
          select: { correlationId: true },
        },
        projectIds,
      ),
    );

    return endUser ? endUser.correlationId : null;
  }
}
