import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { matchId, realHomeGoals, realAwayGoals } = body;

  if (!matchId || realHomeGoals == null || realAwayGoals == null) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  // Update the match with final score
  const match = await prisma.match.update({
    where: { id: matchId },
    data: { realHomeGoals, realAwayGoals, isFinished: true },
    include: { predictions: true },
  });

  // Calculate points for every prediction on this match
  const realDiff = realHomeGoals - realAwayGoals;
  const realResult = realDiff > 0 ? "HOME" : realDiff < 0 ? "AWAY" : "DRAW";

  for (const pred of match.predictions) {
    let points = 0;

    if (pred.homeGoals === realHomeGoals && pred.awayGoals === realAwayGoals) {
      points = 3; // Exact score
    } else {
      const predDiff = pred.homeGoals - pred.awayGoals;
      const predResult = predDiff > 0 ? "HOME" : predDiff < 0 ? "AWAY" : "DRAW";
      if (predResult === realResult) points = 1; // Correct result
    }

    await prisma.prediction.update({
      where: { id: pred.id },
      data: { pointsEarned: points },
    });
  }

  return NextResponse.json({ ok: true });
}
