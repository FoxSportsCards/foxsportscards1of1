"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type HeroMediaProps = {
  poster: string;
  desktopSrc: string;
  mobileSrc: string;
};

type ConnectionLike = {
  saveData?: boolean;
  effectiveType?: string;
  addEventListener?: (type: "change", listener: () => void) => void;
  removeEventListener?: (type: "change", listener: () => void) => void;
};

function shouldDisableVideo(connection: ConnectionLike | undefined, reducedMotion: boolean, reducedData: boolean) {
  if (reducedMotion || reducedData) return true;
  if (!connection) return false;
  if (connection.saveData) return true;
  return connection.effectiveType === "slow-2g" || connection.effectiveType === "2g";
}

export default function HeroMedia({ poster, desktopSrc, mobileSrc }: HeroMediaProps) {
  const [playVideo, setPlayVideo] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reducedData = window.matchMedia("(prefers-reduced-data: reduce)");
    const connection = (navigator as Navigator & { connection?: ConnectionLike }).connection;

    const updatePlayback = () => {
      const disable = shouldDisableVideo(
        connection,
        reducedMotion.matches,
        reducedData.matches,
      );
      setPlayVideo(!disable);
    };

    updatePlayback();

    reducedMotion.addEventListener("change", updatePlayback);
    reducedData.addEventListener("change", updatePlayback);
    connection?.addEventListener?.("change", updatePlayback);

    return () => {
      reducedMotion.removeEventListener("change", updatePlayback);
      reducedData.removeEventListener("change", updatePlayback);
      connection?.removeEventListener?.("change", updatePlayback);
    };
  }, []);

  return (
    <>
      <Image src={poster} alt="" fill priority sizes="100vw" className="object-cover" />
      {playVideo ? (
        <>
          <video
            className="absolute inset-0 h-full w-full object-cover opacity-74 motion-reduce:hidden md:hidden"
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            poster={poster}
            aria-hidden="true"
          >
            <source src={mobileSrc} type="video/mp4" />
          </video>
          <video
            className="absolute inset-0 hidden h-full w-full object-cover opacity-74 motion-reduce:hidden md:block"
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            poster={poster}
            aria-hidden="true"
          >
            <source src={desktopSrc} type="video/mp4" />
          </video>
        </>
      ) : null}
    </>
  );
}
