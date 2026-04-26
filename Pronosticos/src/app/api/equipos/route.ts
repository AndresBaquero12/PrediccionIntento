// =============================================================
// CONTROLADOR: GET /api/equipos — Listar equipos
// Capa 4: Controlador REST (solo HTTP, delega al modelo)
// RF: GRP-RF01
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import * as equipoModel from '@/models/equipo.model';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const grupo = searchParams.get('grupo');

    let equipos;
    if (grupo) {
      equipos = await equipoModel.obtenerPorGrupo(grupo.toUpperCase());
    } else {
      equipos = await equipoModel.obtenerTodos();
    }

    return NextResponse.json(equipos);
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : 'Error interno del servidor';
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}
