// =============================================================
// MODELO: Usuario — CRUD puro con Prisma
// Capa 2: Acceso a datos (no contiene lógica de negocio)
// =============================================================

import prisma from '@/lib/prisma';

/** Crear un nuevo usuario */
export async function crearUsuario(
  nombreUsuario: string,
  correo: string,
  passwordHash: string
) {
  return prisma.usuario.create({
    data: { nombreUsuario, correo, passwordHash },
  });
}

/** Buscar usuario por correo electrónico */
export async function buscarPorCorreo(correo: string) {
  return prisma.usuario.findUnique({ where: { correo } });
}

/** Buscar usuario por ID */
export async function buscarPorId(id: number) {
  return prisma.usuario.findUnique({ where: { id } });
}

/** Obtener todos los usuarios (para ranking) */
export async function obtenerTodos() {
  return prisma.usuario.findMany({
    select: {
      id: true,
      nombreUsuario: true,
      correo: true,
      createdAt: true,
    },
  });
}
