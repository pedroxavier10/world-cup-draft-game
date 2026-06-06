import { WORLD_CUP_DB, EDITIONS } from "./data";
import type { Pos, SubPos, PlayerTuple, Config, Roll, Picked, SimResult, MatchResult, Outcome } from "./types";

export const SUB_TO_CAT: Record<SubPos, Pos> = {
  GK: "GK",
  CB: "DEF", LB: "DEF", RB: "DEF", LWB: "DEF", RWB: "DEF",
  CDM: "MID", CM: "MID", CAM: "MID", LM: "MID", RM: "MID",
  LW: "FWD", RW: "FWD", ST: "FWD", CF: "FWD",
};

export const PLAYER_CAN_PLAY: Record<SubPos, SubPos[]> = {
  GK:  ["GK"],
  CB:  ["CB"],
  LB:  ["LB", "LWB"],
  RB:  ["RB", "RWB"],
  LWB: ["LWB", "LB"],
  RWB: ["RWB", "RB"],
  CDM: ["CDM", "CM"],
  CM:  ["CM", "CDM", "CAM"],
  CAM: ["CAM", "CM", "LM", "RM"],
  LM:  ["LM", "LW", "CAM"],
  RM:  ["RM", "RW", "CAM"],
  LW:  ["LW", "LM", "ST"],
  RW:  ["RW", "RM", "ST"],
  ST:  ["ST", "CF"],
  CF:  ["CF", "ST", "CAM"],
};

export const FORMATIONS: Record<string, SubPos[]> = {
  "4-3-3":   ["GK", "LB", "CB", "CB", "RB", "CM", "CM", "CM", "LW", "ST", "RW"],
  "4-4-2":   ["GK", "LB", "CB", "CB", "RB", "LM", "CM", "CM", "RM", "ST", "ST"],
  "3-5-2":   ["GK", "CB", "CB", "CB", "LWB", "CDM", "CM", "CM", "RWB", "ST", "ST"],
  "4-2-3-1": ["GK", "LB", "CB", "CB", "RB", "CDM", "CDM", "LM", "CAM", "RM", "ST"],
  "3-4-3":   ["GK", "CB", "CB", "CB", "LM", "CM", "CM", "RM", "LW", "ST", "RW"],
};

const POS_WEIGHT: Record<Pos, number> = { GK: 1.0, DEF: 1.0, MID: 1.1, FWD: 1.15 };

export const rnd = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const teamsForYear = (y: number) => Object.keys(WORLD_CUP_DB[y]);

/** Returns all positions a player can be played in. */
export function playerPositions(p: PlayerTuple): SubPos[] {
  return Array.isArray(p[1]) ? p[1] : [p[1]];
}

/** True if any of the player's positions are compatible with the given slot. */
export function playerCanFillSlot(p: PlayerTuple, slotPos: SubPos): boolean {
  return playerPositions(p).some((pos) => canFillSlot(pos, slotPos));
}

/** Returns the index in slots[] of the first open slot compatible with chosenPos. */
export function findSlotIdx(slots: SubPos[], picked: Picked[], chosenPos: SubPos): number {
  const used = new Set(picked.map((p) => p.slotIdx));
  return slots.findIndex((slot, i) => !used.has(i) && canFillSlot(chosenPos, slot));
}

export function buildSlots(formation: string): SubPos[] {
  return [...FORMATIONS[formation]];
}

export function canFillSlot(playerPos: SubPos, slotPos: SubPos): boolean {
  return PLAYER_CAN_PLAY[playerPos].includes(slotPos);
}

export function allTeamPlayers(year: number, team: string, picked: Picked[]) {
  return WORLD_CUP_DB[year][team].filter(
    (p) => !picked.some((x) => x.name === p[0] && x.team === team && x.year === year)
  );
}

/** Returns open slots (those not yet occupied by a picked player). */
export function remainingSlots(slots: SubPos[], picked: Picked[]): SubPos[] {
  const used = new Set(picked.map((p) => p.slotIdx));
  return slots.filter((_, i) => !used.has(i));
}

export function availableTeamPlayers(year: number, team: string, remaining: SubPos[], picked: Picked[]) {
  return WORLD_CUP_DB[year][team].filter(
    (p) =>
      remaining.some((slot) => playerCanFillSlot(p, slot)) &&
      !picked.some((x) => x.name === p[0] && x.team === team && x.year === year)
  );
}

