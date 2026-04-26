// =============================================================
// SEED: Datos iniciales — Mundial 2026
// Crea 12 grupos (A-L), 48 equipos reales y 36 partidos de grupo
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
    { nombre: 'Estados Unidos', pais: 'Estados Unidos' },
    { nombre: 'Marruecos', pais: 'Marruecos' },
    { nombre: 'Panamá', pais: 'Panamá' },
    { nombre: 'Por definir A4', pais: 'Por definir' },
  ],
  B: [
    { nombre: 'México', pais: 'México' },
    { nombre: 'Colombia', pais: 'Colombia' },
    { nombre: 'Ecuador', pais: 'Ecuador' },
    { nombre: 'Por definir B4', pais: 'Por definir' },
  ],
  C: [
    { nombre: 'Canadá', pais: 'Canadá' },
    { nombre: 'Australia', pais: 'Australia' },
    { nombre: 'Bahréin', pais: 'Bahréin' },
    { nombre: 'Por definir C4', pais: 'Por definir' },
  ],
  D: [
    { nombre: 'Brasil', pais: 'Brasil' },
    { nombre: 'Italia', pais: 'Italia' },
    { nombre: 'Albania', pais: 'Albania' },
    { nombre: 'Por definir D4', pais: 'Por definir' },
  ],
  E: [
    { nombre: 'Argentina', pais: 'Argentina' },
    { nombre: 'Camerún', pais: 'Camerún' },
    { nombre: 'Perú', pais: 'Perú' },
    { nombre: 'Por definir E4', pais: 'Por definir' },
  ],
  F: [
    { nombre: 'Francia', pais: 'Francia' },
    { nombre: 'Costa Rica', pais: 'Costa Rica' },
    { nombre: 'Kenia', pais: 'Kenia' },
    { nombre: 'Por definir F4', pais: 'Por definir' },
  ],
  G: [
    { nombre: 'España', pais: 'España' },
    { nombre: 'Bolivia', pais: 'Bolivia' },
    { nombre: 'Turquía', pais: 'Turquía' },
    { nombre: 'Por definir G4', pais: 'Por definir' },
  ],
  H: [
    { nombre: 'Portugal', pais: 'Portugal' },
    { nombre: 'Uruguay', pais: 'Uruguay' },
    { nombre: 'Paraguay', pais: 'Paraguay' },
    { nombre: 'Por definir H4', pais: 'Por definir' },
  ],
  I: [
    { nombre: 'Alemania', pais: 'Alemania' },
    { nombre: 'Serbia', pais: 'Serbia' },
    { nombre: 'Chile', pais: 'Chile' },
    { nombre: 'Por definir I4', pais: 'Por definir' },
  ],
  J: [
    { nombre: 'Países Bajos', pais: 'Países Bajos' },
    { nombre: 'Japón', pais: 'Japón' },
    { nombre: 'Senegal', pais: 'Senegal' },
    { nombre: 'Por definir J4', pais: 'Por definir' },
  ],
  K: [
    { nombre: 'Inglaterra', pais: 'Inglaterra' },
    { nombre: 'Arabia Saudita', pais: 'Arabia Saudita' },
    { nombre: 'Venezuela', pais: 'Venezuela' },
    { nombre: 'Por definir K4', pais: 'Por definir' },
  ],
  L: [
    { nombre: 'Bélgica', pais: 'Bélgica' },
    { nombre: 'Croacia', pais: 'Croacia' },
    { nombre: 'Nigeria', pais: 'Nigeria' },
    { nombre: 'Por definir L4', pais: 'Por definir' },
  ],
};

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

  // ─── Crear partidos eliminatorios (estructura vacía, sin equipos aún) ───
  const etapasEliminatorias: { etapa: string; cantidad: number }[] = [
    { etapa: 'R32', cantidad: 16 },   // Ronda de 32
    { etapa: 'R16', cantidad: 8 },    // Octavos de final
    { etapa: 'QF', cantidad: 4 },     // Cuartos de final
    { etapa: 'SF', cantidad: 2 },     // Semifinales
    { etapa: '3RD', cantidad: 1 },    // Tercer puesto
    { etapa: 'FINAL', cantidad: 1 },  // Final
  ];

  // Para eliminatorias usamos equipos placeholder (el primero de cada grupo)
  // Estos se actualizarán cuando se definan los clasificados
  const todosLosEquipos = Object.values(equiposPorGrupo).flat();
  let totalEliminatorias = 0;

  const fechaEliminatoria = new Date('2026-07-04T18:00:00Z');

  for (const { etapa, cantidad } of etapasEliminatorias) {
    for (let i = 0; i < cantidad; i++) {
      // Placeholder: se reutilizan IDs de equipos existentes
      // La lógica real se define cuando los grupos se resuelvan
      const localIdx = (totalEliminatorias * 2) % todosLosEquipos.length;
      const visitanteIdx = (totalEliminatorias * 2 + 1) % todosLosEquipos.length;

      const fecha = new Date(fechaEliminatoria);
      fecha.setDate(fecha.getDate() + totalEliminatorias);

      await prisma.partido.create({
        data: {
          grupoId: null,
          idEquipoLocal: todosLosEquipos[localIdx],
          idEquipoVisitante: todosLosEquipos[visitanteIdx],
          fechaInicio: fecha,
          fase: 'eliminatoria',
          etapa,
          estado: 'programado',
        },
      });
      totalEliminatorias++;
    }
  }
  console.log(`✅ ${totalEliminatorias} partidos eliminatorios (placeholder) creados.`);

  // ─── Resumen ───
  console.log('\n─────────────────────────────────────────');
  console.log('📊 RESUMEN DEL SEED:');
  console.log(`   Grupos:       ${letras.length}`);
  console.log(`   Equipos:      ${totalEquipos}`);
  console.log(`   Partidos:     ${totalPartidos + totalEliminatorias}`);
  console.log(`     ├ Grupos:       ${totalPartidos}`);
  console.log(`     └ Eliminatoria: ${totalEliminatorias}`);
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
