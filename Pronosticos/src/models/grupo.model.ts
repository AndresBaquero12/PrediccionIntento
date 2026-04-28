// =============================================================
// MODELO: Grupo — CRUD puro con Prisma
// Capa 2: Acceso a datos (no contiene lógica de negocio)
// =============================================================

import prisma from '@/lib/prisma';

/** Obtener todos los grupos con sus equipos */
export async function obtenerTodosConEquipos() {
  return prisma.grupo.findMany({
    include: {
      equipos: {
        orderBy: { nombre: 'asc' },
      },
    },
    orderBy: { letra: 'asc' },
  });
}

/** Obtener un grupo por letra con sus equipos */
export async function obtenerPorLetra(letra: string) {
  return prisma.grupo.findUnique({
    where: { letra },
    include: {
      equipos: {
        orderBy: { nombre: 'asc' },
      },
    },
  });
}

/** Obtener un grupo por ID */
export async function obtenerPorId(id: number) {
  return prisma.grupo.findUnique({
    where: { id },
    include: { equipos: true },
  });
}
