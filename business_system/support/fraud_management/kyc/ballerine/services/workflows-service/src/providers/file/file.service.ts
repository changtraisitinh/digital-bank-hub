import { AppLoggerService } from '@/common/app-logger/app-logger.service';
import { getFileMetadata } from '@/common/get-file-metadata/get-file-metadata';
import { streamToBuffer } from '@/common/stream-to-buffer/stream-to-buffer';
import { AwsS3FileConfig } from '@/providers/file/file-provider/aws-s3-file.config';
import { AwsS3FileService } from '@/providers/file/file-provider/aws-s3-file.service';
import { Base64FileService } from '@/providers/file/file-provider/base64-file.service';
import { HttpFileService } from '@/providers/file/file-provider/http-file.service';
import { LocalFileService } from '@/providers/file/file-provider/local-file.service';
import { StorageService } from '@/storage/storage.service';
import type { TProjectId } from '@/types';
import { getDocumentId, isErrorWithMessage, isType } from '@ballerine/common';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import { Base64 } from 'js-base64';
import { Readable } from 'stream';
import * as tmp from 'tmp';
import { z } from 'zod';
import { TFileServiceProvider } from './types';
import { TLocalFilePath, TRemoteFileConfig, TS3BucketConfig } from './types/files-types';
import { IStreamableFileProvider } from './types/interfaces';
import { CustomerService } from '@/customer/customer.service';

@Injectable()
export class FileService {
  constructor(
    private readonly storageService: StorageService,
    protected readonly logger: AppLoggerService,
    protected readonly httpService: HttpService,
    protected readonly customerService: CustomerService,
  ) {}

  async copyFromSourceToDestination(
    sourceServiceProvider: TFileServiceProvider,
    sourceRemoteFileConfig: TRemoteFileConfig,
    targetServiceProvider: TFileServiceProvider,
    targetFileConfig: TRemoteFileConfig,
  ) {
    try {
      const isDeprecated = true;
      const bothServicesSupportStream = this.isBothServicesSupportStream(
        sourceServiceProvider,
        targetServiceProvider,
      );

      if (!isDeprecated && bothServicesSupportStream) {
        const { remoteFileConfig, mimeType } = await this.copyThroughStream(
          sourceServiceProvider as IStreamableFileProvider,
          sourceRemoteFileConfig,
          targetServiceProvider as IStreamableFileProvider,
          targetFileConfig,
        );

        return {
          remoteFilePath: remoteFileConfig,
          fileNameInBucket:
            typeof remoteFileConfig !== 'string' ? remoteFileConfig?.fileNameInBucket : undefined,
          mimeType,
        };
      }

      const filePaths = await this.copyThroughFileSystem(
        sourceServiceProvider,
        sourceRemoteFileConfig,
        targetServiceProvider,
        targetFileConfig,
      );

      return filePaths;
    } catch (error) {
      const remoteFileName =
        typeof sourceRemoteFileConfig !== 'string'
          ? sourceRemoteFileConfig.fileNameInBucket
          : sourceRemoteFileConfig;

      this.logger.log(
        `Unable to download file - ${remoteFileName} - ${
          isErrorWithMessage(error) ? error.message : ''
        }`,
        { error },
      );

      throw new BadRequestException(
        `Unable to download file -  ${remoteFileName}, Please check the validity of the file path and access`,
      );
    }
  }

  /**
   * @deprecated - No direct way of generating a file extension for S3/Cloudfront with stream.
   * @param sourceServiceProvider
   * @param sourceRemoteFileConfig
   * @param targetServiceProvider
   * @param targetFileConfig
   */
  async copyThroughStream(
    sourceServiceProvider: IStreamableFileProvider,
    sourceRemoteFileConfig: TRemoteFileConfig,
    targetServiceProvider: IStreamableFileProvider,
    targetFileConfig: TRemoteFileConfig,
  ) {
    const streamableDownstream = await sourceServiceProvider.fetchRemoteDownStream(
      sourceRemoteFileConfig,
    );
    const buffer = await streamToBuffer(streamableDownstream);
    const stream = Readable.from(buffer);
    const remoteFileConfig = await targetServiceProvider.uploadStream(stream, targetFileConfig);
    const fileType = await getFileMetadata({
      file: buffer,
      fileName:
        typeof sourceRemoteFileConfig === 'string'
          ? sourceRemoteFileConfig
          : sourceRemoteFileConfig.uri,
    });

    return {
      remoteFileConfig,
      mimeType: fileType?.mimeType,
    };
  }

