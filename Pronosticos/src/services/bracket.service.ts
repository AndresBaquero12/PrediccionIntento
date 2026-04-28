// =============================================================
// SERVICIO: Bracket — Generación y gestión del bracket eliminatorio
// Capa 3: Lógica de negocio (no conoce HTTP)
// Validación de terceros va AQUÍ, no en controladores
// =============================================================

import prisma from '@/lib/prisma';
import * as llaveModel from '@/models/llave.model';
import * as clasificacionService from '@/services/clasificacion.service';

// ─── Bracket completo ────────────────────────────────────────

/** Obtiene el bracket completo organizado por rondas */
export async function obtenerBracketCompleto() {
  const llaves = await llaveModel.obtenerTodas();

  const bracket: Record<string, typeof llaves> = {};
  for (const llave of llaves) {
    if (!bracket[llave.ronda]) {
      bracket[llave.ronda] = [];
    }
    bracket[llave.ronda].push(llave);
  }

  return bracket;
}

// ─── Resolución de slots ─────────────────────────────────────

/**
 * Resuelve un slot como "1A", "2B", "3C/D/E" a un equipo ID
 * usando los clasificados reales de la fase de grupos.
 */
async function resolverSlot(
  slot: string,
  clasificadosPorGrupo: Map<string, { primero: number; segundo: number; tercero: number }>,
  mejoresTerceros: { equipo: { id: number }; grupo: string }[]
): Promise<number | null> {
  // Slot tipo "1A", "2B" → posición + grupo
  const match = slot.match(/^([123])([A-L])$/);
  if (match) {
    const posicion = parseInt(match[1]);
    const grupo = match[2];
    const datos = clasificadosPorGrupo.get(grupo);
    if (!datos) return null;

    if (posicion === 1) return datos.primero;
    if (posicion === 2) return datos.segundo;
    if (posicion === 3) return datos.tercero;
    return null;
  }

  // Slot tipo "3C/D/E" → mejor tercero de esos grupos específicos
  const matchTercero = slot.match(/^3([A-L](?:\/[A-L])+)$/);
  if (matchTercero) {
    const gruposPermitidos = matchTercero[1].split('/');
    // Buscar el mejor tercero que pertenezca a uno de esos grupos
    for (const tercero of mejoresTerceros) {
      if (gruposPermitidos.includes(tercero.grupo)) {
        return tercero.equipo.id;
      }
    }
    return null;
  }

  return null;
}

// ─── Validación de terceros ──────────────────────────────────

/**
 * Valida que un tercer lugar no enfrente a un equipo de su mismo grupo
 * SOLO en bracket.service.ts — controladores no hacen esta validación
 */
async function validarTerceroContrario(
  idEquipoTercero: number,
  idEquipoContrario: number
): Promise<{ valido: boolean; mensaje?: string }> {
  // Obtener grupo del tercero
  const tercero = await prisma.equipo.findUnique({
    where: { id: idEquipoTercero },
    include: { grupo: true },
  });

  const contrario = await prisma.equipo.findUnique({
    where: { id: idEquipoContrario },
    include: { grupo: true },
  });

  if (!tercero || !contrario) {
    return { valido: false, mensaje: 'Equipo no encontrado.' };
  }

  if (tercero.grupoId === contrario.grupoId) {
    return {
      valido: false,
      mensaje: `El 3er lugar del Grupo ${tercero.grupo.letra} no puede enfrentar al campeón del Grupo ${contrario.grupo.letra} (mismo grupo).`,
    };
  }

  return { valido: true };
}

// ─── Generación de R32 ──────────────────────────────────────

