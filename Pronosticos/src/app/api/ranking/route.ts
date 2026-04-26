// =============================================================
// CONTROLADOR: GET /api/ranking — Ranking de usuarios
// Capa 4: Controlador REST (solo HTTP, delega al servicio)
// =============================================================

import { NextResponse } from 'next/server';
import * as rankingService from '@/services/ranking.service';

export async function GET() {
  try {
    const ranking = await rankingService.obtenerRankingUsuarios();
    return NextResponse.json(ranking);
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : 'Error interno del servidor';
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}
