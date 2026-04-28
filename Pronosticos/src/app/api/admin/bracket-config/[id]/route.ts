// =============================================================
// CONTROLADOR: PUT /api/admin/bracket-config/[id]
// Editar un cruce configurable del bracket
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/middleware/auth.middleware';
import * as llaveModel from '@/models/llave.model';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const body = await request.json();
    const { slot1, slot2, descripcion } = body;

    if (!slot1 && !slot2 && !descripcion) {
      return NextResponse.json(
        { error: 'Debe proporcionar al menos: slot1, slot2, o descripcion' },
        { status: 400 }
      );
    }

    const updated = await llaveModel.actualizarBracketConfig(parseInt(id), {
      slot1, slot2, descripcion,
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : 'Error interno del servidor';
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}
