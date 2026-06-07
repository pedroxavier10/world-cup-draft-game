"use client";
import Link from "next/link";
import { decodeShare } from "@/lib/share";
import ShareCard from "@/components/ShareCard";

export default function SharedResult({ params }: { params: { code: string } }) {
  const payload = decodeShare(params.code);

  if (!payload) {
    return (
      <div className="wrap">
        <div className="brand">
          <div className="crest">8-0</div>
          <h1>The Perfect World Cup</h1>
        </div>
        <p className="tag">This shared result link is invalid or has expired.</p>
        <Link className="btn gold" href="/" style={{ maxWidth: 320, margin: "0 auto" }}>
          Build your own XI
        </Link>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="brand">
        <div className="crest">8-0</div>
        <h1>The Perfect World Cup</h1>
      </div>
      <p className="tag">A friend built this World Cup XI. Think you can beat it?</p>

      <div className="shared-card-wrap">
        <ShareCard payload={payload} />
      </div>

      <Link className="btn gold" href="/" style={{ maxWidth: 320, margin: "24px auto 0" }}>
        Build your own XI
      </Link>
    </div>
  );
}
