"use client";
import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { buildShareText, buildShareUrl, type SharePayload } from "@/lib/share";
import { toast } from "./Toast";
import ShareCard from "./ShareCard";

export default function ShareModal({
  payload,
  onClose,
}: {
  payload: SharePayload;
  onClose: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const text = buildShareText(payload);
  const url = buildShareUrl(payload);

  function copy() {
    const full = `${text} ${url}`;
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(full)
        .then(() => toast("Copied to clipboard! 📋"));
    } else {
      toast("Copy manually 🙂");
    }
  }

  async function shareLink() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "The Perfect World Cup", text, url });
      } catch {
        /* user dismissed the share sheet */
      }
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => toast("Link copied! 🔗"));
    } else {
      toast("Copy manually 🙂");
    }
  }

  function openExternal(href: string) {
    window.open(href, "_blank", "noopener,noreferrer");
  }

  async function saveImage() {
    if (!cardRef.current) return;
    setSaving(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "world-cup-result.png";
      a.click();
      toast("Image saved! 🖼️");
    } catch {
      toast("Could not save image 😕");
    } finally {
      setSaving(false);
    }
  }

  const shareMsg = encodeURIComponent(`${text} ${url}`);

  return (
    <div className="share-overlay" onClick={onClose}>
      <div className="share-panel" onClick={(e) => e.stopPropagation()}>
        <ShareCard payload={payload} ref={cardRef} />

        <div className="share-actions">
          <button className="btn gold share-primary" onClick={shareLink}>
            🔗 Share link
          </button>
          <div className="share-row">
            <button
              className="btn ghost"
              onClick={() => openExternal(`https://wa.me/?text=${shareMsg}`)}
            >
              WhatsApp
            </button>
            <button
              className="btn ghost"
              onClick={() =>
                openExternal(
                  `https://twitter.com/intent/tweet?text=${shareMsg}`,
                )
              }
            >
              X
            </button>
            <button className="btn ghost" onClick={copy}>
              Copy
            </button>
          </div>
          <div className="share-row">
            <button className="btn ghost" onClick={saveImage} disabled={saving}>
              {saving ? "Saving…" : "⬇ Save image"}
            </button>
            <button className="btn ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
