"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Iniciar sesión o registrar usuario básico
export async function loginOrRegister(username: string, email: string) {
  if (!username) throw new Error("Nombre de usuario requerido");
  
  const user = await prisma.user.upsert({
    where: { username },
    update: { email },
    create: { username, email },
  });
  return user;
}

// 2. Obtener partidos de fase de grupos
export async function getMatches() {
  return await prisma.match.findMany({
    include: { homeTeam: true, awayTeam: true, predictions: true },
    orderBy: [{ group: 'asc' }, { startDate: 'asc' }]
  });
}

// 3. Enviar Pronóstico
export async function submitPrediction(userId: string, matchId: string, homeGoals: number, awayGoals: number) {
  await prisma.prediction.upsert({
    where: {
      userId_matchId: {
        userId,
        matchId,
      },
    },
    update: { homeGoals, awayGoals },
    create: { userId, matchId, homeGoals, awayGoals },
  });
  revalidatePath("/dashboard");
}

// 4. Actualizar estado real de partido (Admin) y calcular puntos
export async function resolveMatch(matchId: string, realHomeGoals: number, realAwayGoals: number) {
  // Guardar el resultado en el partido
  const match = await prisma.match.update({
    where: { id: matchId },
    data: { 
      realHomeGoals, 
      realAwayGoals,
      isFinished: true 
    },
    include: { predictions: true }
  });

  // Calcular puntos para todas las predicciones de este partido
  const realHomeDiff = realHomeGoals - realAwayGoals;
  const realResult = realHomeDiff > 0 ? "HOME_WIN" : realHomeDiff < 0 ? "AWAY_WIN" : "DRAW";

  for (const prediction of match.predictions) {
    let points = 0;
    
    // Acierto exacto de marcadores
    if (prediction.homeGoals === realHomeGoals && prediction.awayGoals === realAwayGoals) {
      points = 3;
    } else {
      // Acierto de resultado (Ganador/Empate)
      const predHomeDiff = prediction.homeGoals - prediction.awayGoals;
      const predResult = predHomeDiff > 0 ? "HOME_WIN" : predHomeDiff < 0 ? "AWAY_WIN" : "DRAW";
      
      if (predResult === realResult) {
        points = 1;
      }
    }

    if (points > 0) {
      await prisma.prediction.update({
        where: { id: prediction.id },
        data: { pointsEarned: points }
      });
    }
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}
