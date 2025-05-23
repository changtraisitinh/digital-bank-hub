import { PrismaService } from '@/prisma/prisma.service';
import { PrismaTransaction } from '@/types';
import { Prisma } from '@prisma/client';

export const PRISMA_RECORD_NOT_FOUND_ERROR = 'P2025';
export const PRISMA_FOREIGN_KEY_CONSTRAINT_ERROR = 'P2003';
export const PRISMA_UNIQUE_CONSTRAINT_ERROR = 'P2002';

export const isRecordNotFoundError = (
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError & {
  code: typeof PRISMA_RECORD_NOT_FOUND_ERROR;
} =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === PRISMA_RECORD_NOT_FOUND_ERROR;

export const isFkConstraintError = (
  error: unknown,
  fkName: string,
): error is Prisma.PrismaClientKnownRequestError & {
  code: typeof PRISMA_FOREIGN_KEY_CONSTRAINT_ERROR;
} =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === PRISMA_FOREIGN_KEY_CONSTRAINT_ERROR &&
  (error.meta as { field_name: string }).field_name.includes(fkName);

export const transformStringFieldUpdateInput = async <
  T extends undefined | string | { set?: string },
>(
  input: T,
  transform: (input: string) => Promise<string>,
): Promise<T> => {
  if (typeof input === 'object' && typeof input?.set === 'string') {
    return { set: await transform(input.set) } as T;
  }

  if (typeof input === 'object') {
    if (typeof input.set === 'string') {
      return { set: await transform(input.set) } as T;
    }

    return input;
  }

  if (typeof input === 'string') {
    return (await transform(input)) as T;
  }

  return input;
};

type PrismaTransactionOptions = {
  maxWait?: number;
  timeout?: number;
  isolationLevel?: Prisma.TransactionIsolationLevel;
};
/**
 * If transaction is not provided, a new transaction will be created and used for the callback.
 * This function is a curried function that takes a callback function that will be executed with the transaction.
 * @param transaction
 * @param prismaService
 * @param options
 */
export const beginTransactionIfNotExistCurry = ({
  transaction,
  prismaService,
  options,
}: {
  transaction?: PrismaTransaction;
  prismaService: PrismaService;
  options?: PrismaTransactionOptions;
}) => {
  return <T>(callback: (transaction: PrismaTransaction) => Promise<T>): Promise<T> => {
    return transaction ? callback(transaction) : prismaService.$transaction(callback, options);
  };
};

export const defaultPrismaTransactionOptions: PrismaTransactionOptions = {
  maxWait: 60_000,
  timeout: 60_000,
};

export const isPrismaClientKnownRequestError = (
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError => {
  return (
    error instanceof Error && 'name' in error && error.name === 'PrismaClientKnownRequestError'
  );
};