export function computeRoll(config: Config, remaining: SubPos[], picked: Picked[]): Roll {
  let year = 0;
  let team = "";
  let tries = 0;
  do {
    year = config.pool === "single" ? config.poolYear : rnd(EDITIONS);
    team = rnd(teamsForYear(year));
    tries++;
  } while (availableTeamPlayers(year, team, remaining, picked).length === 0 && tries < 80);
  return { year, team };
}

export function teamStrength(picked: Picked[]): number {
  let num = 0, den = 0;
  picked.forEach((p) => {
    const w = POS_WEIGHT[SUB_TO_CAT[p.pos]];
    num += p.rating * w;
    den += w;
  });
  return den ? num / den : 0;
}

export function sectorAvg(picked: Picked[], group: Pos[]): number {
  const a = picked.filter((p) => group.includes(SUB_TO_CAT[p.pos]));
  return a.length ? a.reduce((s, p) => s + p.rating, 0) / a.length : 0;
}

function poisson(l: number): number {
  const L = Math.exp(-l);
  let k = 0, p = 1;
  do { k++; p *= Math.random(); } while (p > L);
  return k - 1;
}

function playMatch(strength: number, opp: number) {
  const diff = strength - opp;
  const xgF = clamp(1.35 + 0.1 * diff, 0.25, 4.6);
  const xgA = clamp(1.35 - 0.1 * diff, 0.25, 4.6);
  return { gf: poisson(xgF), ga: poisson(xgA) };
}

interface Stage {
  key: string;
  opp: number;
  group?: boolean;
  ko?: boolean;
  final?: boolean;
}

export function simulate(config: Config, picked: Picked[]): SimResult {
  const strength = teamStrength(picked);
  const adj = 0.55; // fixed to 2014 difficulty level

  const stages: Stage[] = [
    { key: "Group · M1", opp: 73 + adj, group: true },
    { key: "Group · M2", opp: 76 + adj, group: true },
    { key: "Group · M3", opp: 79 + adj, group: true },
    { key: "Round of 16", opp: 80.5 + adj, ko: true },
    { key: "Round of 8", opp: 82.5 + adj, ko: true },
    { key: "Quarters", opp: 85 + adj, ko: true },
    { key: "Semi-final", opp: 87 + adj, ko: true },
    { key: "Final", opp: 89 + adj, ko: true, final: true },
  ];
  const oppNames = ["Opponent A", "Opponent B", "Opponent C", "Round of 16", "Round of 8", "Quarters", "Semi-final", "Final"];
  const oppFlags = ["🌍", "🌍", "🌍", "⚽", "⚽", "🏆", "🏆", "🏆"];

  const matches: MatchResult[] = [];
  let W = 0, D = 0, L = 0, GF = 0, GA = 0, groupPts = 0;
  let champion = false, eliminated = false;
  let exitStage: string | null = null;

  for (let i = 0; i < stages.length; i++) {
    const st = stages[i];
    const { gf, ga } = playMatch(strength, st.opp);
    let outcome: Outcome;
    let pens: string | null = null;

    if (st.group) {
      if (gf > ga) { outcome = "w"; W++; groupPts += 3; }
      else if (gf === ga) { outcome = "d"; D++; groupPts += 1; }
      else { outcome = "l"; L++; }
      GF += gf; GA += ga;
      matches.push({ stage: st.key, opp: oppNames[i], flag: oppFlags[i], gf, ga, outcome });
      if (i === 2) {
        const advance = groupPts >= 4 || (groupPts === 3 && GF - GA >= 1);
        if (!advance) { eliminated = true; exitStage = "Group Stage"; break; }
      }
    } else {
      GF += gf; GA += ga;
      if (gf > ga) { outcome = "w"; W++; }
      else if (gf < ga) { outcome = "l"; L++; }
      else {
        const pWin = clamp(0.5 + (strength - st.opp) * 0.012, 0.18, 0.85);
        const won = Math.random() < pWin;
        pens = won ? "(gp)" : "(pp)";
        if (won) { outcome = "w"; W++; } else { outcome = "l"; L++; }
      }
      matches.push({ stage: st.key, opp: oppNames[i], flag: oppFlags[i], gf, ga, outcome, pens });
      if (outcome === "l") { eliminated = true; exitStage = st.key; break; }
      if (st.final && outcome === "w") champion = true;
    }
  }

  const star = [...picked].sort((a, b) => b.rating - a.rating)[0];
  const perfect = champion && L === 0 && D === 0;

  return { strength, matches, W, D, L, GF, GA, champion, eliminated, exitStage, perfect, star };
}
