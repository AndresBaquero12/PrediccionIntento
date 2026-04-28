// =============================================================
// CONTROLADOR: GET /api/clasificados — 32 clasificados a R32
// Solo responde cuando todos los partidos de grupos finalizaron
// =============================================================

import { NextResponse } from 'next/server';
import * as clasificacionService from '@/services/clasificacion.service';

export async function GET() {
  try {
    const resultado = await clasificacionService.obtenerClasificadosR32();
    return NextResponse.json(resultado);
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : 'Error interno del servidor';
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}
