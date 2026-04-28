// =============================================================
// CONTROLADOR: POST /api/admin/llaves/generar-r32
// Dispara la asignación automática de los 32 clasificados
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/middleware/auth.middleware';
import * as bracketService from '@/services/bracket.service';

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const resultado = await bracketService.generarLlavesR32();
    return NextResponse.json(resultado);
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : 'Error interno del servidor';
    const status = mensaje.includes('finalizar') || mensaje.includes('configuración') ? 400 : 500;
    return NextResponse.json({ error: mensaje }, { status });
  }
}
