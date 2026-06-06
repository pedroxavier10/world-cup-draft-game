"use client";
import { useEffect, useRef, useState } from "react";
import { useGame } from "@/lib/store";
import { allTeamPlayers, remainingSlots, teamsForYear, canFillSlot, playerPositions } from "@/lib/game";
import { FLAGS, EDITIONS } from "@/lib/data";
import type { PlayerTuple } from "@/lib/types";
import Pitch from "./Pitch";

const ALL_TEAMS = Array.from(new Set(EDITIONS.flatMap((y) => teamsForYear(y))));
const randOf = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export default function Draft() {
  const { slots, idx, rerolls, picked, roll, config, commitRoll, useReroll, pick } = useGame();

  const [spinning, setSpinning] = useState(false);
  const [showPicks, setShowPicks] = useState(false);
  const [reelTeam, setReelTeam] = useState("—");
  const [reelYear, setReelYear] = useState<string | number>("—");
  const [pendingPlayer, setPendingPlayer] = useState<PlayerTuple | null>(null);
  const flickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const remaining = remainingSlots(slots, picked);
  const pickedCount = picked.length;
  const totalSlots = slots.length;

  useEffect(() => {
    setShowPicks(false);
    setReelTeam("—");
    setReelYear("—");
    setPendingPlayer(null);
  }, [idx]);

  function spin() {
    setSpinning(true);
    setShowPicks(false);
    setPendingPlayer(null);
    flickRef.current = setInterval(() => {
      const t = randOf(ALL_TEAMS);
      setReelTeam(`${FLAGS[t] || ""} ${t}`);
      setReelYear(config.pool === "single" ? config.poolYear : randOf(EDITIONS));
    }, 70);
    setTimeout(() => {
      if (flickRef.current) clearInterval(flickRef.current);
      commitRoll();
      setSpinning(false);
      setShowPicks(true);
    }, 820);
  }

  useEffect(() => {
    if (roll) {
      setReelTeam(`${FLAGS[roll.team] || ""} ${roll.team}`);
      setReelYear(roll.year);
    }
  }, [roll]);

  const list = roll
    ? allTeamPlayers(roll.year, roll.team, picked).sort((a, b) =>
        config.showRatings ? b[2] - a[2] : a[0].localeCompare(b[0])
      )
    : [];

  return (
    <div>
      <div className="panel">
        <div className="draftbar">
          <div className="progress">
            Player <b>{idx + 1}</b> of <b>{slots.length}</b>
          </div>
          <div className="progress">
            Rerolls: <b>{rerolls}</b>
          </div>
        </div>
        <div className="pickprogress">
          <div className="pickprogress-bar" style={{ width: `${(pickedCount / totalSlots) * 100}%` }} />
          <span className="pickprogress-label">{pickedCount}/{totalSlots}</span>
        </div>
        <div className="slotmachine">
          <div className={`reel flag${spinning ? " spin" : ""}`}>
            <span className="reel-lab">Team</span>
            <span className="reel-val">{reelTeam}</span>
          </div>
          <div className={`reel${spinning ? " spin" : ""}`}>
            <span className="reel-lab">Edition</span>
            <span className="reel-val">{reelYear}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {!showPicks && (
            <button className="btn" style={{ fontSize: 18, padding: 14 }} disabled={spinning} onClick={spin}>
              Spin
            </button>
          )}
          {showPicks && (
            <button
              className="btn ghost"
              style={{ maxWidth: 200 }}
              disabled={rerolls <= 0 || spinning}
              onClick={() => {
                if (useReroll()) spin();
              }}
            >
              Reroll ↻
            </button>
          )}
        </div>

        {showPicks && roll && (
          <div style={{ marginTop: 16 }}>
            <div className="label">
              {roll.team} · {roll.year} — pick a player
            </div>
            <div className="players">
              {list.map((p) => {
                const isPicking = pendingPlayer?.[0] === p[0];
                const compatiblePos = playerPositions(p).filter((pos) =>
                  remaining.some((slot) => canFillSlot(pos, slot))
                );
                const disabled = !isPicking && compatiblePos.length === 0;

                if (isPicking) {
                  return (
                    <div className="pcard picking" key={p[0]}>
                      <div className="pn">{p[0]}</div>
                      <div className="pos-choose">
                        <div className="lbl">Play as:</div>
                        <div className="pos-choose-btns">
                          {compatiblePos.map((pos) => (
                            <button
                              key={pos}
                              className="pos-choose-btn"
                              onClick={() => {
                                pick(p, roll.team, roll.year, pos);
                                setPendingPlayer(null);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                            >
                              {pos}
                            </button>
                          ))}
                        </div>
                        <button className="pos-cancel" onClick={() => setPendingPlayer(null)}>
                          cancel
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    className={`pcard${disabled ? " dim" : ""}`}
                    key={p[0]}
                    onClick={
                      disabled
                        ? undefined
                        : () => {
                            if (compatiblePos.length === 1) {
                              pick(p, roll.team, roll.year, compatiblePos[0]);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            } else {
                              setPendingPlayer(p);
                            }
                          }
                    }
                  >
                    <div className={`rat${config.showRatings ? "" : " hid"}`}>{config.showRatings ? p[2] : "?"}</div>
                    <div className="pn">{p[0]}</div>
                    <div className="pmeta">
                      {FLAGS[roll.team] || ""} {roll.team} · {roll.year}
                    </div>
                    <span className="pos-pill">{playerPositions(p).join(" / ")}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="label">Your eleven</div>
        <Pitch />
      </div>
    </div>
  );
}
