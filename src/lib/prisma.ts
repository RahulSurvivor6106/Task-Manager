import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

type DelegatePath = string[];

const globalForPrisma = globalThis as unknown as {
  prismaClient?: PrismaClient;
};

let prismaInitError: Error | null = null;

function createPrismaClient() {
  if (globalForPrisma.prismaClient) {
    return globalForPrisma.prismaClient;
  }

  if (prismaInitError) {
    throw prismaInitError;
  }

  const dbUrl = process.env.DATABASE_URL ?? "";
  if (!dbUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  try {
    const pool = new Pool({ connectionString: dbUrl });
    const adapter = new PrismaPg(pool);
    const client = new PrismaClient({ adapter, log: ["warn", "error"] });

    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prismaClient = client;
    }

    return client;
  } catch (error) {
    prismaInitError = error instanceof Error ? error : new Error(String(error));
    throw prismaInitError;
  }
}

function getTarget(path: DelegatePath) {
  const client = createPrismaClient();
  return path.reduce<Record<string, unknown>>((target, key) => target[key] as Record<string, unknown>, client as never);
}

function createDelegateProxy(path: DelegatePath = []): unknown {
  const callable = function callableProxy() {
    throw new Error("Prisma delegate proxy cannot be called directly");
  };

  return new Proxy(callable, {
    get(_target, property) {
      if (property === "then") {
        return undefined;
      }

      if (typeof property !== "string") {
        return undefined;
      }

      if (path.length === 0 && property.startsWith("$")) {
        return (...args: unknown[]) => {
          const client = createPrismaClient() as unknown as Record<string, unknown>;
          const method = client[property];
          if (typeof method !== "function") {
            throw new Error(`Prisma client method ${property} is not available`);
          }
          return (method as (...methodArgs: unknown[]) => unknown)(...args);
        };
      }

      return createDelegateProxy([...path, property]);
    },
    apply(_target, _thisArg, args) {
      if (path.length === 0) {
        throw new Error("Prisma proxy must be accessed through a model delegate or method");
      }

      const methodName = path[path.length - 1];
      const delegate = getTarget(path.slice(0, -1));
      const method = delegate[methodName];

      if (typeof method !== "function") {
        throw new Error(`Prisma delegate method ${path.join(".")} is not available`);
      }

      return method.apply(delegate, args);
    },
  });
}

export const prisma = createDelegateProxy() as PrismaClient;
