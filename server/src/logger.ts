import { default as winston } from 'winston';

type LoggerFunction = (...params: unknown[]) => void;

export interface ILogger {
  error: LoggerFunction;
  warn: LoggerFunction;
  info: LoggerFunction;
  http: LoggerFunction;
  verbose: LoggerFunction;
  debug: LoggerFunction;
  silly: LoggerFunction;
}

export const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === 'production' ? winston.format.json() : winston.format.simple(),
  ),

  transports: [
    new winston.transports.Console({
      silent: process.env.NODE_ENV === 'test',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ level, message, timestamp }) => `${timestamp} [${level}]: ${message}`,
        ),
      ),
    }),

    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
  ],
});
