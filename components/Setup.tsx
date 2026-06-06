"use client";
import { useGame } from "@/lib/store";
import { FORMATIONS } from "@/lib/game";
import { EDITIONS } from "@/lib/data";

function Chip({
  active,
  onClick,
  title,
  sub,
  locked,
}: {
  active: boolean;
  onClick?: () => void;
  title: string;
  sub?: string;
  locked?: boolean;
}) {
  return (
    <div
      className={`chip${active ? " on" : ""}${locked ? " locked" : ""}`}
      onClick={locked ? undefined : onClick}
    >
      {title}
      {sub && <small>{sub}</small>}
    </div>
  );
}

export default function Setup() {
  const config = useGame((s) => s.config);
  const setConfig = useGame((s) => s.setConfig);
  const start = useGame((s) => s.start);

  return (
    <div>
      <div className="panel">
        <div className="label">Formation</div>
        <div className="seg">
          {Object.keys(FORMATIONS).map((f) => (
            <Chip
              key={f}
              title={f}
              active={config.formation === f}
              onClick={() => setConfig({ formation: f })}
            />
          ))}
        </div>
      </div>

      <div className="grid2" style={{ marginTop: 16 }}>
        <div className="panel">
          <div className="label">Difficulty</div>
          <div className="seg">
            <Chip
              title="Normal"
              sub="1 reroll"
              active={config.difficulty === 1}
              onClick={() => setConfig({ difficulty: 1 })}
            />
            <Chip
              title="Hard"
              sub="0 rerolls"
              active={config.difficulty === 0}
              onClick={() => setConfig({ difficulty: 0 })}
            />
          </div>
        </div>
        <div className="panel">
          <div className="label">Show ratings</div>
          <div className="seg">
            <Chip
              title="Yes"
              sub="informed mode"
              active={config.showRatings === 1}
              onClick={() => setConfig({ showRatings: 1 })}
            />
            <Chip
              title="No"
              sub="from memory only"
              active={config.showRatings === 0}
              onClick={() => setConfig({ showRatings: 0 })}
            />
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="label">Player pool</div>
        <div className="seg">
          <Chip
            title="All World Cups"
            sub="draw from any edition"
            active={config.pool === "all"}
            onClick={() => setConfig({ pool: "all" })}
          />
          <Chip
            title="A specific World Cup"
            sub="only players from that year"
            active={config.pool === "single"}
            onClick={() => setConfig({ pool: "single" })}
          />
        </div>
        {config.pool === "single" && (
          <div style={{ marginTop: 12 }}>
            <div className="label">Pool year</div>
            <div className="seg">
              {EDITIONS.map((y) => (
                <Chip
                  key={y}
                  title={String(y)}
                  active={config.poolYear === y}
                  onClick={() => setConfig({ poolYear: y })}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 18 }}>
        <button className="btn" onClick={start}>
          Start Draft ⚽
        </button>
      </div>
    </div>
  );
}
