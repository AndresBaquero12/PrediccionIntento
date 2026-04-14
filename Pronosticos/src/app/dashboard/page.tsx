"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition, Suspense } from "react";

interface Team {
  id: string;
  name: string;
  countryCode: string;
  group: string;
}

interface Prediction {
  id: string;
  userId: string;
  homeGoals: number;
  awayGoals: number;
  pointsEarned: number;
}

interface Match {
  id: string;
  group: string;
  homeTeam: Team;
  awayTeam: Team;
  isFinished: boolean;
  realHomeGoals: number;
  realAwayGoals: number;
  predictions: Prediction[];
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "";
  const [matches, setMatches] = useState<Match[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetch("/api/matches")
      .then((res) => res.json())
      .then((data) => {
        setMatches(data);
        // Calculate total points for the user
        let pts = 0;
        for (const m of data) {
          for (const p of m.predictions) {
            if (p.userId === userId) pts += p.pointsEarned;
          }
        }
        setTotalPoints(pts);
      });
  }, [userId]);

  function handleSubmit(matchId: string, homeGoals: string, awayGoals: string) {
    startTransition(async () => {
      await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          matchId,
          homeGoals: parseInt(homeGoals),
          awayGoals: parseInt(awayGoals),
        }),
      });
      // Reload matches
      const res = await fetch("/api/matches");
      const data = await res.json();
      setMatches(data);
    });
  }

  // Group matches by group letter
  const grouped: Record<string, Match[]> = {};
  for (const m of matches) {
    if (!grouped[m.group]) grouped[m.group] = [];
    grouped[m.group].push(m);
  }

  return (
    <div className="dashboard-layout">
      <div className="header-nav">
        <h1 className="title"><span>Pronósticos</span></h1>
        <div className="points-badge">⭐ {totalPoints} pts</div>
      </div>

      {Object.keys(grouped).length === 0 && (
        <p style={{ color: "var(--text-muted)", textAlign: "center", marginTop: "3rem" }}>
          No hay partidos cargados aún. Pide al admin que los agregue.
        </p>
      )}

      {Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([group, groupMatches]) => (
          <div key={group} style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ color: "var(--secondary)", marginBottom: "1rem", fontSize: "1.2rem" }}>
              Grupo {group}
            </h2>
            <div className="match-list">
              {groupMatches.map((match) => {
                const userPred = match.predictions.find((p) => p.userId === userId);
                return (
                  <div className="match-card" key={match.id}>
                    <div className="match-header">
                      <span>Grupo {match.group}</span>
                      {match.isFinished && <span className="points-badge">Finalizado</span>}
                    </div>
                    <div className="match-teams">
                      <div className="team">{match.homeTeam.name}</div>
                      {match.isFinished ? (
                        <span style={{ color: "var(--secondary)", fontSize: "2rem", fontWeight: 800 }}>
                          {match.realHomeGoals} - {match.realAwayGoals}
                        </span>
                      ) : (
                        <span className="vs">vs</span>
                      )}
                      <div className="team away">{match.awayTeam.name}</div>
                    </div>

                    {/* Prediction form or summary */}
                    {match.isFinished ? (
                      userPred ? (
                        <div className="prediction-form">
                          <span style={{ color: "var(--text-muted)" }}>
                            Tu pronóstico: {userPred.homeGoals} - {userPred.awayGoals}
                          </span>
                          <span className="points-badge">
                            +{userPred.pointsEarned} pts
                          </span>
                        </div>
                      ) : (
                        <p style={{ color: "var(--text-muted)", textAlign: "center", fontSize: "0.9rem" }}>
                          No enviaste pronóstico
                        </p>
                      )
                    ) : (
                      <form
                        className="prediction-form"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.currentTarget;
                          const hg = (form.elements.namedItem("hg") as HTMLInputElement).value;
                          const ag = (form.elements.namedItem("ag") as HTMLInputElement).value;
                          handleSubmit(match.id, hg, ag);
                        }}
                      >
                        <input
                          type="number"
                          name="hg"
                          min="0"
                          max="20"
                          className="score-input"
                          defaultValue={userPred?.homeGoals ?? 0}
                          disabled={isPending}
                        />
                        <span className="vs">-</span>
                        <input
                          type="number"
                          name="ag"
                          min="0"
                          max="20"
                          className="score-input"
                          defaultValue={userPred?.awayGoals ?? 0}
                          disabled={isPending}
                        />
                        <button type="submit" className="primary-btn" style={{ padding: "0.8rem 1.5rem", fontSize: "0.9rem" }} disabled={isPending}>
                          {userPred ? "Actualizar" : "Enviar"}
                        </button>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="container"><p>Cargando...</p></div>}>
      <DashboardContent />
    </Suspense>
  );
}
