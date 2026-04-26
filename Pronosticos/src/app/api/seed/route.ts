// =============================================================
// CONTROLADOR: POST /api/seed — Poblar BD con datos iniciales
// Capa 4: Controlador REST
// Alternativa HTTP al seed de Prisma CLI
// =============================================================

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Datos de los 48 equipos organizados por grupo
const gruposConEquipos: Record<string, { nombre: string; pais: string }[]> = {
  A: [
    { nombre: 'México', pais: 'México' },
    { nombre: 'Sudáfrica', pais: 'Sudáfrica' },
    { nombre: 'República de Corea', pais: 'República de Corea' },
    { nombre: 'Chequia', pais: 'Chequia' },
  ],
  B: [
    { nombre: 'Canadá', pais: 'Canadá' },
    { nombre: 'Bosnia y Herzegovina', pais: 'Bosnia y Herzegovina' },
    { nombre: 'Catar', pais: 'Catar' },
    { nombre: 'Suiza', pais: 'Suiza' },
  ],
  C: [
    { nombre: 'Brasil', pais: 'Brasil' },
    { nombre: 'Marruecos', pais: 'Marruecos' },
    { nombre: 'Haití', pais: 'Haití' },
    { nombre: 'Escocia', pais: 'Escocia' },
  ],
  D: [
    { nombre: 'Estados Unidos', pais: 'Estados Unidos' },
    { nombre: 'Paraguay', pais: 'Paraguay' },
    { nombre: 'Australia', pais: 'Australia' },
    { nombre: 'Turquía', pais: 'Turquía' },
  ],
  E: [
    { nombre: 'Alemania', pais: 'Alemania' },
    { nombre: 'Curazao', pais: 'Curazao' },
    { nombre: 'Costa de Marfil', pais: 'Costa de Marfil' },
    { nombre: 'Ecuador', pais: 'Ecuador' },
  ],
  F: [
    { nombre: 'Países Bajos', pais: 'Países Bajos' },
    { nombre: 'Japón', pais: 'Japón' },
    { nombre: 'Suecia', pais: 'Suecia' },
    { nombre: 'Túnez', pais: 'Túnez' },
  ],
  G: [
    { nombre: 'Bélgica', pais: 'Bélgica' },
    { nombre: 'Egipto', pais: 'Egipto' },
    { nombre: 'RI de Irán', pais: 'Irán' },
    { nombre: 'Nueva Zelanda', pais: 'Nueva Zelanda' },
  ],
  H: [
    { nombre: 'España', pais: 'España' },
    { nombre: 'Islas de Cabo Verde', pais: 'Cabo Verde' },
    { nombre: 'Arabia Saudí', pais: 'Arabia Saudí' },
    { nombre: 'Uruguay', pais: 'Uruguay' },
  ],
  I: [
    { nombre: 'Francia', pais: 'Francia' },
    { nombre: 'Senegal', pais: 'Senegal' },
    { nombre: 'Irak', pais: 'Irak' },
    { nombre: 'Noruega', pais: 'Noruega' },
  ],
  J: [
    { nombre: 'Argentina', pais: 'Argentina' },
    { nombre: 'Argelia', pais: 'Argelia' },
    { nombre: 'Austria', pais: 'Austria' },
    { nombre: 'Jordania', pais: 'Jordania' },
  ],
  K: [
    { nombre: 'Portugal', pais: 'Portugal' },
    { nombre: 'RD Congo', pais: 'RD Congo' },
    { nombre: 'Uzbekistán', pais: 'Uzbekistán' },
    { nombre: 'Colombia', pais: 'Colombia' },
  ],
  L: [
    { nombre: 'Inglaterra', pais: 'Inglaterra' },
    { nombre: 'Croacia', pais: 'Croacia' },
    { nombre: 'Ghana', pais: 'Ghana' },
    { nombre: 'Panamá', pais: 'Panamá' },
  ],
};

function generarPartidosGrupo(equipoIds: number[]): [number, number][] {
  const partidos: [number, number][] = [];
  for (let i = 0; i < equipoIds.length; i++) {
    for (let j = i + 1; j < equipoIds.length; j++) {
      partidos.push([equipoIds[i], equipoIds[j]]);
    }
  }
  return partidos;
}

export async function POST() {
  try {
    // Limpiar datos existentes (orden inverso por FK)
    await prisma.puntuacion.deleteMany();
    await prisma.pronostico.deleteMany();
    await prisma.resultadoAdmin.deleteMany();
    await prisma.partido.deleteMany();
    await prisma.equipo.deleteMany();
    await prisma.grupo.deleteMany();
    await prisma.usuario.deleteMany();

    // Crear los 12 grupos
    const letras = Object.keys(gruposConEquipos);
    const gruposCreados: Record<string, number> = {};

    for (const letra of letras) {
      const grupo = await prisma.grupo.create({
        data: { letra, descripcion: `Grupo ${letra} — Mundial 2026` },
      });
      gruposCreados[letra] = grupo.id;
    }

    // Crear los 48 equipos
    const equiposPorGrupo: Record<string, number[]> = {};
    let totalEquipos = 0;

    for (const [letra, equipos] of Object.entries(gruposConEquipos)) {
      equiposPorGrupo[letra] = [];
      for (const eq of equipos) {
        const equipo = await prisma.equipo.create({
          data: { nombre: eq.nombre, pais: eq.pais, grupoId: gruposCreados[letra] },
        });
        equiposPorGrupo[letra].push(equipo.id);
        totalEquipos++;
      }
    }

    // Crear partidos de fase de grupos (6 por grupo = 72 totales)
    let totalPartidos = 0;
    const fechaBase = new Date('2026-06-11T18:00:00Z');

    for (const [letra, ids] of Object.entries(equiposPorGrupo)) {
      const enfrentamientos = generarPartidosGrupo(ids);
      let diaOffset = 0;

      for (const [localId, visitanteId] of enfrentamientos) {
        const fechaPartido = new Date(fechaBase);
        fechaPartido.setDate(fechaPartido.getDate() + diaOffset);
        fechaPartido.setHours(fechaPartido.getHours() + (totalPartidos % 3) * 3);

        await prisma.partido.create({
          data: {
            grupoId: gruposCreados[letra],
            idEquipoLocal: localId,
            idEquipoVisitante: visitanteId,
            fechaInicio: fechaPartido,
            fase: 'grupos',
            estado: 'programado',
          },
        });
        totalPartidos++;
        diaOffset++;
      }
    }

    return NextResponse.json({
      mensaje: 'Seed completado exitosamente',
      grupos: letras.length,
      equipos: totalEquipos,
      partidos: totalPartidos,
    });
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : 'Error interno del servidor';
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}
