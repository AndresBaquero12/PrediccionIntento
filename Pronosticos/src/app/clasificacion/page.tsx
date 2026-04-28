'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import TablaGrupo from '@/components/TablaGrupo';

interface StatsEquipo {
  equipo: { id: number; nombre: string; pais: string };
  posicion: number;
  pj: number; g: number; e: number; p: number;
  gf: number; dif: number; pts: number;
  grupo: string;
}

interface GrupoClasificacion {
  grupo: string;
  clasificacion: StatsEquipo[];
  todosFinalizados: boolean;
}

export default function ClasificacionPage() {
  const router = useRouter();
  const [grupos, setGrupos] = useState<GrupoClasificacion[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    fetchClasificacion();
  }, [router]);

  async function fetchClasificacion() {
    try {
      // Una sola request para todos los grupos (en vez de 12 paralelas)
      const res = await fetch('/api/clasificacion');
      const data = await res.json();
      setGrupos(Array.isArray(data) ? data : []);
    } catch {
      console.error('Error cargando clasificación');
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="page-content">
        <div className="container">
          <div className="dashboard-header animate-fade-in">
            <h1>📊 Clasificación por Grupos</h1>
            <p>Tabla de posiciones de cada grupo basada en los resultados de la fase de grupos.</p>
          </div>

          {cargando ? (
            <div className="loader">
              <div className="spinner" />
            </div>
          ) : grupos.length === 0 ? (
            <div className="empty-state animate-fade-in">
              <div className="empty-state-icon">📭</div>
              <h3>Sin datos de clasificación</h3>
              <p>Ejecuta el seed y finaliza partidos para ver la clasificación.</p>
            </div>
          ) : (
            <div className="clasificacion-grid stagger">
              {grupos.map((g) => (
                <TablaGrupo
                  key={g.grupo}
                  grupo={g.grupo}
                  clasificacion={g.clasificacion}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
