// =============================================================
// SERVICIO: Clasificación — Tablas de posiciones y clasificados
// Capa 3: Lógica de negocio (no conoce HTTP)
// =============================================================

import prisma from '@/lib/prisma';

// ─── Tipos ───────────────────────────────────────────────────

export interface StatsEquipo {
  equipo: { id: number; nombre: string; pais: string };
  posicion: number;
  pj: number;   // Partidos jugados
  g: number;    // Ganados
  e: number;    // Empatados
  p: number;    // Perdidos
  gf: number;   // Goles a favor
  dif: number;  // Diferencia de goles (GF - GC)
  pts: number;  // Puntos
  grupo: string; // Letra del grupo
}

// ─── Clasificación de un grupo ───────────────────────────────

/** Calcula la tabla de posiciones de un grupo con stats completos */
export async function calcularClasificacionGrupo(letraGrupo: string): Promise<{
  grupo: string;
  clasificacion: StatsEquipo[];
  todosFinalizados: boolean;
}> {
  // Obtener el grupo con equipos
  const grupo = await prisma.grupo.findUnique({
    where: { letra: letraGrupo.toUpperCase() },
    include: { equipos: true },
  });

  if (!grupo) {
    throw new Error(`El grupo ${letraGrupo} no existe.`);
  }

  // Obtener todos los partidos del grupo
  const partidos = await prisma.partido.findMany({
    where: { grupoId: grupo.id, fase: 'grupos' },
  });

  const todosFinalizados = partidos.length > 0 && partidos.every(p => p.estado === 'finalizado');

  // Calcular stats para cada equipo
  const statsMap = new Map<number, {
    pj: number; g: number; e: number; p: number; gf: number; gc: number;
  }>();

  // Inicializar stats en 0 para cada equipo
  for (const equipo of grupo.equipos) {
    statsMap.set(equipo.id, { pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0 });
  }

  // Recorrer partidos finalizados
  for (const partido of partidos) {
    if (partido.estado !== 'finalizado' || partido.golesLocalReal === null || partido.golesVisitanteReal === null) {
      continue;
    }

    const gl = partido.golesLocalReal;
    const gv = partido.golesVisitanteReal;

    const statsLocal = statsMap.get(partido.idEquipoLocal);
    const statsVisitante = statsMap.get(partido.idEquipoVisitante);

    if (statsLocal) {
      statsLocal.pj++;
      statsLocal.gf += gl;
      statsLocal.gc += gv;
      if (gl > gv) statsLocal.g++;
      else if (gl === gv) statsLocal.e++;
      else statsLocal.p++;
    }

    if (statsVisitante) {
      statsVisitante.pj++;
      statsVisitante.gf += gv;
      statsVisitante.gc += gl;
      if (gv > gl) statsVisitante.g++;
      else if (gv === gl) statsVisitante.e++;
      else statsVisitante.p++;
    }
  }

  // Verificar si hay un override manual del admin
  const override = await prisma.clasificacionOverride.findUnique({
    where: { grupoId: grupo.id },
  });

  // Construir array de stats
  let clasificacion: StatsEquipo[] = grupo.equipos.map((equipo) => {
    const s = statsMap.get(equipo.id)!;
    return {
      equipo: { id: equipo.id, nombre: equipo.nombre, pais: equipo.pais },
      posicion: 0, // se asigna después
      pj: s.pj,
      g: s.g,
      e: s.e,
      p: s.p,
      gf: s.gf,
      dif: s.gf - s.gc,
      pts: s.g * 3 + s.e,
      grupo: letraGrupo.toUpperCase(),
    };
  });

  if (override) {
    // Usar orden manual del admin
    const ordenIds: number[] = JSON.parse(override.ordenJson);
    clasificacion.sort((a, b) => {
      const idxA = ordenIds.indexOf(a.equipo.id);
      const idxB = ordenIds.indexOf(b.equipo.id);
      return idxA - idxB;
    });
  } else {
    // Ordenar por criterios: (1) PTS desc, (2) DIF desc, (3) GF desc
    clasificacion.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.dif !== a.dif) return b.dif - a.dif;
      return b.gf - a.gf;
    });
  }

  // Asignar posiciones
  clasificacion = clasificacion.map((item, index) => ({
    ...item,
    posicion: index + 1,
  }));

  return { grupo: letraGrupo.toUpperCase(), clasificacion, todosFinalizados };
}

// ─── Mejores terceros ────────────────────────────────────────

/** Obtiene los 8 mejores terceros entre los 12 grupos */
export async function obtenerMejoresTerceros(): Promise<StatsEquipo[]> {
  const letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  const terceros: StatsEquipo[] = [];

  for (const letra of letras) {
    const { clasificacion } = await calcularClasificacionGrupo(letra);
    const tercero = clasificacion.find(e => e.posicion === 3);
    if (tercero) {
      terceros.push(tercero);
    }
  }

  // Ordenar por: (1) PTS desc, (2) DIF desc, (3) GF desc
  terceros.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dif !== a.dif) return b.dif - a.dif;
    return b.gf - a.gf;
  });

  // Retornar los 8 mejores
  return terceros.slice(0, 8);
}

// ─── 32 clasificados ─────────────────────────────────────────

/** Obtiene los 32 clasificados cuando todos los partidos de grupos estén finalizados */
export async function obtenerClasificadosR32(): Promise<{
  listos: boolean;
  primeros?: StatsEquipo[];
  segundos?: StatsEquipo[];
  terceros?: StatsEquipo[];
  mensaje?: string;
  faltantes?: number;
}> {
  // Verificar que TODOS los partidos de fase de grupos estén finalizados
  const partidosGrupos = await prisma.partido.findMany({
    where: { fase: 'grupos' },
  });

  const noFinalizados = partidosGrupos.filter(p => p.estado !== 'finalizado');

  if (noFinalizados.length > 0) {
    return {
      listos: false,
      mensaje: `Faltan ${noFinalizados.length} partidos por finalizar`,
      faltantes: noFinalizados.length,
    };
  }

  const letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const primeros: StatsEquipo[] = [];
  const segundos: StatsEquipo[] = [];

  for (const letra of letras) {
    const { clasificacion } = await calcularClasificacionGrupo(letra);
    const primero = clasificacion.find(e => e.posicion === 1);
    const segundo = clasificacion.find(e => e.posicion === 2);
    if (primero) primeros.push(primero);
    if (segundo) segundos.push(segundo);
  }

  const terceros = await obtenerMejoresTerceros();

  return { listos: true, primeros, segundos, terceros };
}

// ─── Override manual ─────────────────────────────────────────

/** Guardar un orden manual del admin para la clasificación de un grupo */
export async function guardarOrdenManual(letraGrupo: string, ordenEquipoIds: number[]) {
  const grupo = await prisma.grupo.findUnique({
    where: { letra: letraGrupo.toUpperCase() },
  });

  if (!grupo) {
    throw new Error(`El grupo ${letraGrupo} no existe.`);
  }

  await prisma.clasificacionOverride.upsert({
    where: { grupoId: grupo.id },
    create: {
      grupoId: grupo.id,
      ordenJson: JSON.stringify(ordenEquipoIds),
    },
    update: {
      ordenJson: JSON.stringify(ordenEquipoIds),
    },
  });

  // DISPARAR ACTUALIZACIÓN DEL BRACKET
  const { actualizarBracketAutomatico } = await import('./bracket.service');
  await actualizarBracketAutomatico();

  return { ok: true, mensaje: `Orden manual guardado para Grupo ${letraGrupo.toUpperCase()}. Bracket actualizado.` };
}
