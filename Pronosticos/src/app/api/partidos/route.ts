// =============================================================
// CONTROLADOR: GET /api/partidos — Listar partidos
// Capa 4: Controlador REST (solo HTTP, delega al servicio)
// RF: GRP-RF03, USR-RF04
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import * as partidoService from '@/services/partido.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const grupo = searchParams.get('grupo');
    const fase = searchParams.get('fase');

    let partidos;
    if (grupo) {
      partidos = await partidoService.listarPartidosPorGrupo(grupo.toUpperCase());
    } else if (fase) {
      partidos = await partidoService.listarPartidosPorFase(fase);
    } else {
      partidos = await partidoService.listarTodos();
    }

    return NextResponse.json(partidos);
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : 'Error interno del servidor';
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}
