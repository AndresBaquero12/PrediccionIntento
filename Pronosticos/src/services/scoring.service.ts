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
 * ADICIONAL: Permite corrección de resultados ya guardados recalculando todo.
 */
export async function finalizarPartido(
  idPartido: number,
  golesLocal: number,
  golesVisitante: number,
  adminId: number
) {
  // Verificar que el partido existe
  const partido = await prisma.partido.findUnique({
    where: { id: idPartido },
    include: { grupo: true }
  });

  if (!partido) {
    throw new Error('El partido no existe.');
  }

  // Si ya estaba finalizado, borramos las puntuaciones previas para recalcular
  if (partido.estado === 'finalizado') {
    await prisma.puntuacion.deleteMany({
      where: { idPartido }
    });
  }

  // CALC-RF01: Registrar o actualizar resultado administrativo
  await prisma.resultadoAdmin.upsert({
    where: { idPartido },
    create: {
      idPartido,
      golesLocal,
      golesVisitante,
      ingresadoPor: adminId,
    },
    update: {
      golesLocal,
      golesVisitante,
      ingresadoPor: adminId,
      timestamp: new Date(),
    },
  });

  // Actualizar partido con resultado real
  await prisma.partido.update({
    where: { id: idPartido },
    data: {
      golesLocalReal: golesLocal,
      golesVisitanteReal: golesVisitante,
      estado: 'finalizado'
    },
  });

  // Obtener todos los pronósticos de este partido
  const pronosticos = await prisma.pronostico.findMany({
    where: { idPartido }
  });

  // CALC-RF02 a RF05: Calcular puntos para cada pronóstico
  let puntosCalculados = 0;
  for (const pronostico of pronosticos) {
    const { puntos, detalle } = calcularPuntos(
      golesLocal,
      golesVisitante,
      pronostico.golesLocalPredicho,
      pronostico.golesVisitantePredicho
    );

    // Guardar puntuación
    await prisma.puntuacion.create({
      data: {
        idUsuario: pronostico.idUsuario,
        idPartido,
        puntos,
        detalle,
      },
    });

    puntosCalculados++;
  }

  // DISPARAR ACTUALIZACIÓN DEL BRACKET
  // Importamos dinámicamente para evitar circulares si las hubiera
  const { actualizarBracketAutomatico } = await import('./bracket.service');
  await actualizarBracketAutomatico();

  return {
    mensaje: `Resultado ${partido.estado === 'finalizado' ? 'corregido' : 'registrado'}. Puntos recalculados para ${puntosCalculados} pronósticos. Bracket actualizado.`,
    puntosCalculados,
    resultado: { golesLocal, golesVisitante },
  };
}
