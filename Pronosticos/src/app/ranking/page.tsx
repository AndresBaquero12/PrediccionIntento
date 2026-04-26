'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import RankingTable from '@/components/RankingTable';

interface RankingItem {
  posicion: number;
  id: number;
  nombreUsuario: string;
  puntosTotal: number;
  partidosPronosticados: number;
}

export default function RankingPage() {
  const router = useRouter();
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [userId, setUserId] = useState<number | undefined>();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    const stored = localStorage.getItem('usuario');
    if (stored) {
      setUserId(JSON.parse(stored).id);
    }

    fetchRanking();
  }, [router]);

  async function fetchRanking() {
    try {
      const res = await fetch('/api/ranking');
      const data = await res.json();
      setRanking(Array.isArray(data) ? data : []);
    } catch {
      console.error('Error cargando ranking');
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
            <h1>🏆 Ranking General</h1>
            <p>Clasificación de todos los participantes ordenados por puntos acumulados.</p>
          </div>

          <div className="glass-card animate-fade-in">
            {cargando ? (
              <div className="loader">
                <div className="spinner" />
              </div>
            ) : (
              <RankingTable ranking={ranking} currentUserId={userId} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
