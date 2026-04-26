// =============================================================
// MODELO: Pronostico — CRUD puro con Prisma
// Capa 2: Acceso a datos (no contiene lógica de negocio)
// =============================================================

import prisma from '@/lib/prisma';

/** Crear o actualizar pronóstico (upsert por usuario+partido) */
export async function crearOActualizar(
  idUsuario: number,
  idPartido: number,
  golesLocal: number,
  golesVisitante: number
) {
  return prisma.pronostico.upsert({
    where: {
      idUsuario_idPartido: { idUsuario, idPartido },
    },
    create: {
      idUsuario,
      idPartido,
      golesLocalPredicho: golesLocal,
      golesVisitantePredicho: golesVisitante,
    },
    update: {
      golesLocalPredicho: golesLocal,
      golesVisitantePredicho: golesVisitante,
    },
  });
}

/** Obtener pronósticos de un usuario con datos del partido */
export async function obtenerPorUsuario(idUsuario: number) {
  return prisma.pronostico.findMany({
    where: { idUsuario },
    include: {
      partido: {
        include: {
          equipoLocal: true,
          equipoVisitante: true,
          grupo: true,
        },
      },
    },
    orderBy: { partido: { fechaInicio: 'asc' } },
  });
}

/** Obtener todos los pronósticos de un partido */
export async function obtenerPorPartido(idPartido: number) {
  return prisma.pronostico.findMany({
    where: { idPartido },
    include: { usuario: { select: { id: true, nombreUsuario: true } } },
  });
}
