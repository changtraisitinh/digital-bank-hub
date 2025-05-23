import { IAppLogger, LogPayload } from '@/common/abstract-logger/abstract-logger';
import { env } from '@/env';
import { createLogger, format, Logger as TWinstonLogger, transports } from 'winston';

export class WinstonLogger implements IAppLogger {
  private logger: TWinstonLogger;

  constructor() {
    const isLocal = process.env.ENVIRONMENT_NAME === 'local';

    const jsonFormat = format.combine(format.timestamp(), format.json(), format.uncolorize());

    const prettyFormat = format.combine(
      format.errors({ stack: true }),
      format.colorize({ all: true }),
      format.timestamp(),
      format.splat(),
      format.printf(({ timestamp, level, message, ...metadata }) => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        let msg = `${timestamp} [${level}] : ${message} `;

        if (Object.keys(metadata).length > 0) {
          msg += JSON.stringify(metadata, null, 2);
        }

        return msg;
      }),
    );

    this.logger = createLogger({
      format: isLocal ? prettyFormat : jsonFormat,
      transports: [new transports.Console()],
      level: env.LOG_LEVEL,
    });
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.logger.end(() => {
          this.logger.transports.forEach(transport => {
            if (transport instanceof transports.File) {
              transport.close?.(); // Optional chaining to invoke 'close' method
            }
          });

          resolve();
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  log(message: string, payload: LogPayload = {}) {
    this.logger.info(message, payload);
  }

  info(message: string, payload: LogPayload = {}) {
    this.logger.info(message, payload);
  }

  error(error: Error | string, payload: LogPayload = {}) {
    if (typeof error === 'string') {
      this.logger.error({ message: error, ...payload });
    } else {
      const errorProperties: Record<string, unknown> = {};
      Object.getOwnPropertyNames(error).forEach(key => {
        errorProperties[key] = error[key as keyof Error];
      });

      const errorObj = {
        ...errorProperties,
        message: error.message,
        name: error.name,
        stack: error.stack,
      };

      this.logger.error({ error: errorObj, ...payload });
    }
  }

  warn(message: string, payload: LogPayload = {}) {
    this.logger.warn(message, payload);
  }

  debug(message: string, payload: LogPayload = {}) {
    this.logger.debug(message, payload);
  }
}
