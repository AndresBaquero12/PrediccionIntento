// =============================================================
// CONTROLADOR: /api/pronosticos — Enviar y listar pronósticos
// Capa 4: Controlador REST (solo HTTP, delega al servicio)
// RF: PRED-RF01, PRED-RF02, PRED-RF03, PRED-RF04, PRED-RF05
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/middleware/auth.middleware';
import * as pronosticoService from '@/services/pronostico.service';

/** POST /api/pronosticos — Enviar o actualizar un pronóstico */
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

    const pronostico = await pronosticoService.enviarPronostico(
      auth.userId,
      idPartido,
      golesLocal,
      golesVisitante
    );

    return NextResponse.json(pronostico, { status: 201 });
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : 'Error interno del servidor';
    const status = mensaje.includes('no existe') || mensaje.includes('No se puede')
      ? 400
      : 500;
    return NextResponse.json({ error: mensaje }, { status });
  }
}

/** GET /api/pronosticos — Listar pronósticos del usuario logueado */
export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const pronosticos = await pronosticoService.obtenerPronosticosUsuario(auth.userId);
    return NextResponse.json(pronosticos);
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : 'Error interno del servidor';
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}
