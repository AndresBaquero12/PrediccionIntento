// =============================================================
// MODELO: Partido — CRUD puro con Prisma
// Capa 2: Acceso a datos (no contiene lógica de negocio)
// =============================================================

import prisma from '@/lib/prisma';

// Includes comunes para consultas de partidos
const includesPartido = {
  equipoLocal: { include: { grupo: true } },
  equipoVisitante: { include: { grupo: true } },
  grupo: true,
};

/** Obtener partidos por grupo (letra) */
export async function obtenerPorGrupo(letra: string) {
  return prisma.partido.findMany({
    where: { grupo: { letra } },
    include: includesPartido,
    orderBy: { fechaInicio: 'asc' },
  });
}

/** Obtener partidos por fase ('grupos' o 'eliminatoria') */
export async function obtenerPorFase(fase: string) {
  return prisma.partido.findMany({
    where: { fase },
    include: includesPartido,
    orderBy: { fechaInicio: 'asc' },
  });
}

/** Obtener un partido por ID con todas las relaciones */
export async function obtenerPorId(id: number) {
  return prisma.partido.findUnique({
    where: { id },
    include: {
      ...includesPartido,
      pronosticos: true,
      resultadoAdmin: true,
    },
  });
}

/** Actualizar el resultado real de un partido */
export async function actualizarResultado(
  id: number,
  golesLocal: number,
  golesVisitante: number,
  estado: string
) {
  return prisma.partido.update({
    where: { id },
    data: {
      golesLocalReal: golesLocal,
      golesVisitanteReal: golesVisitante,
      estado,
    },
  });
}

/** Obtener partidos pendientes (no finalizados) */
export async function obtenerPendientes() {
  return prisma.partido.findMany({
    where: { estado: { not: 'finalizado' } },
    include: includesPartido,
    orderBy: { fechaInicio: 'asc' },
  });
}

/** Obtener todos los partidos */
export async function obtenerTodos() {
  return prisma.partido.findMany({
    include: includesPartido,
    orderBy: { fechaInicio: 'asc' },
  });
}
