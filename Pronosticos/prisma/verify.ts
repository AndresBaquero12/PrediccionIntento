// Verificación rápida de datos en la BD
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const adapter = new PrismaBetterSqlite3({ url: `file:${path.resolve('dev.db')}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  const g = await prisma.grupo.count();
  const e = await prisma.equipo.count();
  const p = await prisma.partido.count();
  const pg = await prisma.partido.count({ where: { fase: 'grupos' } });
  const pe = await prisma.partido.count({ where: { fase: 'eliminatoria' } });

  console.log('═══════════════════════════════════════');
  console.log('  VERIFICACIÓN DE BASE DE DATOS');
  console.log('═══════════════════════════════════════');
  console.log(`  Grupos:             ${g}`);
  console.log(`  Equipos:            ${e}`);
  console.log(`  Partidos total:     ${p}`);
  console.log(`    ├ Grupos:         ${pg}`);
  console.log(`    └ Eliminatoria:   ${pe}`);

  // Mostrar todos los grupos con sus equipos
  const grupos = await prisma.grupo.findMany({
    include: { equipos: true },
    orderBy: { letra: 'asc' },
  });

  console.log('\n─── GRUPOS Y EQUIPOS ───');
  for (const grupo of grupos) {
    const equipos = grupo.equipos.map((eq) => eq.nombre).join(', ');
    console.log(`  Grupo ${grupo.letra}: ${equipos}`);
  }

  // Mostrar muestra de partidos
  const partidosMuestra = await prisma.partido.findMany({
    where: { fase: 'grupos' },
    include: {
      equipoLocal: true,
      equipoVisitante: true,
      grupo: true,
    },
    take: 6,
    orderBy: { fechaInicio: 'asc' },
  });

  console.log('\n─── MUESTRA DE PARTIDOS (primeros 6) ───');
  for (const p of partidosMuestra) {
    console.log(
      `  [${p.grupo?.letra}] ${p.equipoLocal.nombre} vs ${p.equipoVisitante.nombre} — ${p.fechaInicio?.toISOString().slice(0, 16)} — ${p.estado}`
    );
  }

  console.log('\n═══════════════════════════════════════');
  console.log('  ✅ VERIFICACIÓN COMPLETA');
  console.log('═══════════════════════════════════════');

  await prisma['$disconnect']();
}

main();
