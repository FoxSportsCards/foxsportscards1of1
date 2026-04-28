"use client";

import Image from "next/image";

type HeroMediaProps = {
  poster: string;
  desktopSrc: string;
  mobileSrc: string;
};

export default function HeroMedia({ poster, desktopSrc, mobileSrc }: HeroMediaProps) {
  return (
    <>
      <Image src={poster} alt="" fill priority sizes="100vw" className="object-cover" />
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-80 motion-reduce:hidden md:hidden"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster={poster}
        aria-hidden="true"
      >
        <source src={mobileSrc} type="video/mp4" />
      </video>
      <video
        className="absolute inset-0 hidden h-full w-full object-cover opacity-80 motion-reduce:hidden md:block"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster={poster}
        aria-hidden="true"
      >
        <source src={desktopSrc} type="video/mp4" />
      </video>
    </>
  );
}
