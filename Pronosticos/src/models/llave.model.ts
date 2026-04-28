// =============================================================
// MODELO: Llave — CRUD puro con Prisma
// Capa 2: Acceso a datos (no contiene lógica de negocio)
// =============================================================

import prisma from '@/lib/prisma';

/** Obtener todas las llaves con equipos, organizadas por ronda */
export async function obtenerTodas() {
  return prisma.llaveEliminatoria.findMany({
    include: {
      equipo1: true,
      equipo2: true,
      partido: {
        include: {
          equipoLocal: true,
          equipoVisitante: true,
        },
      },
    },
    orderBy: [{ ronda: 'asc' }, { posicion: 'asc' }],
  });
}

/** Obtener llaves de una ronda específica */
export async function obtenerPorRonda(ronda: string) {
  return prisma.llaveEliminatoria.findMany({
    where: { ronda },
    include: {
      equipo1: true,
      equipo2: true,
      partido: true,
    },
    orderBy: { posicion: 'asc' },
  });
}

/** Crear una llave */
export async function crear(data: {
  ronda: string;
  posicion: number;
  idEquipo1?: number;
  idEquipo2?: number;
  idPartido?: number;
}) {
  return prisma.llaveEliminatoria.create({ data });
}

/** Actualizar equipos de una llave */
export async function actualizarEquipos(
  id: number,
  idEquipo1?: number | null,
  idEquipo2?: number | null
) {
  return prisma.llaveEliminatoria.update({
    where: { id },
    data: {
      idEquipo1: idEquipo1 ?? undefined,
      idEquipo2: idEquipo2 ?? undefined,
    },
  });
}

/** Obtener una llave por ID con equipos */
export async function obtenerPorId(id: number) {
  return prisma.llaveEliminatoria.findUnique({
    where: { id },
    include: { equipo1: true, equipo2: true, partido: true },
  });
}

// ─── BracketConfig ───────────────────────────────────────────

/** Obtener todos los cruces configurados */
export async function obtenerBracketConfig() {
  return prisma.bracketConfig.findMany({
    orderBy: { posicionR32: 'asc' },
  });
}

/** Actualizar un cruce por ID */
export async function actualizarBracketConfig(
  id: number,
  data: { slot1?: string; slot2?: string; descripcion?: string }
) {
  return prisma.bracketConfig.update({
    where: { id },
    data,
  });
}
