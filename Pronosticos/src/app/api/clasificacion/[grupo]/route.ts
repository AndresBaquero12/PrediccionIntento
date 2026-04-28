// =============================================================
// CONTROLADOR: GET /api/clasificacion/[grupo]
// Tabla de posiciones de un grupo específico
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import * as clasificacionService from '@/services/clasificacion.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ grupo: string }> }
) {
  try {
    const { grupo } = await params;
    const resultado = await clasificacionService.calcularClasificacionGrupo(grupo);
    return NextResponse.json(resultado);
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : 'Error interno del servidor';
    const status = mensaje.includes('no existe') ? 404 : 500;
    return NextResponse.json({ error: mensaje }, { status });
  }
}
