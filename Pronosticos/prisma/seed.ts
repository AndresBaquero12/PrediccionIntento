// =============================================================
// SEED: Datos iniciales — Mundial 2026
// Crea 12 grupos (A-L), 48 equipos reales y 72 partidos de grupo
// + BracketConfig con cruces oficiales R32
// + Llaves vacías del bracket eliminatorio
// NOTA: Datos unificados con api/seed/route.ts
// =============================================================

import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '..', 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

// ─── 48 equipos clasificados al Mundial 2026 (agrupados por grupo oficial) ───
// Fuente: sorteo oficial FIFA — grupos A-L, 4 equipos por grupo
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

// ─── Cruces oficiales R32 del Mundial 2026 (configurables) ───
// Formato: slot1 vs slot2
// Slots: "1A" = primero del grupo A, "2B" = segundo del grupo B,
//         "3C/D/E" = mejor tercero entre grupos C, D, E
const crucesR32 = [
  { posicion: 1,  slot1: '1A', slot2: '2C',     descripcion: '1A vs 2C' },
  { posicion: 2,  slot1: '1B', slot2: '2D',     descripcion: '1B vs 2D' },
  { posicion: 3,  slot1: '1C', slot2: '2A',     descripcion: '1C vs 2A' },
  { posicion: 4,  slot1: '1D', slot2: '2B',     descripcion: '1D vs 2B' },
  { posicion: 5,  slot1: '1E', slot2: '2G',     descripcion: '1E vs 2G' },
  { posicion: 6,  slot1: '1F', slot2: '2H',     descripcion: '1F vs 2H' },
  { posicion: 7,  slot1: '1G', slot2: '2E',     descripcion: '1G vs 2E' },
  { posicion: 8,  slot1: '1H', slot2: '2F',     descripcion: '1H vs 2F' },
  { posicion: 9,  slot1: '1I', slot2: '2K',     descripcion: '1I vs 2K' },
  { posicion: 10, slot1: '1J', slot2: '2L',     descripcion: '1J vs 2L' },
  { posicion: 11, slot1: '1K', slot2: '2I',     descripcion: '1K vs 2I' },
  { posicion: 12, slot1: '1L', slot2: '2J',     descripcion: '1L vs 2J' },
  { posicion: 13, slot1: '3A/B/C', slot2: '3D/E/F',  descripcion: '3° ABC vs 3° DEF' },
  { posicion: 14, slot1: '3G/H/I', slot2: '3J/K/L',  descripcion: '3° GHI vs 3° JKL' },
  { posicion: 15, slot1: '3A/B/C', slot2: '3G/H/I',  descripcion: '3° ABC vs 3° GHI' },
  { posicion: 16, slot1: '3D/E/F', slot2: '3J/K/L',  descripcion: '3° DEF vs 3° JKL' },
];

// ─── Generar los 6 enfrentamientos de un grupo de 4 equipos (todos contra todos) ───
function generarPartidosGrupo(equipoIds: number[]): [number, number][] {
  const partidos: [number, number][] = [];
  for (let i = 0; i < equipoIds.length; i++) {
    for (let j = i + 1; j < equipoIds.length; j++) {
      partidos.push([equipoIds[i], equipoIds[j]]);
    }
  }
  return partidos;
}

