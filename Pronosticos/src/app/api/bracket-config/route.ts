// =============================================================
// CONTROLADOR: GET /api/bracket-config — Cruces configurables
// =============================================================

import { NextResponse } from 'next/server';
import * as llaveModel from '@/models/llave.model';

export async function GET() {
  try {
    const config = await llaveModel.obtenerBracketConfig();
    return NextResponse.json(config);
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : 'Error interno del servidor';
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}
