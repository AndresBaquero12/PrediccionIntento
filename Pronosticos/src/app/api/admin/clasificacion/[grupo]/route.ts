// =============================================================
// CONTROLADOR: PUT /api/admin/clasificacion/[grupo]
// Override manual del orden de clasificación por el admin
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/middleware/auth.middleware';
import * as clasificacionService from '@/services/clasificacion.service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ grupo: string }> }
) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { grupo } = await params;
    const body = await request.json();
    const { orden } = body;

    if (!orden || !Array.isArray(orden)) {
      return NextResponse.json(
        { error: 'Campo requerido: orden (array de IDs de equipos)' },
        { status: 400 }
      );
    }

    const resultado = await clasificacionService.guardarOrdenManual(grupo, orden);
    return NextResponse.json(resultado);
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : 'Error interno del servidor';
    const status = mensaje.includes('no existe') ? 404 : 500;
    return NextResponse.json({ error: mensaje }, { status });
  }
}
