"use client";
import { useGame } from "@/lib/store";
import { SUB_TO_CAT } from "@/lib/game";
import { FLAGS } from "@/lib/data";
import type { Pos } from "@/lib/types";

const ROWS: Pos[] = ["FWD", "MID", "DEF", "GK"];

export default function Pitch() {
  const slots = useGame((s) => s.slots);
  const picked = useGame((s) => s.picked);

  const slotsWithIdx = slots.map((subPos, idx) => ({ subPos, idx }));

  return (
    <div className="pitch">
      {ROWS.map((pos) => {
        const rowSlots = slotsWithIdx.filter(({ subPos }) => SUB_TO_CAT[subPos] === pos);
        return (
          <div className="row" key={pos}>
            {rowSlots.map(({ subPos: slotPos, idx: slotIdx }) => {
              const pl = picked.find((p) => p.slotIdx === slotIdx);
              return (
                <div className={`spot${pl ? " filled" : ""}`} key={slotIdx}>
                  <div className="dot">{pl ? pl.rating : slotPos[0]}</div>
                  <div className="nm">{pl ? pl.name : "—"}</div>
                  <div className="yr">{pl ? `${FLAGS[pl.team] || ""} ${pl.year}` : slotPos}</div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
