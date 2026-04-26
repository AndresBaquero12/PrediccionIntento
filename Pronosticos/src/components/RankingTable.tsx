'use client';

interface RankingItem {
  posicion: number;
  id: number;
  nombreUsuario: string;
  puntosTotal: number;
  partidosPronosticados: number;
}

interface RankingTableProps {
  ranking: RankingItem[];
  currentUserId?: number;
}

export default function RankingTable({ ranking, currentUserId }: RankingTableProps) {
  if (ranking.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🏆</div>
        <h3>Sin datos de ranking</h3>
        <p>El ranking aparecerá cuando haya partidos finalizados con pronósticos.</p>
      </div>
    );
  }

  return (
    <table className="ranking-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Usuario</th>
          <th>Puntos</th>
          <th>Pronósticos</th>
        </tr>
      </thead>
      <tbody className="stagger">
        {ranking.map((item) => (
          <tr
            key={item.id}
            style={item.id === currentUserId ? { outline: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-md)' } : {}}
          >
            <td>
              <span className={`ranking-posicion ${item.posicion <= 3 ? `top-${item.posicion}` : ''}`}>
                {item.posicion === 1 && '🥇 '}
                {item.posicion === 2 && '🥈 '}
                {item.posicion === 3 && '🥉 '}
                {item.posicion}
              </span>
            </td>
            <td>
              <span style={{ fontWeight: item.id === currentUserId ? 700 : 400 }}>
                {item.nombreUsuario}
                {item.id === currentUserId && <span style={{ color: 'var(--accent-primary)', marginLeft: '0.5rem', fontSize: '0.75rem' }}>(tú)</span>}
              </span>
            </td>
            <td>
              <span className="ranking-puntos">{item.puntosTotal}</span>
            </td>
            <td style={{ color: 'var(--text-secondary)' }}>
              {item.partidosPronosticados}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
