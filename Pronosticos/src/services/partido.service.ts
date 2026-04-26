// =============================================================
// SERVICIO: Partido — Listar partidos por grupo/fase
// Capa 3: Lógica de negocio (no conoce HTTP)
// RF: GRP-RF03, USR-RF04
// =============================================================

import * as partidoModel from '@/models/partido.model';

/** Listar partidos de un grupo específico (GRP-RF03) */
export async function listarPartidosPorGrupo(letra: string) {
  return partidoModel.obtenerPorGrupo(letra);
}

/** Listar partidos por fase */
export async function listarPartidosPorFase(fase: string) {
  return partidoModel.obtenerPorFase(fase);
}

/** Listar partidos próximos/pendientes (USR-RF04) */
export async function listarPartidosPendientes() {
  return partidoModel.obtenerPendientes();
}

/** Listar todos los partidos */
export async function listarTodos() {
  return partidoModel.obtenerTodos();
}
