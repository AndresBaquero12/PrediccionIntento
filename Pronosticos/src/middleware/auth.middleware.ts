// =============================================================
// MIDDLEWARE: Autenticación — Extraer y verificar JWT del header
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import { verificarToken, JwtPayload } from '@/lib/jwt';

/**
 * Extrae el token del header Authorization y lo verifica.
 * Retorna el payload (userId, correo) si es válido, o null si no.
 */
export function extraerUsuario(request: NextRequest): JwtPayload | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    return verificarToken(token);
  } catch {
    return null;
  }
}

/**
 * Middleware helper: retorna 401 si no hay usuario autenticado.
 * Usado por los API routes que requieren autenticación.
 */
export function requireAuth(request: NextRequest): JwtPayload | NextResponse {
  const usuario = extraerUsuario(request);
  if (!usuario) {
    return NextResponse.json(
      { error: 'No autorizado. Token inválido o ausente.' },
      { status: 401 }
    );
  }
  return usuario;
}
