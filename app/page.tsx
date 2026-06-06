"use client";
import { useGame } from "@/lib/store";
import Setup from "@/components/Setup";
import Draft from "@/components/Draft";
import Result from "@/components/Result";
import Toast from "@/components/Toast";

export default function Page() {
  const screen = useGame((s) => s.screen);

  return (
    <div className="wrap">
      <div className="brand">
        <div className="crest">8-0</div>
        <h1>The Perfect World Cup</h1>
      </div>
      <p className="tag">
        Build your legendary World Cup eleven, draw player by player and try for the perfect run: group stage, round of
        16, round of 8, quarters, semi-final and final.
      </p>

      {screen === "setup" && <Setup />}
      {screen === "draft" && <Draft />}
      {screen === "result" && <Result />}

      <div className="foot">
        Inspired by{" "}
        <a href="https://www.82-0.com/" target="_blank" rel="noopener noreferrer">
          82-0.com
        </a>{" "}
        and{" "}
        <a href="https://38-0.app/" target="_blank" rel="noopener noreferrer">
          38-0.app
        </a>
        .<br />
        Independent project, with no affiliation or sponsorship from FIFA. Ratings derived from sporting performance.
      </div>

      <Toast />
    </div>
  );
}
