// =============================================================
// CONTROLADOR: GET /api/clasificacion — Clasificación de TODOS los grupos
// Capa 4: Controlador REST
// Optimización: una sola request en vez de 12 paralelas
// =============================================================

import { NextResponse } from 'next/server';
import * as clasificacionService from '@/services/clasificacion.service';

/** GET /api/clasificacion — Retorna clasificación de todos los grupos */
export async function GET() {
  try {
    const letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

    const resultados = await Promise.all(
      letras.map((letra) => clasificacionService.calcularClasificacionGrupo(letra))
    );

    return NextResponse.json(resultados);
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : 'Error interno del servidor';
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}
