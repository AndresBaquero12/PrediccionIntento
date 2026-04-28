// =============================================================
// CONTROLADOR: PUT /api/admin/llaves/[id]/equipos
// Override manual: asignar equipos a una llave
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/middleware/auth.middleware';
import * as bracketService from '@/services/bracket.service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const body = await request.json();
    const { idEquipo1, idEquipo2 } = body;

    if (idEquipo1 === undefined && idEquipo2 === undefined) {
      return NextResponse.json(
        { error: 'Debe proporcionar al menos: idEquipo1 o idEquipo2' },
        { status: 400 }
      );
    }

    const resultado = await bracketService.asignarEquiposManual(
      parseInt(id),
      idEquipo1,
      idEquipo2
    );

    return NextResponse.json(resultado);
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : 'Error interno del servidor';
    const status = mensaje.includes('mismo grupo') || mensaje.includes('no existe') ? 400 : 500;
    return NextResponse.json({ error: mensaje }, { status });
  }
}
