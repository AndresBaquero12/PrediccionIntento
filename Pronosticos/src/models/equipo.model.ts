// =============================================================
// MODELO: Equipo — CRUD puro con Prisma
// Capa 2: Acceso a datos (no contiene lógica de negocio)
// =============================================================

import prisma from '@/lib/prisma';

/** Crear un equipo */
export async function crearEquipo(
  nombre: string,
  pais: string,
  grupoId: number,
  logo?: string
) {
  return prisma.equipo.create({
    data: { nombre, pais, grupoId, logo },
  });
}

/** Obtener todos los equipos con su grupo */
export async function obtenerTodos() {
  return prisma.equipo.findMany({
    include: { grupo: true },
    orderBy: [{ grupoId: 'asc' }, { nombre: 'asc' }],
  });
}

/** Obtener equipos de un grupo específico por letra */
export async function obtenerPorGrupo(letra: string) {
  return prisma.equipo.findMany({
    where: { grupo: { letra } },
    include: { grupo: true },
    orderBy: { nombre: 'asc' },
  });
}

/** Obtener un equipo por ID */
export async function obtenerPorId(id: number) {
  return prisma.equipo.findUnique({
    where: { id },
    include: { grupo: true },
  });
}
