import { PrismaClient } from '@prisma/client';

const POOL_LIMIT = '5';
const POOL_TIMEOUT = '20';

function withPgBouncerPoolLimits(url: string): string {
  let next = url;
  if (!/[?&]connection_limit=/.test(next)) {
    next += `${next.includes('?') ? '&' : '?'}connection_limit=${POOL_LIMIT}`;
  }
  if (!/[?&]pool_timeout=/.test(next)) {
    next += `${next.includes('?') ? '&' : '?'}pool_timeout=${POOL_TIMEOUT}`;
  }
  return next;
}

const prismaClientSingleton = () => {
  const url = process.env.DATABASE_URL;
  return new PrismaClient(
    url
      ? { datasources: { db: { url: withPgBouncerPoolLimits(url) } } }
      : undefined
  );
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

/** Bump when Prisma schema/client fields change while `next dev` is running. */
const PRISMA_CLIENT_GEN = 3;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
  prismaPg: PrismaClientSingleton | undefined;
  prismaGen?: number;
};

if (
  globalForPrisma.prismaGen !== PRISMA_CLIENT_GEN ||
  (globalForPrisma.prisma && globalForPrisma.prisma !== globalForPrisma.prismaPg)
) {
  void globalForPrisma.prismaPg?.$disconnect();
  void globalForPrisma.prisma?.$disconnect();
  globalForPrisma.prismaPg = undefined;
  globalForPrisma.prisma = undefined;
}

const prisma = globalForPrisma.prismaPg ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaPg = prisma;
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaGen = PRISMA_CLIENT_GEN;
}
