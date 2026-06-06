"use client";
import { useEffect, useRef } from "react";
import { useGame } from "@/lib/store";
import { sectorAvg, clamp } from "@/lib/game";
import { FLAGS } from "@/lib/data";
import { toast } from "./Toast";
import type { Pos } from "@/lib/types";

export default function Result() {
  const result = useGame((s) => s.result);
  const picked = useGame((s) => s.picked);
  const config = useGame((s) => s.config);
  const reset = useGame((s) => s.reset);
  const barsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      barsRef.current?.querySelectorAll<HTMLElement>(".track > i").forEach((i) => {
        i.style.width = (i.dataset.w || "0") + "%";
      });
    }, 120);
    return () => clearTimeout(t);
  }, [result]);

  if (!result) return null;
  const R = result;
  const star = R.star;

  const sectors: [string, Pos[]][] = [
    ["Defence", ["GK", "DEF"]],
    ["Midfield", ["MID"]],
    ["Attack", ["FWD"]],
  ];

  function share() {
    const head = R.champion
      ? R.perfect
        ? "🏆 8-0 PERFECT! World Champion"
        : "🏆 World Champion"
      : `Eliminated in ${R.exitStage}`;
    const txt = `⚽ The Perfect World Cup\n${head}\nRecord ${R.W}-${R.D}-${R.L} · ${R.GF}-${R.GA} goals\nFormation ${config.formation} · strength ${R.strength.toFixed(1)} · star ${star.name} (${star.rating})\nCan you beat me?`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(txt).then(() => toast("Result copied! 📋"));
    } else {
      toast("Copy manually 🙂");
    }
  }

  const stats: [string, string | number][] = [
    ["Team strength", R.strength.toFixed(1)],
    ["Matches", R.W + R.D + R.L],
    ["Goals scored", R.GF],
    ["Goals conceded", R.GA],
  ];

  return (
    <div>
      {R.champion ? (
        <div className="hero champ">
          <div className="trophy">🏆</div>
          <div className="verdict">World Champion</div>
          <div className="recordline">
            <span className="v">{R.W}</span>-<span className="d2">{R.D}</span>-<span className="l">{R.L}</span>
          </div>
          <div className="sub">
            {R.perfect
              ? "PERFECT RUN! Won all 8 games without stumbling. 🔥"
              : `Wins-Draws-Losses · ${R.GF} goals scored, ${R.GA} conceded`}
          </div>
        </div>
      ) : (
        <div className="hero out">
          <div className="trophy">😖</div>
          <div className="verdict">Eliminated · {R.exitStage}</div>
          <div className="recordline">
            <span className="v">{R.W}</span>-<span className="d2">{R.D}</span>-<span className="l">{R.L}</span>
          </div>
          <div className="sub">
            The team fell in {R.exitStage}. {R.GF} goals scored, {R.GA} conceded.
          </div>
        </div>
      )}

      <div className="panel">
        <div className="label">Tournament statistics</div>
        <div className="statgrid">
          {stats.map(([k, n]) => (
            <div className="stat" key={k}>
              <div className="n">{n}</div>
              <div className="k">{k}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-h">Match by match</div>
      <div className="matchlist">
        {R.matches.map((m, i) => (
          <div className="match" style={{ animationDelay: `${i * 0.07}s` }} key={i}>
            <div className="stage">{m.stage}</div>
            <div className="opp">
              {m.flag} {m.opp}
              <small>{m.pens ? `decided on penalties ${m.pens}` : ""}</small>
            </div>
            <div className={`sc ${m.outcome}`}>
              {m.gf}-{m.ga}
              <small>{m.outcome === "w" ? "WIN" : m.outcome === "d" ? "DRAW" : "LOSS"}</small>
            </div>
          </div>
        ))}
      </div>

      <div className="section-h">Team strength</div>
      <div className="panel">
        <div className="bars" ref={barsRef}>
          {sectors.map(([k, group]) => {
            const v = sectorAvg(picked, group);
            return (
              <div className="bar" key={k}>
                <div className="bt">
                  <span>{k}</span>
                  <b>{v.toFixed(1)}</b>
                </div>
                <div className="track">
                  <i style={{ width: "0%" }} data-w={clamp(((v - 60) / 39) * 100, 5, 100)} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="section-h">Team star</div>
      <div className="starcard">
        <div className="sr">{star.rating}</div>
        <div className="si">
          <div className="t">Tournament star</div>
          <div className="nm">{star.name}</div>
          <div className="mt">
            {FLAGS[star.team] || ""} {star.team} · {star.year} · {star.pos}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
        <button className="btn gold" style={{ fontSize: 17 }} onClick={share}>
          Share result 📋
        </button>
        <button className="btn ghost" style={{ maxWidth: 220 }} onClick={reset}>
          Play again
        </button>
      </div>
    </div>
  );
}
