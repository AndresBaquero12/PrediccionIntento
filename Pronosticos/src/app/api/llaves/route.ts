// =============================================================
// CONTROLADOR: GET /api/llaves — Bracket completo por rondas
// =============================================================

import { NextResponse } from 'next/server';
import * as bracketService from '@/services/bracket.service';

export async function GET() {
  try {
    const bracket = await bracketService.obtenerBracketCompleto();
    return NextResponse.json(bracket);
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : 'Error interno del servidor';
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}
