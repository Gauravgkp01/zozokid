'use client';

import { useEffect, useRef, useState } from 'react';

type VideoReelItemProps = {
  videoId: string;
  isPlaybackAllowed: boolean;
};

export function VideoReelItem({
  videoId,
  isPlaybackAllowed,
}: VideoReelItemProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update our state when observer callback fires
        setInView(entry.isIntersecting);
      },
      {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.5, // 50% of item has to be visible
      }
    );

    const currentRef = videoRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const videoSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0`;

  return (
    <div
      ref={videoRef}
      className="flex h-screen w-full snap-start items-center justify-center"
    >
      <div className="relative h-full w-full max-w-sm overflow-hidden rounded-lg bg-black">
        <iframe
          className="h-full w-full"
          src={inView && isPlaybackAllowed ? videoSrc : undefined}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}
