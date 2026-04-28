// =============================================================
// CONTROLADOR: POST /api/admin/auth — Validar credenciales admin
// Capa 4: Controlador REST
// Las credenciales se validan server-side, no en el cliente
// =============================================================

import { NextRequest, NextResponse } from 'next/server';

// Credenciales de admin — en producción usar variables de entorno
const ADMIN_CORREO = process.env.ADMIN_CORREO || 'andres@admin.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '1234';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { correo, password } = body;

    if (!correo || !password) {
      return NextResponse.json(
        { error: 'Correo y contraseña son requeridos.' },
        { status: 400 }
      );
    }

    if (correo === ADMIN_CORREO && password === ADMIN_PASSWORD) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { error: 'Credenciales de administrador incorrectas.' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
