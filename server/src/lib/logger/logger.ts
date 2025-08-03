import type { FastifyBaseLogger } from "fastify";
import { pino } from "pino";

const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

export const createLogger = (name: string): FastifyBaseLogger => {
  return pino({
    name,
    level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
    transport: isProduction
      ? undefined
      : {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        },
  }) as FastifyBaseLogger;
};

export const logger = createLogger("rybbit");

export const createServiceLogger = (service: string) => {
  return logger.child({ service });
};
