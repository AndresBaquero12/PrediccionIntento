// =============================================================
// SERVICIO: Pronostico — Enviar, validar, listar pronósticos
// Capa 3: Lógica de negocio (no conoce HTTP)
// RF: PRED-RF01, PRED-RF02, PRED-RF03, PRED-RF04, PRED-RF05
// =============================================================

import * as pronosticoModel from '@/models/pronostico.model';
import * as partidoModel from '@/models/partido.model';

/** Enviar o actualizar un pronóstico (PRED-RF01 a PRED-RF05) */
export async function enviarPronostico(
  idUsuario: number,
  idPartido: number,
  golesLocal: number,
  golesVisitante: number
) {
  // PRED-RF01: Verificar que el partido exista
  const partido = await partidoModel.obtenerPorId(idPartido);
  if (!partido) {
    throw new Error('El partido no existe.');
  }

  // PRED-RF05: Verificar que el partido NO ha comenzado
  if (partido.fechaInicio && new Date(partido.fechaInicio) <= new Date()) {
    throw new Error('No se puede pronosticar: el partido ya comenzó o está finalizado.');
  }

  // Verificar que el partido no esté finalizado
  if (partido.estado === 'finalizado') {
    throw new Error('No se puede pronosticar: el partido ya finalizó.');
  }

  // Validar goles no negativos
  if (golesLocal < 0 || golesVisitante < 0) {
    throw new Error('Los goles no pueden ser negativos.');
  }

  // PRED-RF02, RF03, RF04: Crear o actualizar pronóstico
  return pronosticoModel.crearOActualizar(idUsuario, idPartido, golesLocal, golesVisitante);
}

/** Obtener pronósticos de un usuario con datos del partido */
export async function obtenerPronosticosUsuario(idUsuario: number) {
  return pronosticoModel.obtenerPorUsuario(idUsuario);
}
