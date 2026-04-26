// =============================================================
// LIB: Utilidades JWT — Generar y verificar tokens
// =============================================================

import jwt from 'jsonwebtoken';

// Secreto JWT — en producción usar variable de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'mundial2026_secret_key_dev';
const JWT_EXPIRES_IN = '7d';

export interface JwtPayload {
  userId: number;
  correo: string;
}

/** Generar un JWT con datos del usuario */
export function generarToken(userId: number, correo: string): string {
  return jwt.sign({ userId, correo } as JwtPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/** Verificar y decodificar un JWT */
export function verificarToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
