'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

// Credenciales de admin quemadas
const ADMIN_CORREO = 'andres@admin.com';
const ADMIN_PASSWORD = '1234';

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

export default function AdminPage() {
  const router = useRouter();
  // Admin auth gate — se resetea cada vez que se entra a /admin
  const [adminAutenticado, setAdminAutenticado] = useState(false);
  const [adminCorreo, setAdminCorreo] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [token, setToken] = useState('');
  const [resultados, setResultados] = useState<Record<number, { golesLocal: number; golesVisitante: number }>>({});
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState<number | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) {
      router.push('/');
      return;
    }
    setToken(t);
  }, [router]);

  useEffect(() => {
    if (!token || !adminAutenticado) return;
    fetchPartidos();
  }, [token, adminAutenticado]);

  function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setAdminError('');

    if (adminCorreo === ADMIN_CORREO && adminPassword === ADMIN_PASSWORD) {
      setAdminAutenticado(true);
    } else {
      setAdminError('Credenciales de administrador incorrectas.');
    }
  }

  async function fetchPartidos() {
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

                <button type="submit" className="btn btn-primary btn-block">
                  Acceder al Panel
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
        </div>
      </div>
    </>
  );
}

