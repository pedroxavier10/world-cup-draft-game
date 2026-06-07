import { create } from "zustand";
import type {
  Config,
  Screen,
  SubPos,
  Roll,
  Picked,
  SimResult,
  PlayerTuple,
} from "./types";
import {
  buildSlots,
  computeRoll,
  remainingSlots,
  findSlotIdx,
  simulate,
} from "./game";

interface GameState {
  screen: Screen;
  config: Config;
  slots: SubPos[];
  idx: number;
  rerolls: number;
  picked: Picked[];
  roll: Roll | null;
  result: SimResult | null;

  setConfig: (patch: Partial<Config>) => void;
  start: () => void;
  commitRoll: () => void;
  useReroll: () => boolean;
  pick: (
    player: PlayerTuple,
    team: string,
    year: number,
    chosenPos: SubPos,
  ) => void;
  reset: () => void;
}

const defaultConfig: Config = {
  formation: "4-3-3",
  difficulty: 1,
  showRatings: 1,
  pool: "all",
  poolYear: 2026,
};

export const useGame = create<GameState>((set, get) => ({
  screen: "setup",
  config: { ...defaultConfig },
  slots: [],
  idx: 0,
  rerolls: 1,
  picked: [],
  roll: null,
  result: null,

  setConfig: (patch) => set((s) => ({ config: { ...s.config, ...patch } })),

  start: () => {
    const { config } = get();
    set({
      screen: "draft",
      slots: buildSlots(config.formation),
      idx: 0,
      rerolls: config.difficulty,
      picked: [],
      roll: null,
      result: null,
    });
  },

  commitRoll: () => {
    const { config, slots, picked } = get();
    const remaining = remainingSlots(slots, picked);
    set({ roll: computeRoll(config, remaining, picked) });
  },

  useReroll: () => {
    const { rerolls } = get();
    if (rerolls <= 0) return false;
    set({ rerolls: rerolls - 1 });
    return true;
  },

  pick: (player, team, year, chosenPos) => {
    const { picked, slots, config } = get();
    const slotIdx = findSlotIdx(slots, picked, chosenPos);
    if (slotIdx === -1) return;
    const next: Picked[] = [
      ...picked,
      {
        name: player[0],
        pos: chosenPos,
        slotIdx,
        rating: player[2],
        team,
        year,
      },
    ];
    if (next.length >= slots.length) {
      set({
        picked: next,
        idx: next.length,
        roll: null,
        screen: "result",
        result: simulate(config, next),
      });
    } else {
      set({ picked: next, idx: next.length, roll: null });
    }
  },

  reset: () =>
    set({ screen: "setup", picked: [], roll: null, result: null, idx: 0 }),
}));
