import { forwardRef } from "react";
import { SUB_TO_CAT } from "@/lib/game";
import { FLAGS } from "@/lib/data";
import {
  isGoldPlacement,
  placementLabel,
  type SharePayload,
  type SharePlayer,
} from "@/lib/share";

const POS_ORDER: Record<string, number> = { FWD: 0, MID: 1, DEF: 2, GK: 3 };

function PlayerRow({ p }: { p: SharePlayer }) {
  const cat = SUB_TO_CAT[p.pos];
  return (
    <div className="sc-row">
      <span className={`xi-pos cat-${cat.toLowerCase()}`}>{p.pos}</span>
      <span className="sc-name">{p.name}</span>
      <span className="sc-rating">{p.rating}</span>
    </div>
  );
}

const ShareCard = forwardRef<HTMLDivElement, { payload: SharePayload }>(
  function ShareCard({ payload }, ref) {
    const sorted = [...payload.squad].sort(
      (a, b) => POS_ORDER[SUB_TO_CAT[a.pos]] - POS_ORDER[SUB_TO_CAT[b.pos]],
    );
    const left = sorted.filter((p) =>
      ["FWD", "MID"].includes(SUB_TO_CAT[p.pos]),
    );
    const right = sorted.filter((p) =>
      ["DEF", "GK"].includes(SUB_TO_CAT[p.pos]),
    );
    const gold = isGoldPlacement(payload);

    return (
      <div className={`share-card${gold ? " gold" : ""}`} ref={ref}>
        <div className="sc-head">
          <span className="sc-chip">{payload.formation}</span>
          <span className="sc-chip ovr">OVR {payload.overall}</span>
        </div>

        <div className="sc-record">
          {payload.W}-{payload.D}-{payload.L}
        </div>
        <div className="sc-caption">WON · DRAWN · LOST</div>

        <div className={`sc-placement${gold ? " gold" : ""}`}>
          {placementLabel(payload)}
        </div>

        <div className="sc-squad">
          <div className="sc-col">
            {left.map((p, i) => (
              <PlayerRow key={i} p={p} />
            ))}
          </div>
          <div className="sc-col">
            {right.map((p, i) => (
              <PlayerRow key={i} p={p} />
            ))}
          </div>
        </div>

        <div className="sc-star">
          <div className="sc-star-rating">{payload.star.rating}</div>
          <div className="sc-star-info">
            <div className="t">⭐ Team star</div>
            <div className="nm">{payload.star.name}</div>
            <div className="mt">
              {FLAGS[payload.star.team] || ""} {payload.star.team} ·{" "}
              {payload.star.year} · {payload.star.pos}
            </div>
          </div>
        </div>

        <div className="sc-foot">
          <div className="sc-foot-q">Think you can beat this?</div>
          <div className="sc-foot-brand">8-0 · The Perfect World Cup</div>
        </div>
      </div>
    );
  },
);

export default ShareCard;
