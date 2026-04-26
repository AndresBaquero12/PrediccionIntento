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
      // Cargar partidos del grupo
      const resPartidos = await fetch(`/api/partidos?grupo=${grupoActual}`);
      const dataPartidos = await resPartidos.json();
      setPartidos(Array.isArray(dataPartidos) ? dataPartidos : []);

      // Cargar pronósticos del usuario
      const resPronosticos = await fetch('/api/pronosticos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataPronosticos = await resPronosticos.json();
      setPronosticos(Array.isArray(dataPronosticos) ? dataPronosticos : []);

      // Cargar puntuaciones del ranking
      const resRanking = await fetch('/api/ranking');
      const dataRanking = await resRanking.json();
      // No necesitamos puntuaciones individuales del ranking endpoint
      // Las puntuaciones vienen en los pronósticos si se agregan

    } catch {
      console.error('Error cargando datos');
    } finally {
      setCargando(false);
    }
  }, [grupoActual, token]);

  // Cargar puntuaciones individuales
  useEffect(() => {
    if (!token) return;
    const fetchPuntuaciones = async () => {
      try {
        // Las puntuaciones las obtenemos de los pronósticos del usuario
        // La tabla Puntuacion se consulta indirectamente
        const res = await fetch('/api/pronosticos', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          // puntuaciones se manejan por separado si hay un endpoint
        }
      } catch {
        // silenciar
      }
    };
    fetchPuntuaciones();
  }, [token]);

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
    const p = pronosticos.find((pr: Pronostico & { partido?: { id: number }; idPartido?: number }) =>
      (pr.idPartido === idPartido) || (pr.partido && (pr.partido as { id: number }).id === idPartido)
    );
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
                  puntuacion={null}
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
