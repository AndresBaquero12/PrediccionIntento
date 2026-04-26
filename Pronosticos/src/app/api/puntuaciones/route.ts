// =============================================================
// CONTROLADOR: GET /api/puntuaciones — Puntuaciones del usuario
// Capa 4: Controlador REST
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/middleware/auth.middleware';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const puntuaciones = await prisma.puntuacion.findMany({
      where: { idUsuario: auth.userId },
      include: {
        partido: {
          include: {
            equipoLocal: true,
            equipoVisitante: true,
          },
        },
      },
    });

    return NextResponse.json(puntuaciones);
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : 'Error interno del servidor';
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}
