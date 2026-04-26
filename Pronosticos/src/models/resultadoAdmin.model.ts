// =============================================================
// MODELO: ResultadoAdmin — CRUD puro con Prisma
// Capa 2: Acceso a datos (no contiene lógica de negocio)
// =============================================================

import prisma from '@/lib/prisma';

/** Registrar resultado administrativo de un partido */
export async function registrar(
  idPartido: number,
  golesLocal: number,
  golesVisitante: number,
  ingresadoPor: number
) {
  return prisma.resultadoAdmin.create({
    data: {
      idPartido,
      golesLocal,
      golesVisitante,
      ingresadoPor,
    },
  });
}

/** Obtener resultado admin de un partido */
export async function obtenerPorPartido(idPartido: number) {
  return prisma.resultadoAdmin.findUnique({
    where: { idPartido },
  });
}
