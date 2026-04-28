'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Equipo {
  id: number;
  nombre: string;
  pais: string;
}

interface Grupo {
  id: number;
  letra: string;
  descripcion: string | null;
  equipos: Equipo[];
}

// Banderas emoji por país (mapa estático para display)
// Cubre los 48 equipos del sorteo oficial FIFA 2026
const banderas: Record<string, string> = {
  // Grupo A
  'México': '🇲🇽', 'Sudáfrica': '🇿🇦', 'República de Corea': '🇰🇷', 'Chequia': '🇨🇿',
  // Grupo B
  'Canadá': '🇨🇦', 'Bosnia y Herzegovina': '🇧🇦', 'Catar': '🇶🇦', 'Suiza': '🇨🇭',
  // Grupo C
  'Brasil': '🇧🇷', 'Marruecos': '🇲🇦', 'Haití': '🇭🇹', 'Escocia': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  // Grupo D
  'Estados Unidos': '🇺🇸', 'Paraguay': '🇵🇾', 'Australia': '🇦🇺', 'Turquía': '🇹🇷',
  // Grupo E
  'Alemania': '🇩🇪', 'Curazao': '🇨🇼', 'Costa de Marfil': '🇨🇮', 'Ecuador': '🇪🇨',
  // Grupo F
  'Países Bajos': '🇳🇱', 'Japón': '🇯🇵', 'Suecia': '🇸🇪', 'Túnez': '🇹🇳',
  // Grupo G
  'Bélgica': '🇧🇪', 'Egipto': '🇪🇬', 'RI de Irán': '🇮🇷', 'Nueva Zelanda': '🇳🇿',
  // Grupo H
  'España': '🇪🇸', 'Islas de Cabo Verde': '🇨🇻', 'Arabia Saudí': '🇸🇦', 'Uruguay': '🇺🇾',
  // Grupo I
  'Francia': '🇫🇷', 'Senegal': '🇸🇳', 'Irak': '🇮🇶', 'Noruega': '🇳🇴',
  // Grupo J
  'Argentina': '🇦🇷', 'Argelia': '🇩🇿', 'Austria': '🇦🇹', 'Jordania': '🇯🇴',
  // Grupo K
  'Portugal': '🇵🇹', 'RD Congo': '🇨🇩', 'Uzbekistán': '🇺🇿', 'Colombia': '🇨🇴',
  // Grupo L
  'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Croacia': '🇭🇷', 'Ghana': '🇬🇭', 'Panamá': '🇵🇦',
};

export default function AuthPage() {
  const router = useRouter();
  const [modo, setModo] = useState<'login' | 'registro'>('login');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [cargandoGrupos, setCargandoGrupos] = useState(true);

  // Cargar grupos desde la BD
  useEffect(() => {
    async function fetchGrupos() {
      try {
        const res = await fetch('/api/grupos');
        const data = await res.json();
        setGrupos(Array.isArray(data) ? data : []);
      } catch {
        console.error('Error cargando grupos');
      } finally {
        setCargandoGrupos(false);
      }
    }
    fetchGrupos();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const url = modo === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = modo === 'login'
        ? { correo, password }
        : { nombreUsuario, correo, password };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error desconocido');
        return;
      }

      // Guardar token y datos del usuario
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

      // Redirigir al dashboard
      router.push('/dashboard');
    } catch {
      setError('Error de conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="landing-page">
      {/* ─── Hero Section: Auth + Título ─── */}
      <section className="auth-container">
        <div className="auth-card animate-fade-in">
          <h1 className="auth-title">
            ⚽ <span>Mundial 2026</span>
          </h1>
          <p className="auth-subtitle">Predicciones en tiempo real</p>

          {/* Tabs Login / Registro */}
          <div className="tabs" style={{ marginBottom: '1.5rem' }}>
            <button
              className={`tab ${modo === 'login' ? 'active' : ''}`}
              onClick={() => { setModo('login'); setError(''); }}
              style={{ flex: 1 }}
            >
              Iniciar Sesión
            </button>
            <button
              className={`tab ${modo === 'registro' ? 'active' : ''}`}
              onClick={() => { setModo('registro'); setError(''); }}
              style={{ flex: 1 }}
            >
              Registrarse
            </button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            {modo === 'registro' && (
              <div className="input-group">
                <label htmlFor="nombreUsuario">Nombre de usuario</label>
                <input
                  id="nombreUsuario"
                  className="input"
                  type="text"
                  placeholder="Ej: juanperez"
                  value={nombreUsuario}
                  onChange={(e) => setNombreUsuario(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="input-group">
              <label htmlFor="correo">Correo electrónico</label>
              <input
                id="correo"
                className="input"
                type="email"
                placeholder="correo@ejemplo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                className="input"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={cargando}
            >
              {cargando ? 'Procesando...' : modo === 'login' ? 'Entrar' : 'Crear Cuenta'}
            </button>
          </form>

          <div className="auth-footer">
            {modo === 'login' ? (
              <>
                ¿No tienes cuenta?{' '}
                <button onClick={() => { setModo('registro'); setError(''); }}>
                  Regístrate
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{' '}
                <button onClick={() => { setModo('login'); setError(''); }}>
                  Inicia sesión
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─── Sección: Grupos del Mundial ─── */}
      <section className="grupos-section">
        <div className="container">
          <div className="grupos-header animate-fade-in">
            <h2>🏆 Fase de Grupos — Mundial 2026</h2>
            <p>48 selecciones en 12 grupos. Regístrate y pronostica quién avanzará.</p>
          </div>

          {cargandoGrupos ? (
            <div className="loader">
              <div className="spinner" />
            </div>
          ) : grupos.length === 0 ? (
            <div className="empty-state animate-fade-in">
              <div className="empty-state-icon">📭</div>
              <h3>No hay datos de grupos</h3>
              <p>Ejecuta el seed de la base de datos para poblar los grupos.</p>
            </div>
          ) : (
            <div className="grupos-grid stagger">
              {grupos.map((grupo) => (
                <div key={grupo.letra} className="grupo-card glass-card">
                  <div className="grupo-card-header">
                    <span className="grupo-card-letra">Grupo {grupo.letra}</span>
                    <span className="grupo-card-badge">{grupo.equipos.length} equipos</span>
                  </div>

                  <ul className="grupo-card-equipos">
                    {grupo.equipos.map((equipo) => (
                      <li key={equipo.id} className="grupo-card-equipo">
                        <span className="equipo-bandera">{banderas[equipo.nombre] || '🏳️'}</span>
                        <span className="equipo-nombre">{equipo.nombre}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
