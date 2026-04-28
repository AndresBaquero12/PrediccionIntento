'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BracketView from '@/components/BracketView';

interface Equipo {
  id: number;
  nombre: string;
  pais: string;
}

interface Llave {
  id: number;
  ronda: string;
  posicion: number;
  equipo1: Equipo | null;
  equipo2: Equipo | null;
  partido: {
    estado: string;
    golesLocalReal: number | null;
    golesVisitanteReal: number | null;
  } | null;
}

type BracketData = Record<string, Llave[]>;

export default function BracketPage() {
  const router = useRouter();
  const [bracket, setBracket] = useState<BracketData>({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    fetchBracket();
  }, [router]);

  async function fetchBracket() {
    try {
      const res = await fetch('/api/llaves');
      const data = await res.json();
      setBracket(data.error ? {} : data);
    } catch {
      console.error('Error cargando bracket');
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
            <h1>🏅 Bracket Eliminatorio</h1>
            <p>Visualización de las llaves del torneo desde dieciseisavos hasta la final.</p>
          </div>

          {cargando ? (
            <div className="loader">
              <div className="spinner" />
            </div>
          ) : (
            <div className="animate-fade-in">
              <BracketView bracket={bracket} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

