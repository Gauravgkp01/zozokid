'use client';

import { useEffect, useRef } from 'react';

// Make YT and YT.Player available in the window scope for TypeScript
declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: {
      Player: new (id: string, options: any) => any;
      PlayerState: { [key: string]: number };
    };
  }
}

type VideoReelItemProps = {
  videoId: string;
  isPlaybackAllowed: boolean;
};

// A global promise to ensure the YouTube IFrame API script is loaded and ready.
let apiReadyPromise: Promise<void> | null = null;
const ensureYouTubeApi = () => {
  if (!apiReadyPromise) {
    apiReadyPromise = new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.YT && window.YT.Player) {
        resolve();
      } else if (typeof window !== 'undefined') {
        // If the API is not ready, we define the callback that the script will call.
        const originalCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          if (originalCallback) {
            originalCallback();
          }
          resolve();
        };
      }
    });
  }
  return apiReadyPromise;
};


export function VideoReelItem({
  videoId,
  isPlaybackAllowed,
}: VideoReelItemProps) {
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const playerId = `ytplayer-${videoId}-${Math.random().toString(36).substring(7)}`;


  // This effect sets up the YouTube player once the API is ready.
  // It now creates the player regardless of `isPlaybackAllowed`.
  useEffect(() => {
    ensureYouTubeApi().then(() => {
        if (!videoContainerRef.current || playerRef.current) return;

        playerRef.current = new window.YT.Player(playerId, {
            videoId: videoId,
            playerVars: {
                autoplay: 0,
                controls: 1,
                modestbranding: 1,
                rel: 0,
                mute: 1, // Player starts muted by default
            },
            events: {
              onReady: (event: any) => {
                // If playback is allowed when the player is ready, unmute it.
                if (isPlaybackAllowed) {
                  event.target.unMute();
                }
              }
            }
        });
    });

    return () => {
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
            playerRef.current.destroy();
            playerRef.current = null;
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, playerId]);


  // This effect handles observing the element and playing/pausing the video.
  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      const player = playerRef.current;

      if (!player || typeof player.playVideo !== 'function') return;

      if (entry.isIntersecting) {
        // When the video is visible, we ensure it's unmuted if allowed, and play.
        if (isPlaybackAllowed) {
            player.unMute();
        }
        player.playVideo();
      } else {
        player.pauseVideo();
      }
    };

    if (videoContainerRef.current) {
        observerRef.current = new IntersectionObserver(handleIntersection, {
            threshold: 0.75, // Play when 75% of the video is visible
        });
        observerRef.current.observe(videoContainerRef.current);
    }

    return () => {
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }
    };
  }, [isPlaybackAllowed]);


  return (
    <div
      ref={videoContainerRef}
      className="flex h-screen w-full snap-start items-center justify-center"
    >
      <div className="relative h-full w-full max-w-sm overflow-hidden rounded-lg bg-black">
        <div id={playerId} className="h-full w-full" />
      </div>
    </div>
  );
}
