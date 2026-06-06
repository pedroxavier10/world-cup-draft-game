export type Pos = "GK" | "DEF" | "MID" | "FWD";

export type SubPos =
  | "GK"
  | "CB" | "LB" | "RB" | "LWB" | "RWB"
  | "CDM" | "CM" | "CAM" | "LM" | "RM"
  | "LW" | "RW" | "ST" | "CF";

/** Player tuple in the dataset: [name, sub-position(s), rating] */
export type PlayerTuple = [string, SubPos | SubPos[], number];

/** Database: edition -> team -> players */
export type DB = Record<number, Record<string, PlayerTuple[]>>;

export interface Config {
  formation: string;
  difficulty: 0 | 1; // number of rerolls
  showRatings: 0 | 1;
  pool: "all" | "single";
  poolYear: number;
}

export interface Roll {
  year: number;
  team: string;
}

export interface Picked {
  name: string;
  pos: SubPos;      // the role the player is actually playing
  slotIdx: number;  // index into slots[] array this player occupies
  rating: number;
  team: string;
  year: number;
}

export type Outcome = "w" | "d" | "l";

export interface MatchResult {
  stage: string;
  opp: string;
  flag: string;
  gf: number;
  ga: number;
  outcome: Outcome;
  pens?: string | null;
}

export interface SimResult {
  strength: number;
  matches: MatchResult[];
  W: number;
  D: number;
  L: number;
  GF: number;
  GA: number;
  champion: boolean;
  eliminated: boolean;
  exitStage: string | null;
  perfect: boolean;
  star: Picked;
}

export type Screen = "setup" | "draft" | "result";
