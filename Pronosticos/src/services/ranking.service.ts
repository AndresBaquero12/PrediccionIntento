// =============================================================
// SERVICIO: Ranking — Clasificación de usuarios por puntos
// Capa 3: Lógica de negocio (no conoce HTTP)
// =============================================================

import prisma from '@/lib/prisma';

/** Obtener ranking de usuarios ordenado por puntos totales DESC */
export async function obtenerRankingUsuarios() {
  // Agregar puntos por usuario sumando la tabla Puntuacion
  const usuarios = await prisma.usuario.findMany({
    select: {
      id: true,
      nombreUsuario: true,
      puntuaciones: {
        select: {
          puntos: true,
        },
      },
      pronosticos: {
        select: {
          id: true,
        },
      },
    },
  });

  // Calcular total de puntos y cantidad de pronósticos
  const ranking = usuarios.map((usuario) => ({
    id: usuario.id,
    nombreUsuario: usuario.nombreUsuario,
    puntosTotal: usuario.puntuaciones.reduce((sum, p) => sum + p.puntos, 0),
    partidosPronosticados: usuario.pronosticos.length,
  }));

  // Ordenar por puntos descendente, luego por nombre
  ranking.sort((a, b) => {
    if (b.puntosTotal !== a.puntosTotal) return b.puntosTotal - a.puntosTotal;
    return a.nombreUsuario.localeCompare(b.nombreUsuario);
  });

  // Agregar posición
  return ranking.map((item, index) => ({
    posicion: index + 1,
    ...item,
  }));
}
