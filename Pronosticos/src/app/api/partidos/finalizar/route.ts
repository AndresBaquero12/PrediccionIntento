// =============================================================
// CONTROLADOR: POST /api/partidos/finalizar — Finalizar partido
// Capa 4: Controlador REST (solo HTTP, delega al servicio)
// RF: CALC-RF01, CALC-RF02, CALC-RF03, CALC-RF04, CALC-RF05
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/middleware/auth.middleware';
import * as scoringService from '@/services/scoring.service';

/** POST /api/partidos/finalizar — Registrar resultado real y calcular puntos */
export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { idPartido, golesLocal, golesVisitante } = body;

    // Validaciones básicas
    if (idPartido == null || golesLocal == null || golesVisitante == null) {
      return NextResponse.json(
        { error: 'Campos requeridos: idPartido, golesLocal, golesVisitante' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(golesLocal) || !Number.isInteger(golesVisitante)) {
      return NextResponse.json(
        { error: 'Los goles deben ser números enteros.' },
        { status: 400 }
      );
    }

    if (golesLocal < 0 || golesVisitante < 0) {
      return NextResponse.json(
        { error: 'Los goles no pueden ser negativos.' },
        { status: 400 }
      );
    }

    const resultado = await scoringService.finalizarPartido(
      idPartido,
      golesLocal,
      golesVisitante,
      auth.userId
    );

    return NextResponse.json(resultado);
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : 'Error interno del servidor';
    const status = mensaje.includes('no existe') || mensaje.includes('ya fue finalizado')
      ? 400
      : 500;
    return NextResponse.json({ error: mensaje }, { status });
  }
}
