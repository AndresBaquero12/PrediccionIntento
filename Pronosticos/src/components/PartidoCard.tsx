'use client';

import { useState } from 'react';

interface Equipo {
  id: number;
  nombre: string;
  pais: string;
}

interface PronosticoData {
  golesLocalPredicho: number;
  golesVisitantePredicho: number;
}

interface PuntuacionData {
  puntos: number;
  detalle: string;
}

interface PartidoCardProps {
  partido: {
    id: number;
    equipoLocal: Equipo;
    equipoVisitante: Equipo;
    fechaInicio: string | null;
    estado: string;
    golesLocalReal: number | null;
    golesVisitanteReal: number | null;
  };
  pronostico?: PronosticoData | null;
  puntuacion?: PuntuacionData | null;
  onGuardarPronostico: (idPartido: number, golesLocal: number, golesVisitante: number) => Promise<void>;
}

export default function PartidoCard({ partido, pronostico, puntuacion, onGuardarPronostico }: PartidoCardProps) {
  const [golesLocal, setGolesLocal] = useState(pronostico?.golesLocalPredicho ?? 0);
  const [golesVisitante, setGolesVisitante] = useState(pronostico?.golesVisitantePredicho ?? 0);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const esFuturo = partido.fechaInicio && new Date(partido.fechaInicio) > new Date();
  const puedePronosticar = esFuturo && partido.estado === 'programado';

  function formatFecha(fecha: string | null) {
    if (!fecha) return 'Fecha por definir';
    return new Date(fecha).toLocaleDateString('es-CO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  async function handleGuardar() {
    setGuardando(true);
    setMensaje('');
    try {
      await onGuardarPronostico(partido.id, golesLocal, golesVisitante);
      setMensaje('✓ Guardado');
      setTimeout(() => setMensaje(''), 2000);
    } catch {
      setMensaje('Error al guardar');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className={`partido-card ${partido.estado === 'finalizado' ? 'finalizado' : ''}`}>
      {/* Estado y fecha */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className={`partido-estado ${partido.estado}`}>
          {partido.estado === 'programado' && '📅'}
          {partido.estado === 'en_juego' && '🔴'}
          {partido.estado === 'finalizado' && '✅'}
          {partido.estado === 'programado' ? 'Programado' : partido.estado === 'en_juego' ? 'En vivo' : 'Finalizado'}
        </span>
        <span className="partido-fecha">{formatFecha(partido.fechaInicio)}</span>
      </div>

      {/* Equipos y resultado */}
      <div className="partido-equipos">
        <div className="partido-equipo">
          <span className="partido-equipo-nombre">{partido.equipoLocal.nombre}</span>
        </div>

        {partido.estado === 'finalizado' && partido.golesLocalReal !== null ? (
          <div className="partido-resultado">
            <span className="gol">{partido.golesLocalReal}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>-</span>
            <span className="gol">{partido.golesVisitanteReal}</span>
          </div>
        ) : (
          <span className="partido-vs">VS</span>
        )}

        <div className="partido-equipo">
          <span className="partido-equipo-nombre">{partido.equipoVisitante.nombre}</span>
        </div>
      </div>

      {/* Sección de pronóstico */}
      {puedePronosticar ? (
        <div className="pronostico-section">
          <label>Tu pronóstico:</label>
          <input
            className="input input-score"
            type="number"
            min="0"
            max="20"
            value={golesLocal}
            onChange={(e) => setGolesLocal(Math.max(0, parseInt(e.target.value) || 0))}
          />
          <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>-</span>
          <input
            className="input input-score"
            type="number"
            min="0"
            max="20"
            value={golesVisitante}
            onChange={(e) => setGolesVisitante(Math.max(0, parseInt(e.target.value) || 0))}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={handleGuardar}
            disabled={guardando}
          >
            {guardando ? '...' : '💾'}
          </button>
          {mensaje && (
            <span style={{ fontSize: '0.75rem', color: mensaje.includes('Error') ? 'var(--accent-danger)' : 'var(--accent-primary)' }}>
              {mensaje}
            </span>
          )}
        </div>
      ) : pronostico ? (
        <div className="pronostico-section" style={{ flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label>Tu pronóstico:</label>
            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
              {pronostico.golesLocalPredicho} - {pronostico.golesVisitantePredicho}
            </span>
          </div>
          {puntuacion && (
            <span className={`pronostico-puntos puntos-${puntuacion.puntos}`}>
              {puntuacion.puntos === 3 && '🎯'}
              {puntuacion.puntos === 1 && '✓'}
              {puntuacion.puntos === 0 && '✗'}
              {puntuacion.puntos} {puntuacion.puntos === 1 ? 'punto' : 'puntos'}
            </span>
          )}
        </div>
      ) : partido.estado !== 'programado' ? (
        <div className="pronostico-bloqueado">
          🔒 No se realizó pronóstico para este partido
        </div>
      ) : null}
    </div>
  );
}
