'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Usuario {
  id: number;
  nombreUsuario: string;
  correo: string;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [puntosTotal, setPuntosTotal] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('usuario');
    if (stored) {
      setUsuario(JSON.parse(stored));
    }

    // Obtener puntos del ranking
    fetchPuntos();
  }, []);

  async function fetchPuntos() {
    try {
      const res = await fetch('/api/ranking');
      const ranking = await res.json();
      const stored = localStorage.getItem('usuario');
      if (stored) {
        const u = JSON.parse(stored);
        const miRanking = ranking.find((r: { id: number }) => r.id === u.id);
        if (miRanking) setPuntosTotal(miRanking.puntosTotal);
      }
    } catch {
      // Silenciar error
    }
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    router.push('/');
  }

  const links = [
    { href: '/dashboard', label: '🏟️ Partidos' },
    { href: '/ranking', label: '🏆 Ranking' },
    { href: '/admin', label: '⚙️ Admin' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand" onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer' }}>
          ⚽ <span>Mundial 2026</span>
        </div>

        <div className="navbar-links">
          {links.map((link) => (
            <button
              key={link.href}
              className={`navbar-link ${pathname === link.href ? 'active' : ''}`}
              onClick={() => router.push(link.href)}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="navbar-user">
          <div className="navbar-points">
            ⭐ {puntosTotal} pts
          </div>
          {usuario && (
            <span className="navbar-user-name">{usuario.nombreUsuario}</span>
          )}
          <button className="btn btn-sm btn-secondary" onClick={logout}>
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
}
