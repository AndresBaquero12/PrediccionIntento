'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Datos de los 12 grupos del Mundial 2026 — Fase 1
const grupos = [
  {
    letra: 'A',
    equipos: ['México', 'Sudáfrica', 'Rep. de Corea', 'Chequia'],
    favorito: 'México',
    revelacion: 'Chequia',
  },
  {
    letra: 'B',
    equipos: ['Canadá', 'Bosnia y Herz.', 'Catar', 'Suiza'],
    favorito: 'Suiza',
    revelacion: 'Canadá',
  },
  {
    letra: 'C',
    equipos: ['Brasil', 'Marruecos', 'Haití', 'Escocia'],
    favorito: 'Brasil',
    revelacion: 'Marruecos',
  },
  {
    letra: 'D',
    equipos: ['EE. UU.', 'Paraguay', 'Australia', 'Turquía'],
    favorito: 'EE. UU.',
    revelacion: 'Turquía',
  },
  {
    letra: 'E',
    equipos: ['Alemania', 'Curazao', 'Costa de Marfil', 'Ecuador'],
    favorito: 'Alemania',
    revelacion: 'Ecuador',
  },
  {
    letra: 'F',
    equipos: ['Países Bajos', 'Japón', 'Suecia', 'Túnez'],
    favorito: 'Países Bajos',
    revelacion: 'Japón',
  },
  {
    letra: 'G',
    equipos: ['Bélgica', 'Egipto', 'RI de Irán', 'Nueva Zelanda'],
    favorito: 'Bélgica',
    revelacion: 'Egipto',
  },
  {
    letra: 'H',
    equipos: ['España', 'Cabo Verde', 'Arabia Saudí', 'Uruguay'],
    favorito: 'España',
    revelacion: 'Uruguay',
  },
  {
    letra: 'I',
    equipos: ['Francia', 'Senegal', 'Irak', 'Noruega'],
    favorito: 'Francia',
    revelacion: 'Senegal',
  },
  {
    letra: 'J',
    equipos: ['Argentina', 'Argelia', 'Austria', 'Jordania'],
    favorito: 'Argentina',
    revelacion: 'Austria',
  },
  {
    letra: 'K',
    equipos: ['Portugal', 'RD Congo', 'Uzbekistán', 'Colombia'],
    favorito: 'Portugal',
    revelacion: 'Colombia',
  },
  {
    letra: 'L',
    equipos: ['Inglaterra', 'Croacia', 'Ghana', 'Panamá'],
    favorito: 'Inglaterra',
    revelacion: 'Croacia',
  },
];

// Banderas emoji por país (aproximaciones)
const banderas: Record<string, string> = {
  'México': '🇲🇽', 'Sudáfrica': '🇿🇦', 'Rep. de Corea': '🇰🇷', 'Chequia': '🇨🇿',
  'Canadá': '🇨🇦', 'Bosnia y Herz.': '🇧🇦', 'Catar': '🇶🇦', 'Suiza': '🇨🇭',
  'Brasil': '🇧🇷', 'Marruecos': '🇲🇦', 'Haití': '🇭🇹', 'Escocia': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'EE. UU.': '🇺🇸', 'Paraguay': '🇵🇾', 'Australia': '🇦🇺', 'Turquía': '🇹🇷',
  'Alemania': '🇩🇪', 'Curazao': '🇨🇼', 'Costa de Marfil': '🇨🇮', 'Ecuador': '🇪🇨',
  'Países Bajos': '🇳🇱', 'Japón': '🇯🇵', 'Suecia': '🇸🇪', 'Túnez': '🇹🇳',
  'Bélgica': '🇧🇪', 'Egipto': '🇪🇬', 'RI de Irán': '🇮🇷', 'Nueva Zelanda': '🇳🇿',
  'España': '🇪🇸', 'Cabo Verde': '🇨🇻', 'Arabia Saudí': '🇸🇦', 'Uruguay': '🇺🇾',
  'Francia': '🇫🇷', 'Senegal': '🇸🇳', 'Irak': '🇮🇶', 'Noruega': '🇳🇴',
  'Argentina': '🇦🇷', 'Argelia': '🇩🇿', 'Austria': '🇦🇹', 'Jordania': '🇯🇴',
  'Portugal': '🇵🇹', 'RD Congo': '🇨🇩', 'Uzbekistán': '🇺🇿', 'Colombia': '🇨🇴',
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

          <div className="grupos-grid stagger">
            {grupos.map((grupo) => (
              <div key={grupo.letra} className="grupo-card glass-card">
                <div className="grupo-card-header">
                  <span className="grupo-card-letra">Grupo {grupo.letra}</span>
                  <span className="grupo-card-badge">0 PJ</span>
                </div>

                <ul className="grupo-card-equipos">
                  {grupo.equipos.map((equipo) => (
                    <li key={equipo} className="grupo-card-equipo">
                      <span className="equipo-bandera">{banderas[equipo] || '🏳️'}</span>
                      <span className="equipo-nombre">{equipo}</span>
                      {equipo === grupo.favorito && (
                        <span className="equipo-tag tag-favorito" title="Favorito">⭐</span>
                      )}
                      {equipo === grupo.revelacion && (
                        <span className="equipo-tag tag-revelacion" title="Revelación">🔥</span>
                      )}
                    </li>
                  ))}
                </ul>

                <div className="grupo-card-footer">
                  <span className="grupo-legend">
                    <span className="equipo-tag tag-favorito">⭐</span> Favorito
                  </span>
                  <span className="grupo-legend">
                    <span className="equipo-tag tag-revelacion">🔥</span> Revelación
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

