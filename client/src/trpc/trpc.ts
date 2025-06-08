import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@rybbit/server/src/types.js";

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();
