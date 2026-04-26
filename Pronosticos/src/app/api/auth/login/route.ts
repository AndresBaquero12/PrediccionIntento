// =============================================================
// CONTROLADOR: POST /api/auth/login — Login de usuario
// Capa 4: Controlador REST (solo HTTP, delega al servicio)
// RF: USR-RF02
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import * as authService from '@/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { correo, password } = body;

    // Validaciones básicas
    if (!correo || !password) {
      return NextResponse.json(
        { error: 'Campos requeridos: correo, password' },
        { status: 400 }
      );
    }

    const resultado = await authService.loginUsuario(correo, password);
    return NextResponse.json(resultado);
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : 'Error interno del servidor';
    const status = mensaje.includes('incorrectos') ? 401 : 500;
    return NextResponse.json({ error: mensaje }, { status });
  }
}