async function main() {
  console.log('🌍 Iniciando seed del Mundial 2026...\n');

  // ─── Limpiar datos existentes (orden inverso por FK) ───
  await prisma.puntuacion.deleteMany();
  await prisma.pronostico.deleteMany();
  await prisma.resultadoAdmin.deleteMany();
  await prisma.llaveEliminatoria.deleteMany();
  await prisma.bracketConfig.deleteMany();
  await prisma.clasificacionOverride.deleteMany();
  await prisma.partido.deleteMany();
  await prisma.equipo.deleteMany();
  await prisma.grupo.deleteMany();
  await prisma.usuario.deleteMany();
  console.log('🗑️  Datos anteriores eliminados.');

  // ─── Crear los 12 grupos ───
  const letras = Object.keys(gruposConEquipos);
  const gruposCreados: Record<string, number> = {};

  for (const letra of letras) {
    const grupo = await prisma.grupo.create({
      data: {
        letra,
        descripcion: `Grupo ${letra} — Mundial 2026`,
      },
    });
    gruposCreados[letra] = grupo.id;
  }
  console.log(`✅ ${letras.length} grupos creados (A-L).`);

  // ─── Crear los 48 equipos ───
  const equiposPorGrupo: Record<string, number[]> = {};
  let totalEquipos = 0;

  for (const [letra, equipos] of Object.entries(gruposConEquipos)) {
    equiposPorGrupo[letra] = [];
    for (const eq of equipos) {
      const equipo = await prisma.equipo.create({
        data: {
          nombre: eq.nombre,
          pais: eq.pais,
          grupoId: gruposCreados[letra],
        },
      });
      equiposPorGrupo[letra].push(equipo.id);
      totalEquipos++;
    }
  }
  console.log(`✅ ${totalEquipos} equipos creados.`);

  // ─── Crear partidos de fase de grupos (6 por grupo = 72 totales) ───
  let totalPartidos = 0;

  // Fecha base: 11 de junio 2026, inicio del Mundial
  const fechaBase = new Date('2026-06-11T18:00:00Z');

  for (const [letra, ids] of Object.entries(equiposPorGrupo)) {
    const enfrentamientos = generarPartidosGrupo(ids);
    let diaOffset = 0;

    for (const [localId, visitanteId] of enfrentamientos) {
      const fechaPartido = new Date(fechaBase);
      fechaPartido.setDate(fechaPartido.getDate() + diaOffset);
      // Escalonar horas para no solapar
      fechaPartido.setHours(
        fechaPartido.getHours() + (totalPartidos % 3) * 3
      );

      await prisma.partido.create({
        data: {
          grupoId: gruposCreados[letra],
          idEquipoLocal: localId,
          idEquipoVisitante: visitanteId,
          fechaInicio: fechaPartido,
          fase: 'grupos',
          etapa: null,
          estado: 'programado',
        },
      });
      totalPartidos++;
      diaOffset++;
    }
  }
  console.log(`✅ ${totalPartidos} partidos de fase de grupos creados.`);

  // ─── Crear BracketConfig (cruces configurables de R32) ───
  for (const cruce of crucesR32) {
    await prisma.bracketConfig.create({
      data: {
        posicionR32: cruce.posicion,
        slot1: cruce.slot1,
        slot2: cruce.slot2,
        descripcion: cruce.descripcion,
      },
    });
  }
  console.log(`✅ ${crucesR32.length} cruces de R32 configurados.`);

  // ─── Crear llaves vacías del bracket ───
  const rondas: { ronda: string; cantidad: number }[] = [
    { ronda: 'R32', cantidad: 16 },
    { ronda: 'R16', cantidad: 8 },
    { ronda: 'QF', cantidad: 4 },
    { ronda: 'SF', cantidad: 2 },
    { ronda: '3RD', cantidad: 1 },
    { ronda: 'FINAL', cantidad: 1 },
  ];

  let totalLlaves = 0;
  for (const { ronda, cantidad } of rondas) {
    for (let i = 1; i <= cantidad; i++) {
      await prisma.llaveEliminatoria.create({
        data: { ronda, posicion: i },
      });
      totalLlaves++;
    }
  }
  console.log(`✅ ${totalLlaves} llaves del bracket creadas (vacías).`);

  // ─── Resumen ───
  console.log('\n─────────────────────────────────────────');
  console.log('📊 RESUMEN DEL SEED:');
  console.log(`   Grupos:          ${letras.length}`);
  console.log(`   Equipos:         ${totalEquipos}`);
  console.log(`   Partidos grupo:  ${totalPartidos}`);
  console.log(`   Cruces R32:      ${crucesR32.length}`);
  console.log(`   Llaves bracket:  ${totalLlaves}`);
  console.log('─────────────────────────────────────────');
  console.log('✅ Seed completado exitosamente.\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
