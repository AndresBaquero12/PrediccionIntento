// =============================================================
// CONTROLADOR: GET /api/grupos — Listar grupos con equipos
// Capa 4: Controlador REST (solo HTTP, delega al modelo)
// =============================================================

import { NextResponse } from 'next/server';
import * as grupoModel from '@/models/grupo.model';

export async function GET() {
  try {
    const grupos = await grupoModel.obtenerTodosConEquipos();
    return NextResponse.json(grupos);
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : 'Error interno del servidor';
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}
