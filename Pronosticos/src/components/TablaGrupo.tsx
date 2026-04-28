'use client';

import { useState } from 'react';

interface StatsEquipo {
  equipo: { id: number; nombre: string; pais: string };
  posicion: number;
  pj: number;
  g: number;
  e: number;
  p: number;
  gf: number;
  dif: number;
  pts: number;
  grupo: string;
}

interface TablaGrupoProps {
  grupo: string;
  clasificacion: StatsEquipo[];
  adminMode?: boolean;
  token?: string;
  onOrdenActualizado?: () => void;
}

export default function TablaGrupo({
  grupo,
  clasificacion,
  adminMode = false,
  token,
  onOrdenActualizado,
}: TablaGrupoProps) {
  const [items, setItems] = useState<StatsEquipo[]>(clasificacion);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  function moverEquipo(index: number, direccion: 'arriba' | 'abajo') {
    const newIndex = direccion === 'arriba' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[newIndex];
    newItems[newIndex] = temp;

    // Reasignar posiciones
    const updated = newItems.map((item, i) => ({ ...item, posicion: i + 1 }));
    setItems(updated);
  }

  async function guardarOrden() {
    if (!token) return;
    setGuardando(true);
    setMensaje('');

    try {
      const orden = items.map(i => i.equipo.id);
      const res = await fetch(`/api/admin/clasificacion/${grupo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orden }),
      });

      if (res.ok) {
        setMensaje('✓ Orden guardado');
        setTimeout(() => setMensaje(''), 2000);
        onOrdenActualizado?.();
      } else {
        const data = await res.json();
        setMensaje(data.error || 'Error al guardar');
      }
    } catch {
      setMensaje('Error de conexión');
    } finally {
      setGuardando(false);
    }
  }

  function getRowClass(posicion: number) {
    if (posicion <= 2) return 'clasificado-directo';
    if (posicion === 3) return 'posible-clasificado';
    return '';
  }

  return (
    <div className="tabla-grupo-container">
      <div className="tabla-grupo-header">
        <span className="tabla-grupo-letra">Grupo {grupo}</span>
        {adminMode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {mensaje && (
              <span style={{ fontSize: '0.75rem', color: mensaje.includes('Error') ? 'var(--accent-danger)' : 'var(--accent-primary)' }}>
                {mensaje}
              </span>
            )}
            <button
              className="btn btn-primary btn-sm"
              onClick={guardarOrden}
              disabled={guardando}
            >
              {guardando ? '...' : '💾 Guardar orden'}
            </button>
          </div>
        )}
      </div>

      <div className="tabla-grupo-scroll">
        <table className="tabla-grupo">
          <thead>
            <tr>
              {adminMode && <th></th>}
              <th>Pos</th>
              <th>Equipo</th>
              <th>PJ</th>
              <th>G</th>
              <th>E</th>
              <th>P</th>
              <th>GF</th>
              <th>DIF</th>
              <th>PTS</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.equipo.id} className={getRowClass(item.posicion)}>
                {adminMode && (
                  <td className="admin-flechas-cell">
                    <button
                      className="admin-flecha"
                      onClick={() => moverEquipo(index, 'arriba')}
                      disabled={index === 0}
                      title="Mover arriba"
                    >
                      ▲
                    </button>
                    <button
                      className="admin-flecha"
                      onClick={() => moverEquipo(index, 'abajo')}
                      disabled={index === items.length - 1}
                      title="Mover abajo"
                    >
                      ▼
                    </button>
                  </td>
                )}
                <td className="tabla-grupo-pos">
                  <span className={`pos-badge pos-${item.posicion}`}>{item.posicion}</span>
                </td>
                <td className="tabla-grupo-equipo">{item.equipo.nombre}</td>
                <td>{item.pj}</td>
                <td>{item.g}</td>
                <td>{item.e}</td>
                <td>{item.p}</td>
                <td>{item.gf}</td>
                <td className={item.dif > 0 ? 'stat-positive' : item.dif < 0 ? 'stat-negative' : ''}>
                  {item.dif > 0 ? `+${item.dif}` : item.dif}
                </td>
                <td className="tabla-grupo-pts">{item.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="tabla-grupo-legend">
        <span className="legend-item">
          <span className="legend-dot clasificado-dot"></span> Clasificado directo
        </span>
        <span className="legend-item">
          <span className="legend-dot posible-dot"></span> Posible clasificado
        </span>
      </div>
    </div>
  );
}