/** Genera las 16 llaves de R32 usando los clasificados y la BracketConfig */
export async function generarLlavesR32() {
  // Verificar que los clasificados estén listos
  const clasificados = await clasificacionService.obtenerClasificadosR32();
  if (!clasificados.listos) {
    throw new Error(clasificados.mensaje || 'Aún hay partidos de grupos sin finalizar.');
  }

  // Obtener configuración de cruces
  const config = await llaveModel.obtenerBracketConfig();
  if (config.length === 0) {
    throw new Error('No hay configuración de bracket. Ejecuta el seed primero.');
  }

  // Construir mapa de clasificados por grupo
  const clasificadosPorGrupo = new Map<string, { primero: number; segundo: number; tercero: number }>();

  for (const p of clasificados.primeros!) {
    const grupo = p.grupo;
    if (!clasificadosPorGrupo.has(grupo)) {
      clasificadosPorGrupo.set(grupo, { primero: 0, segundo: 0, tercero: 0 });
    }
    clasificadosPorGrupo.get(grupo)!.primero = p.equipo.id;
  }

  for (const s of clasificados.segundos!) {
    const grupo = s.grupo;
    if (!clasificadosPorGrupo.has(grupo)) {
      clasificadosPorGrupo.set(grupo, { primero: 0, segundo: 0, tercero: 0 });
    }
    clasificadosPorGrupo.get(grupo)!.segundo = s.equipo.id;
  }

  for (const t of clasificados.terceros!) {
    const grupo = t.grupo;
    if (clasificadosPorGrupo.has(grupo)) {
      clasificadosPorGrupo.get(grupo)!.tercero = t.equipo.id;
    }
  }

  // Asignar equipos a las llaves de R32
  const resultados: { posicion: number; equipo1: number | null; equipo2: number | null; error?: string }[] = [];

  for (const cruce of config) {
    const eq1 = await resolverSlot(cruce.slot1, clasificadosPorGrupo, clasificados.terceros!);
    const eq2 = await resolverSlot(cruce.slot2, clasificadosPorGrupo, clasificados.terceros!);

    // Validar terceros
    if (eq1 && eq2) {
      // Revisar si alguno es tercero
      const esTerceroEq1 = cruce.slot1.startsWith('3');
      const esTerceroEq2 = cruce.slot2.startsWith('3');

      if (esTerceroEq1 && eq2) {
        const validacion = await validarTerceroContrario(eq1, eq2);
        if (!validacion.valido) {
          resultados.push({ posicion: cruce.posicionR32, equipo1: null, equipo2: eq2, error: validacion.mensaje });
          continue;
        }
      }

      if (esTerceroEq2 && eq1) {
        const validacion = await validarTerceroContrario(eq2, eq1);
        if (!validacion.valido) {
          resultados.push({ posicion: cruce.posicionR32, equipo1: eq1, equipo2: null, error: validacion.mensaje });
          continue;
        }
      }
    }

    // Actualizar llave en BD
    const llave = await prisma.llaveEliminatoria.findUnique({
      where: { ronda_posicion: { ronda: 'R32', posicion: cruce.posicionR32 } },
    });

    if (llave) {
      await llaveModel.actualizarEquipos(llave.id, eq1, eq2);
    }

    resultados.push({ posicion: cruce.posicionR32, equipo1: eq1, equipo2: eq2 });
  }

  return {
    mensaje: `R32 generado. ${resultados.filter(r => r.equipo1 && r.equipo2).length} llaves completas.`,
    resultados,
  };
}

// ─── Asignación manual de equipos ────────────────────────────

/** Admin sobrescribe equipos de una llave con validación de terceros */
export async function asignarEquiposManual(
  llaveId: number,
  idEquipo1?: number | null,
  idEquipo2?: number | null
) {
  const llave = await llaveModel.obtenerPorId(llaveId);
  if (!llave) {
    throw new Error('La llave no existe.');
  }

  // Si ambos equipos están definidos, validar terceros
  const eq1Final = idEquipo1 !== undefined ? idEquipo1 : llave.idEquipo1;
  const eq2Final = idEquipo2 !== undefined ? idEquipo2 : llave.idEquipo2;

  if (eq1Final && eq2Final) {
    // Verificar si alguno es tercer lugar de su grupo
    const equipo1 = await prisma.equipo.findUnique({ where: { id: eq1Final }, include: { grupo: true } });
    const equipo2 = await prisma.equipo.findUnique({ where: { id: eq2Final }, include: { grupo: true } });

    if (equipo1 && equipo2 && equipo1.grupoId === equipo2.grupoId) {
      throw new Error(
        `${equipo1.nombre} y ${equipo2.nombre} son del mismo grupo (${equipo1.grupo.letra}). No pueden enfrentarse en R32.`
      );
    }
  }

  await llaveModel.actualizarEquipos(llaveId, idEquipo1, idEquipo2);

  return { ok: true, mensaje: 'Equipos actualizados en la llave.' };
}
