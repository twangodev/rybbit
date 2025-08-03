import type { FastifyBaseLogger } from "fastify";
import { pino } from "pino";

const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";
const hasAxiom = !!(process.env.AXIOM_DATASET && process.env.AXIOM_TOKEN);

export const createLogger = (name: string): FastifyBaseLogger => {
  if (isProduction && hasAxiom) {
    return pino({
      name,
      level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
      transport: {
        target: "@axiomhq/pino",
        options: {
          dataset: process.env.AXIOM_DATASET,
          token: process.env.AXIOM_TOKEN,
        },
      },
    }) as FastifyBaseLogger;
  }

  return pino({
    name,
    level: process.env.LOG_LEVEL || "debug",
    transport: {
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