  async copyThroughFileSystem(
    sourceServiceProvider: TFileServiceProvider,
    sourceRemoteFileConfig: TRemoteFileConfig,
    targetServiceProvider: TFileServiceProvider,
    targetFileConfig: TRemoteFileConfig,
  ) {
    const tmpFile = tmp.fileSync();
    const localFilePath = await sourceServiceProvider.download(
      sourceRemoteFileConfig,
      tmpFile.name,
    );
    const { mimeType } = await getFileMetadata({
      file: localFilePath,
      fileName:
        typeof sourceRemoteFileConfig === 'string'
          ? sourceRemoteFileConfig
          : sourceRemoteFileConfig.uri,
    });
    const remoteFilePath = await targetServiceProvider.upload(
      localFilePath,
      targetFileConfig,
      mimeType,
    );

    try {
      await fs.unlink(localFilePath);
    } catch (err) {
      // TODO: should we log non successful deletion ?
    }

    return {
      remoteFilePath,
      mimeType,
    };
  }

  async download(
    sourceServiceProvider: TFileServiceProvider,
    sourceRemoteFileConfig: TRemoteFileConfig,
    targetLocaleFilePath: TLocalFilePath,
  ) {
    return await sourceServiceProvider.download(sourceRemoteFileConfig, targetLocaleFilePath);
  }

  private isBothServicesSupportStream(
    sourceServiceProvider: TFileServiceProvider,
    targetServiceProvider: TFileServiceProvider,
  ) {
    return (
      'fetchRemoteFileDownStream' in sourceServiceProvider &&
      'uploadFileStream' in targetServiceProvider
    );
  }

  private __fetchAwsConfigForFileNameInBucket(fileNameInBucket: string): TS3BucketConfig {
    const bucketName = this.__fetchBucketName(process.env, true) as string;

    return {
      bucketName,
      fileNameInBucket,
      private: true,
    };
  }

  private __fetchBucketName(processEnv: NodeJS.ProcessEnv, isThrowOnMissing = true) {
    const bucketName = AwsS3FileConfig.getBucketName(processEnv);

    if (isThrowOnMissing && !bucketName) {
      throw new Error(`S3 Bucket name is not set`);
    }

    return bucketName;
  }

  /**
   * Returns an object with `sourceServiceProvider` and `fromRemoteFileConfig` based on the `documentPage.provider` and `documentPage.uri`
   * @param documentPage
   * @private
   */
  private __fetchSourceServiceProviders({ uri, provider }: { uri: string; provider: string }): {
    sourceServiceProvider: TFileServiceProvider;
    sourceRemoteFileConfig: TRemoteFileConfig;
  } {
    if (provider == 'http' && z.string().parse(uri)) {
      return {
        sourceServiceProvider: new HttpFileService({
          client: this.httpService,
          logger: this.logger,
        }),
        sourceRemoteFileConfig: uri,
      };
    }

    if (provider == 'aws_s3' && z.string().parse(uri)) {
      const s3ClientConfig = AwsS3FileConfig.fetchClientConfig(process.env);
      const s3BucketConfig = this.__fetchAwsConfigForFileNameInBucket(uri);

      return {
        sourceServiceProvider: new AwsS3FileService(s3ClientConfig, this.logger),
        sourceRemoteFileConfig: s3BucketConfig,
      };
    }

    if (provider == 'base64' && z.string().refine(Base64.isValid).parse(uri)) {
      return {
        sourceServiceProvider: new Base64FileService(),
        sourceRemoteFileConfig: uri as TRemoteFileConfig,
      };
    }

    return {
      sourceServiceProvider: new LocalFileService(),
      sourceRemoteFileConfig: uri,
    };
  }

