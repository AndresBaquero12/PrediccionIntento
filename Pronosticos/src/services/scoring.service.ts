// =============================================================
// SERVICIO: Scoring — Finalizar partido y calcular puntos
// Capa 3: Lógica de negocio (no conoce HTTP)
// RF: CALC-RF01, CALC-RF02, CALC-RF03, CALC-RF04, CALC-RF05
// =============================================================

import prisma from '@/lib/prisma';
import * as partidoModel from '@/models/partido.model';
import * as pronosticoModel from '@/models/pronostico.model';
import * as resultadoAdminModel from '@/models/resultadoAdmin.model';

/**
 * Determina el resultado: 'L' (local gana), 'V' (visitante gana), 'E' (empate)
 */
function obtenerResultado(golesLocal: number, golesVisitante: number): 'L' | 'V' | 'E' {
  if (golesLocal > golesVisitante) return 'L';
  if (golesLocal < golesVisitante) return 'V';
  return 'E';
}

/**
 * Calcula los puntos de un pronóstico vs resultado real
 * CALC-RF02: 0 puntos si falla
 * CALC-RF03: +1 si acierta resultado (G/E/P) pero no marcador
 * CALC-RF04: +2 si acierta marcador exacto (incluye resultado)
 * Máximo por partido: +2
 */
function calcularPuntos(
  golesLocalReal: number,
  golesVisitanteReal: number,
  golesLocalPred: number,
  golesVisitantePred: number
): { puntos: number; detalle: string } {
  const resultadoReal = obtenerResultado(golesLocalReal, golesVisitanteReal);
  const resultadoPred = obtenerResultado(golesLocalPred, golesVisitantePred);

  const aciertoExacto =
    golesLocalReal === golesLocalPred && golesVisitanteReal === golesVisitantePred;

  // CALC-RF04: +2 por marcador exacto (ya implica resultado correcto)
  if (aciertoExacto) {
    return { puntos: 2, detalle: 'exacto' };
  }

  // CALC-RF03: +1 por acertar solo el resultado (G/E/P)
  if (resultadoReal === resultadoPred) {
    return { puntos: 1, detalle: 'resultado' };
  }

  // CALC-RF02: 0 si falla todo
  return { puntos: 0, detalle: 'fallido' };
}

/**
 * Finalizar un partido: registrar resultado real y calcular puntos de todos los pronósticos
 * CALC-RF01: Registro administrativo
 * CALC-RF05: Cálculo automático tras ingreso de resultado
 */
export async function finalizarPartido(
  idPartido: number,
  golesLocal: number,
  golesVisitante: number,
  adminId: number
) {
  // Verificar que el partido existe
  const partido = await partidoModel.obtenerPorId(idPartido);
  if (!partido) {
    throw new Error('El partido no existe.');
  }

  // Verificar que no esté ya finalizado
  if (partido.estado === 'finalizado') {
    throw new Error('Este partido ya fue finalizado.');
  }

  // CALC-RF01: Registrar resultado administrativo
  await resultadoAdminModel.registrar(idPartido, golesLocal, golesVisitante, adminId);

  // Actualizar partido con resultado real
  await partidoModel.actualizarResultado(idPartido, golesLocal, golesVisitante, 'finalizado');

  // Obtener todos los pronósticos de este partido
  const pronosticos = await pronosticoModel.obtenerPorPartido(idPartido);

  // CALC-RF02 a RF05: Calcular puntos para cada pronóstico
  let puntosCalculados = 0;
  for (const pronostico of pronosticos) {
    const { puntos, detalle } = calcularPuntos(
      golesLocal,
      golesVisitante,
      pronostico.golesLocalPredicho,
      pronostico.golesVisitantePredicho
    );

    // Guardar puntuación en tabla separada
    await prisma.puntuacion.upsert({
      where: {
        idUsuario_idPartido: {
          idUsuario: pronostico.idUsuario,
          idPartido,
        },
      },
      create: {
        idUsuario: pronostico.idUsuario,
        idPartido,
        puntos,
        detalle,
      },
      update: {
        puntos,
        detalle,
      },
    });

    puntosCalculados++;
  }

  return {
    mensaje: `Partido finalizado. Puntos calculados para ${puntosCalculados} pronósticos.`,
    puntosCalculados,
    resultado: { golesLocal, golesVisitante },
  };
}
