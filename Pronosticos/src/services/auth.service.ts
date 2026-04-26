// =============================================================
// SERVICIO: Auth — Registro, Login, verificación de token
// Capa 3: Lógica de negocio (no conoce HTTP)
// RF: USR-RF01, USR-RF02, USR-RF03
// =============================================================

import bcrypt from 'bcryptjs';
import * as usuarioModel from '@/models/usuario.model';
import { generarToken } from '@/lib/jwt';

const SALT_ROUNDS = 10;

/** Registrar un nuevo usuario (USR-RF01) */
export async function registrarUsuario(
  nombreUsuario: string,
  correo: string,
  password: string
) {
  // Verificar que no exista ya
  const existente = await usuarioModel.buscarPorCorreo(correo);
  if (existente) {
    throw new Error('Ya existe un usuario con ese correo.');
  }

  // Hashear password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Crear usuario en BD
  const usuario = await usuarioModel.crearUsuario(nombreUsuario, correo, passwordHash);

  // Generar JWT (USR-RF03)
  const token = generarToken(usuario.id, usuario.correo);

  return {
    token,
    usuario: {
      id: usuario.id,
      nombreUsuario: usuario.nombreUsuario,
      correo: usuario.correo,
    },
  };
}

/** Login de usuario (USR-RF02) */
export async function loginUsuario(correo: string, password: string) {
  const usuario = await usuarioModel.buscarPorCorreo(correo);
  if (!usuario) {
    throw new Error('Correo o contraseña incorrectos.');
  }

  // Comparar password con hash
  const valido = await bcrypt.compare(password, usuario.passwordHash);
  if (!valido) {
    throw new Error('Correo o contraseña incorrectos.');
  }

  // Generar JWT (USR-RF03)
  const token = generarToken(usuario.id, usuario.correo);

  return {
    token,
    usuario: {
      id: usuario.id,
      nombreUsuario: usuario.nombreUsuario,
      correo: usuario.correo,
    },
  };
}