  /**
   * Returns an object with `targetServiceProvider` and `targetRemoteFileConfig` based on the `document.provider` and `document.uri`
   * @private
   * @param entityId
   * @param fileName
   */
  private __fetchTargetServiceProviders(
    entityId: string,
    customerName: string,
    fileName: string,
  ): {
    targetServiceProvider: TFileServiceProvider;
    targetRemoteFileConfig: TRemoteFileConfig;
    remoteFileNameInDirectory: string;
  } {
    const properties = {
      customerName,
      fileName,
      directory: entityId,
    };

    if (this.__fetchBucketName(process.env, false)) {
      const s3ClientConfig = AwsS3FileConfig.fetchClientConfig(process.env);
      const awsFileService = new AwsS3FileService(s3ClientConfig, this.logger);

      const remoteFileNameInDocument = awsFileService.generateRemotePath(properties);

      const awsConfigForClient = this.__fetchAwsConfigForFileNameInBucket(remoteFileNameInDocument);

      return {
        targetServiceProvider: awsFileService,
        targetRemoteFileConfig: awsConfigForClient,
        remoteFileNameInDirectory: awsConfigForClient.fileNameInBucket,
      };
    }

    const localFileService = new LocalFileService();
    const toFileStoragePath = localFileService.generateRemotePath(properties);

    return {
      targetServiceProvider: localFileService,
      targetRemoteFileConfig: toFileStoragePath,
      remoteFileNameInDirectory: toFileStoragePath,
    };
  }

  async copyToDestinationAndCreate(
    fileDetails: { id: string; uri: string; provider: string; fileName: string },
    entityId: string,
    projectId: TProjectId,
    customerName: string,
    options?: { shouldDownloadFromSource: boolean },
  ) {
    const { shouldDownloadFromSource } = {
      ...{ shouldDownloadFromSource: true },
      ...(options || {}),
    };

    const { sourceServiceProvider, sourceRemoteFileConfig } =
      this.__fetchSourceServiceProviders(fileDetails);

    const remoteFileNamePrefix = fileDetails.id || getDocumentId(fileDetails, false);

    let tmpLocalFilePath;

    if (shouldDownloadFromSource) {
      const tmpFile = tmp.fileSync();

      tmpLocalFilePath = await sourceServiceProvider.download(sourceRemoteFileConfig, tmpFile.name);
    }

    const fileType = await getFileMetadata({
      file: tmpLocalFilePath || fileDetails.uri,
      fileName: fileDetails.fileName || fileDetails.uri || '',
    });
    const remoteFileName = `${remoteFileNamePrefix}_${randomUUID()}${
      fileType?.extension ? `.${fileType?.extension}` : ''
    }`;

    if (tmpLocalFilePath) {
      try {
        await fs.unlink(tmpLocalFilePath);
      } catch (err) {
        // TODO: should we log non successful deletion ?
      }
    }

    const { targetServiceProvider, targetRemoteFileConfig, remoteFileNameInDirectory } =
      this.__fetchTargetServiceProviders(entityId, customerName, remoteFileName);

    const fileInfo = await this.copyFromSourceToDestination(
      sourceServiceProvider,
      sourceRemoteFileConfig,
      targetServiceProvider,
      targetRemoteFileConfig,
    );

    const isFileInfoWithFileNameInBucket = isType(
      z.object({
        remoteFilePath: z.object({
          fileNameInBucket: z.string(),
        }),
      }),
    )(fileInfo);

    const persistedFile = await this.storageService.createFileLink({
      uri: remoteFileNameInDirectory,
      fileNameOnDisk: remoteFileNameInDirectory,
      userId: entityId,
      fileNameInBucket: isFileInfoWithFileNameInBucket
        ? fileInfo?.remoteFilePath?.fileNameInBucket
        : undefined,
      projectId,
      // After copy of file that was created from base64 its losing mimeType
      // Forcing to use mimeType of source file when provider is base64
      mimeType: fileDetails.provider === 'base64' ? fileType.mimeType : fileInfo?.mimeType,
      fileName: fileDetails.fileName,
    });

    return persistedFile;
  }

  async uploadNewFile(projectId: string, entityId: string, file: Express.Multer.File) {
    // upload file into a customer folder
    const customer = await this.customerService.getByProjectId(projectId);

    if (!entityId) {
      throw new NotFoundException("Workflow doesn't exists");
    }

    // Remove file extension (get everything before the last dot)
    const nameWithoutExtension = (file.originalname || randomUUID()).replace(/\.[^.]+$/, '');
    // Remove non characters
    const alphabeticOnlyName = nameWithoutExtension.replace(/\W/g, '');

    return await this.copyToDestinationAndCreate(
      {
        id: alphabeticOnlyName,
        uri: file.path,
        provider: 'file-system',
        fileName: file.originalname,
      },
      entityId,
      projectId,
      customer.name,
      { shouldDownloadFromSource: false },
    );
  }
}
