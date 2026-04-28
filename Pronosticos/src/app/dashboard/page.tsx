'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import GrupoSelector from '@/components/GrupoSelector';
import PartidoCard from '@/components/PartidoCard';

interface Equipo {
  id: number;
  nombre: string;
  pais: string;
}

interface Partido {
  id: number;
  equipoLocal: Equipo;
  equipoVisitante: Equipo;
  fechaInicio: string | null;
  estado: string;
  golesLocalReal: number | null;
  golesVisitanteReal: number | null;
}

interface Pronostico {
  idPartido: number;
  golesLocalPredicho: number;
  golesVisitantePredicho: number;
  partido?: { id: number };
}

interface Puntuacion {
  idPartido: number;
  puntos: number;
  detalle: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [grupoActual, setGrupoActual] = useState('A');
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [pronosticos, setPronosticos] = useState<Pronostico[]>([]);
  const [puntuaciones, setPuntuaciones] = useState<Puntuacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [token, setToken] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) {
      router.push('/');
      return;
    }
    setToken(t);
  }, [router]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setCargando(true);
    try {
      // Cargar partidos del grupo, pronósticos y puntuaciones en paralelo
      const [resPartidos, resPronosticos, resPuntuaciones] = await Promise.all([
        fetch(`/api/partidos?grupo=${grupoActual}`),
        fetch('/api/pronosticos', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/puntuaciones', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const dataPartidos = await resPartidos.json();
      setPartidos(Array.isArray(dataPartidos) ? dataPartidos : []);

      const dataPronosticos = await resPronosticos.json();
      setPronosticos(Array.isArray(dataPronosticos) ? dataPronosticos : []);

      const dataPuntuaciones = await resPuntuaciones.json();
      setPuntuaciones(Array.isArray(dataPuntuaciones) ? dataPuntuaciones : []);
    } catch {
      console.error('Error cargando datos');
    } finally {
      setCargando(false);
    }
  }, [grupoActual, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleGuardarPronostico(idPartido: number, golesLocal: number, golesVisitante: number) {
    const res = await fetch('/api/pronosticos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ idPartido, golesLocal, golesVisitante }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Error al guardar pronóstico');
    }

    // Refrescar pronósticos
    const resPronosticos = await fetch('/api/pronosticos', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const dataPronosticos = await resPronosticos.json();
    setPronosticos(Array.isArray(dataPronosticos) ? dataPronosticos : []);
  }

  function getPronosticoPartido(idPartido: number) {
    const p = pronosticos.find((pr) =>
      (pr.idPartido === idPartido) || (pr.partido && pr.partido.id === idPartido)
    );
    return p || null;
  }

  function getPuntuacionPartido(idPartido: number) {
    const p = puntuaciones.find((pu) => pu.idPartido === idPartido);
    return p || null;
  }

  return (
    <>
      <Navbar />
      <div className="page-content">
        <div className="container">
          <div className="dashboard-header animate-fade-in">
            <h1>🏟️ Partidos del Mundial</h1>
            <p>Selecciona un grupo y realiza tus pronósticos antes de que inicien los partidos.</p>
          </div>

          <div className="section-header">
            <GrupoSelector grupoActual={grupoActual} onGrupoChange={setGrupoActual} />
          </div>

          {cargando ? (
            <div className="loader">
              <div className="spinner" />
            </div>
          ) : partidos.length === 0 ? (
            <div className="empty-state animate-fade-in">
              <div className="empty-state-icon">📭</div>
              <h3>No hay partidos en el Grupo {grupoActual}</h3>
              <p>Intenta seleccionar otro grupo o ejecuta el seed de la base de datos.</p>
            </div>
          ) : (
            <div className="partidos-grid stagger">
              {partidos.map((partido) => (
                <PartidoCard
                  key={partido.id}
                  partido={partido}
                  pronostico={getPronosticoPartido(partido.id)}
                  puntuacion={getPuntuacionPartido(partido.id)}
                  onGuardarPronostico={handleGuardarPronostico}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
