import type { Config, Picked, SimResult, SubPos } from "./types";

/** Self-contained snapshot of a finished run, embeddable in a share link. */
export interface SharePayload {
  v: 1;
  formation: string;
  overall: number;
  W: number;
  D: number;
  L: number;
  GF: number;
  GA: number;
  champion: boolean;
  perfect: boolean;
  exitStage: string | null;
  squad: SharePlayer[];
  star: SharePlayer;
}

export interface SharePlayer {
  name: string;
  pos: SubPos;
  team: string;
  year: number;
  rating: number;
}

function toShare(p: Picked): SharePlayer {
  return { name: p.name, pos: p.pos, team: p.team, year: p.year, rating: p.rating };
}

export function buildPayload(result: SimResult, picked: Picked[], config: Config): SharePayload {
  return {
    v: 1,
    formation: config.formation,
    overall: Math.round(result.strength),
    W: result.W,
    D: result.D,
    L: result.L,
    GF: result.GF,
    GA: result.GA,
    champion: result.champion,
    perfect: result.perfect,
    exitStage: result.exitStage,
    squad: picked.map(toShare),
    star: toShare(result.star),
  };
}

/* ---- URL-safe, UTF-8-safe base64 (player names carry diacritics) ---- */

export function encodeShare(p: SharePayload): string {
  const json = JSON.stringify(p);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeShare(code: string): SharePayload | null {
  try {
    const b64 = code.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(escape(atob(b64)));
    const obj = JSON.parse(json);
    if (obj && obj.v === 1 && Array.isArray(obj.squad) && obj.star) return obj as SharePayload;
    return null;
  } catch {
    return null;
  }
}

/* ---- Presentation helpers shared by the card, modal and /v page ---- */

export function placementLabel(p: SharePayload): string {
  if (p.perfect) return "🏆 Perfect run · 8-0";
  if (p.champion) return "🏆 World Champion";
  if (p.exitStage === "Final") return "🥈 Runner-up";
  return `Out · ${p.exitStage ?? "—"}`;
}

/** True for the "good" placements that should use the gold accent. */
export function isGoldPlacement(p: SharePayload): boolean {
  return p.champion || p.exitStage === "Final";
}

export function buildShareText(p: SharePayload): string {
  const result = p.perfect
    ? "went 8-0 PERFECT and lifted the trophy 🏆"
    : p.champion
      ? "lifted the trophy 🏆"
      : p.exitStage === "Final"
        ? "reached the final 🥈"
        : `went out in the ${p.exitStage}`;
  return `⚽ I built a ${p.overall}-rated World Cup XI and ${result} — ${p.W}-${p.D}-${p.L}, ${p.GF}-${p.GA} goals. Star: ${p.star.name} (${p.star.rating}). Can you go all the way?`;
}

export function buildShareUrl(p: SharePayload): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/v/${encodeShare(p)}`;
}
