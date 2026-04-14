import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Sample teams for 4 groups (A-D) with 4 teams each = 16 teams, 2 matches per group = 8 sample matches
const SAMPLE_TEAMS = [
  { name: "Argentina", countryCode: "AR", group: "A" },
  { name: "México", countryCode: "MX", group: "A" },
  { name: "Polonia", countryCode: "PL", group: "A" },
  { name: "Arabia Saudita", countryCode: "SA", group: "A" },

  { name: "Brasil", countryCode: "BR", group: "B" },
  { name: "Serbia", countryCode: "RS", group: "B" },
  { name: "Suiza", countryCode: "CH", group: "B" },
  { name: "Camerún", countryCode: "CM", group: "B" },

  { name: "España", countryCode: "ES", group: "C" },
  { name: "Alemania", countryCode: "DE", group: "C" },
  { name: "Japón", countryCode: "JP", group: "C" },
  { name: "Costa Rica", countryCode: "CR", group: "C" },

  { name: "Francia", countryCode: "FR", group: "D" },
  { name: "Dinamarca", countryCode: "DK", group: "D" },
  { name: "Australia", countryCode: "AU", group: "D" },
  { name: "Túnez", countryCode: "TN", group: "D" },
];

export async function POST() {
  // Check if data already exists
  const existingTeams = await prisma.team.count();
  if (existingTeams > 0) {
    return NextResponse.json({ error: "Ya hay datos cargados." }, { status: 400 });
  }

  // Create teams
  const createdTeams: Record<string, string> = {};
  for (const t of SAMPLE_TEAMS) {
    const team = await prisma.team.create({ data: t });
    createdTeams[t.name] = team.id;
  }

  // Create matches (first round: team 1 vs 2, team 3 vs 4 per group)
  const groups = ["A", "B", "C", "D"];
  for (const g of groups) {
    const groupTeams = SAMPLE_TEAMS.filter((t) => t.group === g);
    // Match 1: team[0] vs team[1]
    await prisma.match.create({
      data: {
        group: g,
        homeTeamId: createdTeams[groupTeams[0].name],
        awayTeamId: createdTeams[groupTeams[1].name],
      },
    });
    // Match 2: team[2] vs team[3]
    await prisma.match.create({
      data: {
        group: g,
        homeTeamId: createdTeams[groupTeams[2].name],
        awayTeamId: createdTeams[groupTeams[3].name],
      },
    });
    // Match 3: team[0] vs team[2]
    await prisma.match.create({
      data: {
        group: g,
        homeTeamId: createdTeams[groupTeams[0].name],
        awayTeamId: createdTeams[groupTeams[2].name],
      },
    });
  }

  return NextResponse.json({ ok: true, teamsCreated: SAMPLE_TEAMS.length, matchesCreated: groups.length * 3 });
}
