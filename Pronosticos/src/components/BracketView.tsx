'use client';

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

interface BracketViewProps {
  bracket: Record<string, Llave[]>;
}

const RONDAS_ORDEN = ['R32', 'R16', 'QF', 'SF', 'FINAL'];
const RONDAS_NOMBRE: Record<string, string> = {
  R32: 'Dieciseisavos',
  R16: 'Octavos',
  QF: 'Cuartos',
  SF: 'Semifinales',
  '3RD': '3er Puesto',
  FINAL: 'Final',
};

function LlaveCard({ llave }: { llave: Llave }) {
  const p = llave.partido;
  const finalizado = p?.estado === 'finalizado';
  const gl = p?.golesLocalReal ?? null;
  const gv = p?.golesVisitanteReal ?? null;

  return (
    <div className="bracket-llave">
      <div className={`bracket-equipo ${finalizado && gl !== null && gv !== null && gl > gv ? 'ganador' : ''}`}>
        <span className="bracket-equipo-nombre">
          {llave.equipo1?.nombre || 'Por definir'}
        </span>
        {finalizado && gl !== null && (
          <span className="bracket-gol">{gl}</span>
        )}
      </div>
      <div className="bracket-separador" />
      <div className={`bracket-equipo ${finalizado && gv !== null && gl !== null && gv > gl ? 'ganador' : ''}`}>
        <span className="bracket-equipo-nombre">
          {llave.equipo2?.nombre || 'Por definir'}
        </span>
        {finalizado && gv !== null && (
          <span className="bracket-gol">{gv}</span>
        )}
      </div>
    </div>
  );
}

export default function BracketView({ bracket }: BracketViewProps) {
  if (!bracket || Object.keys(bracket).length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🏅</div>
        <h3>Bracket no disponible</h3>
        <p>El bracket se generará cuando se completen los datos necesarios.</p>
      </div>
    );
  }

  // Separar 3er puesto del bracket principal
  const tercer = bracket['3RD'] || [];

  return (
    <div className="bracket-wrapper">
      <div className="bracket-container">
        {RONDAS_ORDEN.map((ronda) => {
          const llaves = bracket[ronda] || [];
          if (llaves.length === 0) return null;

          return (
            <div key={ronda} className="bracket-ronda">
              <div className="bracket-ronda-titulo">{RONDAS_NOMBRE[ronda] || ronda}</div>
              <div className="bracket-ronda-llaves">
                {llaves.map((llave) => (
                  <LlaveCard key={llave.id} llave={llave} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {tercer.length > 0 && (
        <div className="bracket-tercer-puesto">
          <div className="bracket-ronda-titulo">🥉 Tercer Puesto</div>
          {tercer.map((llave) => (
            <LlaveCard key={llave.id} llave={llave} />
          ))}
        </div>
      )}
    </div>
  );
}
