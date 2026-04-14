"use client";

import { useEffect, useState, useTransition } from "react";

interface Team {
  id: string;
  name: string;
  countryCode: string;
  group: string;
}

interface Match {
  id: string;
  group: string;
  homeTeam: Team;
  awayTeam: Team;
  isFinished: boolean;
  realHomeGoals: number;
  realAwayGoals: number;
  predictions: { id: string; userId: string; homeGoals: number; awayGoals: number; pointsEarned: number }[];
}

export default function AdminPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadMatches();
  }, []);

  function loadMatches() {
    fetch("/api/matches")
      .then((r) => r.json())
      .then(setMatches);
  }

  function handleResolve(matchId: string, homeGoals: string, awayGoals: string) {
    startTransition(async () => {
      const res = await fetch("/api/matches/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          realHomeGoals: parseInt(homeGoals),
          realAwayGoals: parseInt(awayGoals),
        }),
      });
      if (res.ok) {
        setMessage("✅ Partido resuelto y puntos calculados.");
        loadMatches();
      } else {
        setMessage("❌ Error al resolver el partido.");
      }
      setTimeout(() => setMessage(""), 3000);
    });
  }

  async function handleSeed() {
    setMessage("⏳ Cargando equipos y partidos de ejemplo...");
    const res = await fetch("/api/seed", { method: "POST" });
    if (res.ok) {
      setMessage("✅ Datos de ejemplo cargados exitosamente.");
      loadMatches();
    } else {
      const data = await res.json();
      setMessage(`❌ ${data.error || "Error al cargar datos."}`);
    }
    setTimeout(() => setMessage(""), 4000);
  }

  const pendingMatches = matches.filter((m) => !m.isFinished);
  const finishedMatches = matches.filter((m) => m.isFinished);

  return (
    <div className="dashboard-layout">
      <div className="header-nav">
        <h1 className="title"><span>Admin</span> Panel</h1>
        <button className="primary-btn" style={{ padding: "0.6rem 1.2rem", fontSize: "0.85rem" }} onClick={handleSeed}>
          🌱 Cargar Datos de Ejemplo
        </button>
      </div>

      {message && (
        <div style={{
          background: "rgba(102,252,241,0.1)",
          border: "1px solid var(--secondary)",
          borderRadius: "10px",
          padding: "1rem",
          marginBottom: "1.5rem",
          color: "var(--secondary)",
          textAlign: "center",
        }}>
          {message}
        </div>
      )}

      <h2 style={{ color: "var(--secondary)", marginBottom: "1rem" }}>
        Partidos Pendientes ({pendingMatches.length})
      </h2>
      <div className="match-list">
        {pendingMatches.map((match) => (
          <div className="match-card" key={match.id}>
            <div className="match-header">
              <span>Grupo {match.group}</span>
              <span>{match.predictions.length} pronósticos recibidos</span>
            </div>
            <div className="match-teams">
              <div className="team">{match.homeTeam.name}</div>
              <span className="vs">vs</span>
              <div className="team away">{match.awayTeam.name}</div>
            </div>
            <form
              className="prediction-form"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const hg = (form.elements.namedItem("hg") as HTMLInputElement).value;
                const ag = (form.elements.namedItem("ag") as HTMLInputElement).value;
                handleResolve(match.id, hg, ag);
              }}
            >
              <input type="number" name="hg" min="0" max="20" className="score-input" defaultValue={0} disabled={isPending} />
              <span className="vs">-</span>
              <input type="number" name="ag" min="0" max="20" className="score-input" defaultValue={0} disabled={isPending} />
              <button type="submit" className="primary-btn" style={{ padding: "0.8rem 1.5rem", fontSize: "0.9rem" }} disabled={isPending}>
                Finalizar
              </button>
            </form>
          </div>
        ))}
        {pendingMatches.length === 0 && (
          <p style={{ color: "var(--text-muted)", textAlign: "center" }}>No hay partidos pendientes.</p>
        )}
      </div>

      <h2 style={{ color: "var(--text-muted)", margin: "2.5rem 0 1rem" }}>
        Partidos Finalizados ({finishedMatches.length})
      </h2>
      <div className="match-list">
        {finishedMatches.map((match) => (
          <div className="match-card" key={match.id} style={{ opacity: 0.6 }}>
            <div className="match-header">
              <span>Grupo {match.group}</span>
              <span className="points-badge">Finalizado</span>
            </div>
            <div className="match-teams">
              <div className="team">{match.homeTeam.name}</div>
              <span style={{ color: "var(--secondary)", fontSize: "2rem", fontWeight: 800 }}>
                {match.realHomeGoals} - {match.realAwayGoals}
              </span>
              <div className="team away">{match.awayTeam.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
