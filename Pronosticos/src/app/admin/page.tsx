'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import TablaGrupo from '@/components/TablaGrupo';

interface Equipo {
  id: number;
  nombre: string;
}

interface Partido {
  id: number;
  equipoLocal: Equipo;
  equipoVisitante: Equipo;
  fechaInicio: string | null;
  estado: string;
  fase: string;
  etapa: string | null;
  golesLocalReal: number | null;
  golesVisitanteReal: number | null;
}

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

interface GrupoClasificacion {
  grupo: string;
  clasificacion: StatsEquipo[];
}

export default function AdminPage() {
  const router = useRouter();
  // Admin auth gate — se resetea cada vez que se entra a /admin
  const [adminAutenticado, setAdminAutenticado] = useState(false);
  const [adminCorreo, setAdminCorreo] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminCargando, setAdminCargando] = useState(false);

  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [token, setToken] = useState('');
  const [resultados, setResultados] = useState<Record<number, { golesLocal: number; golesVisitante: number }>>({});
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState<number | null>(null);
  const [gruposClasificacion, setGruposClasificacion] = useState<GrupoClasificacion[]>([]);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) {
      router.push('/');
      return;
    }
    setToken(t);
  }, [router]);

  const fetchPartidos = useCallback(async () => {
    try {
      const res = await fetch('/api/partidos');
      const data = await res.json();
      // Filtrar solo pendientes y en_juego
      const pendientes = (Array.isArray(data) ? data : []).filter(
        (p: Partido) => p.estado !== 'finalizado'
      );
      setPartidos(pendientes);
    } catch {
      console.error('Error cargando partidos');
    } finally {
      setCargando(false);
    }
  }, []);

  const fetchClasificacion = useCallback(async () => {
    try {
      const res = await fetch('/api/clasificacion');
      const data = await res.json();
      setGruposClasificacion(Array.isArray(data) ? data : []);
    } catch { /* silenciar */ }
  }, []);

  useEffect(() => {
    if (!token || !adminAutenticado) return;
    fetchPartidos();
    fetchClasificacion();
  }, [token, adminAutenticado, fetchPartidos, fetchClasificacion]);

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setAdminError('');
    setAdminCargando(true);

    try {
      // Validar credenciales en el servidor (no en el cliente)
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: adminCorreo, password: adminPassword }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setAdminAutenticado(true);
      } else {
        setAdminError(data.error || 'Credenciales de administrador incorrectas.');
      }
    } catch {
      setAdminError('Error de conexión con el servidor.');
    } finally {
      setAdminCargando(false);
    }
  }

  function setResultado(idPartido: number, campo: 'golesLocal' | 'golesVisitante', valor: number) {
    setResultados((prev) => ({
      ...prev,
      [idPartido]: {
        ...prev[idPartido],
        golesLocal: prev[idPartido]?.golesLocal ?? 0,
        golesVisitante: prev[idPartido]?.golesVisitante ?? 0,
        [campo]: Math.max(0, valor),
      },
    }));
  }

  async function handleFinalizar(idPartido: number) {
    const res_data = resultados[idPartido];
    if (!res_data) {
      setError('Ingresa los goles antes de finalizar.');
      return;
    }

    setProcesando(idPartido);
    setMensaje('');
    setError('');

    try {
      const res = await fetch('/api/partidos/finalizar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          idPartido,
          golesLocal: res_data.golesLocal,
          golesVisitante: res_data.golesVisitante,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al finalizar partido');
        return;
      }

      setMensaje(data.mensaje);
      // Remover el partido de la lista
      setPartidos((prev) => prev.filter((p) => p.id !== idPartido));
      // Refrescar clasificación
      fetchClasificacion();
    } catch {
      setError('Error de conexión.');
    } finally {
      setProcesando(null);
    }
  }

  function formatFecha(fecha: string | null) {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // ─── Gate de admin: pedir credenciales antes de mostrar el panel ───
  if (!adminAutenticado) {
    return (
      <>
        <Navbar />
        <div className="page-content">
          <div className="auth-container" style={{ minHeight: 'calc(100vh - 5rem)' }}>
            <div className="auth-card animate-fade-in">
              <h1 className="auth-title" style={{ fontSize: '1.5rem' }}>
                🔒 <span>Acceso Admin</span>
              </h1>
              <p className="auth-subtitle">
                Ingresa las credenciales de administrador para continuar.
              </p>

              {adminError && <div className="alert alert-error">{adminError}</div>}

              <form className="auth-form" onSubmit={handleAdminLogin}>
                <div className="input-group">
                  <label htmlFor="adminCorreo">Correo de admin</label>
                  <input
                    id="adminCorreo"
                    className="input"
                    type="email"
                    placeholder="admin@correo.com"
                    value={adminCorreo}
                    onChange={(e) => setAdminCorreo(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="adminPassword">Contraseña de admin</label>
                  <input
                    id="adminPassword"
                    className="input"
                    type="password"
                    placeholder="Contraseña"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={adminCargando}
                >
                  {adminCargando ? 'Verificando...' : 'Acceder al Panel'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ─── Panel admin (solo si está autenticado) ───
  return (
    <>
      <Navbar />
      <div className="page-content">
        <div className="container">
          <div className="dashboard-header animate-fade-in">
            <h1>⚙️ Panel Administrativo</h1>
            <p>Ingresa los resultados reales de los partidos para calcular los puntos de los participantes.</p>
          </div>

          {mensaje && <div className="alert alert-success animate-fade-in">{mensaje}</div>}
          {error && <div className="alert alert-error animate-fade-in">{error}</div>}

          {cargando ? (
            <div className="loader">
              <div className="spinner" />
            </div>
          ) : partidos.length === 0 ? (
            <div className="empty-state animate-fade-in">
              <div className="empty-state-icon">✅</div>
              <h3>Todos los partidos están finalizados</h3>
              <p>No hay partidos pendientes por registrar.</p>
            </div>
          ) : (
            <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {partidos.map((partido) => (
                <div key={partido.id} className="admin-card">
                  <div className="admin-card-info">
                    <h3>
                      {partido.equipoLocal.nombre} vs {partido.equipoVisitante.nombre}
                    </h3>
                    <p>
                      {partido.fase === 'eliminatoria' ? `Eliminatoria - ${partido.etapa}` : 'Fase de Grupos'} · {formatFecha(partido.fechaInicio)}
                    </p>
                  </div>
                  <div className="admin-inputs">
                    <input
                      className="input input-score"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={resultados[partido.id]?.golesLocal ?? ''}
                      onChange={(e) => setResultado(partido.id, 'golesLocal', parseInt(e.target.value) || 0)}
                    />
                    <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>-</span>
                    <input
                      className="input input-score"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={resultados[partido.id]?.golesVisitante ?? ''}
                      onChange={(e) => setResultado(partido.id, 'golesVisitante', parseInt(e.target.value) || 0)}
                    />
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleFinalizar(partido.id)}
                      disabled={procesando === partido.id}
                    >
                      {procesando === partido.id ? '...' : 'Finalizar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─── Sección: Clasificación de Grupos con override manual ─── */}
          <div className="dashboard-header" style={{ marginTop: '3rem' }}>
            <h2>📊 Clasificación por Grupos</h2>
            <p>Usa las flechas para ajustar manualmente el orden de clasificación de cada grupo.</p>
          </div>

          <div className="clasificacion-grid stagger">
            {gruposClasificacion.map((g) => (
              <TablaGrupo
                key={g.grupo}
                grupo={g.grupo}
                clasificacion={g.clasificacion}
                adminMode={true}
                token={token}
                onOrdenActualizado={() => fetchClasificacion()}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
