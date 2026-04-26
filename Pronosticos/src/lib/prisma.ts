// =============================================================
// LIB: Singleton de Prisma Client (Prisma v7 + SQLite)
// Usa @prisma/adapter-better-sqlite3 como driver adapter
// Evita múltiples instancias durante hot reload de Next.js
// =============================================================

import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// Ruta al archivo SQLite relativa a la raíz del proyecto
const dbUrl = `file:${process.cwd()}/dev.db`;

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({ url: dbUrl });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
