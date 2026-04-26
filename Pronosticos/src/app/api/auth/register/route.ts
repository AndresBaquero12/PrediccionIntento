// =============================================================
// CONTROLADOR: POST /api/auth/register — Registro de usuario
// Capa 4: Controlador REST (solo HTTP, delega al servicio)
// RF: USR-RF01
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import * as authService from '@/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombreUsuario, correo, password } = body;

    // Validaciones básicas
    if (!nombreUsuario || !correo || !password) {
      return NextResponse.json(
        { error: 'Campos requeridos: nombreUsuario, correo, password' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres.' },
        { status: 400 }
      );
    }

    const resultado = await authService.registrarUsuario(nombreUsuario, correo, password);
    return NextResponse.json(resultado, { status: 201 });
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : 'Error interno del servidor';
    const status = mensaje.includes('Ya existe') ? 409 : 500;
    return NextResponse.json({ error: mensaje }, { status });
  }
}
