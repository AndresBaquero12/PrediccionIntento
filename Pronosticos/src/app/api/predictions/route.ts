import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, matchId, homeGoals, awayGoals } = body;

  if (!userId || !matchId || homeGoals == null || awayGoals == null) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  // Check match is not finished
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });
  if (match.isFinished) return NextResponse.json({ error: "El partido ya terminó" }, { status: 400 });

  const prediction = await prisma.prediction.upsert({
    where: { userId_matchId: { userId, matchId } },
    update: { homeGoals, awayGoals },
    create: { userId, matchId, homeGoals, awayGoals },
  });

  return NextResponse.json(prediction);
}
