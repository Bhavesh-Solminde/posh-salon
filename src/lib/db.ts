import { PrismaClient } from "@prisma/client";

// Reuse one PrismaClient across hot reloads in dev to avoid exhausting connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Neon autosuspends its compute and drops idle sockets, so a query can land on a
// connection the server has already closed (P1001 / P1017). Prisma surfaces that
// as a hard error, which renders as a 500. One retry lets the pool redial while
// the compute wakes — that path costs ~2s, versus a broken page.
const TRANSIENT = new Set(["P1001", "P1002", "P1017"]);

function withRetry(client: PrismaClient) {
  return client.$extends({
    query: {
      async $allOperations({ args, query }) {
        try {
          return await query(args);
        } catch (e) {
          const code = (e as { code?: string })?.code;
          if (!code || !TRANSIENT.has(code)) throw e;
          await new Promise((r) => setTimeout(r, 400));
          return query(args);
        }
      },
    },
  }) as unknown as PrismaClient;
}

export const prisma =
  globalForPrisma.prisma ??
  withRetry(
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    }),
  );

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Neon is a remote (and autosuspending) database, so every query inside an
// interactive transaction pays a full round-trip and the first one may pay a
// cold-start. Prisma's defaults (2s to acquire, 5s to run) close the
// transaction mid-flight, which then surfaces as "Transaction not found".
export const TX_OPTS = { maxWait: 15_000, timeout: 30_000 } as const;
