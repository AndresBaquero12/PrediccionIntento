'use client';

interface GrupoSelectorProps {
  grupoActual: string;
  onGrupoChange: (grupo: string) => void;
}

const GRUPOS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

export default function GrupoSelector({ grupoActual, onGrupoChange }: GrupoSelectorProps) {
  return (
    <div className="grupo-selector">
      {GRUPOS.map((grupo) => (
        <button
          key={grupo}
          className={`grupo-tab ${grupoActual === grupo ? 'active' : ''}`}
          onClick={() => onGrupoChange(grupo)}
        >
          Grupo {grupo}
        </button>
      ))}
    </div>
  );
}
