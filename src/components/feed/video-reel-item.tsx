'use client';

import { useEffect, useRef } from 'react';
import { collection } from 'firebase/firestore';
import { useFirebase, addDocumentNonBlocking } from '@/firebase';

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

type Video = {
  id: string; // youtube video id
  parentId: string;
  createdAt: string;
  title: string;
  thumbnailUrl: string;
  channelId: string;
  channelTitle: string;
};

type VideoReelItemProps = {
  video: Video;
  childId: string;
  parentId: string;
  isPlaybackAllowed: boolean;
  index: number;
  onVisible: (index: number) => void;
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
  video,
  childId,
  parentId,
  isPlaybackAllowed,
  index,
  onVisible,
}: VideoReelItemProps) {
  const { firestore } = useFirebase();
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  const videoId = video.id;
  const playerId = `ytplayer-${videoId}-${Math.random().toString(36).substring(7)}`;

  const onPlayerStateChange = (event: any) => {
    if (!firestore || !childId || !parentId) return;

    // Video Started Playing
    if (event.data === window.YT.PlayerState.PLAYING) {
      if (startTimeRef.current === null) { // Only set if it's not already set
        startTimeRef.current = Date.now();
      }
    }
    
    const stateIsEnded = event.data === window.YT.PlayerState.ENDED;
    const stateIsPaused = event.data === window.YT.PlayerState.PAUSED;
    
    // Video Paused or Ended
    if ((stateIsEnded || stateIsPaused) && startTimeRef.current) {
      const watchDurationMillis = Date.now() - startTimeRef.current;
      const watchDurationSeconds = Math.round(watchDurationMillis / 1000);
      startTimeRef.current = null; // Reset start time

      // Only log if watched for more than 5 seconds
      if (watchDurationSeconds > 5) {
        const watchEventsRef = collection(firestore, 'parents', parentId, 'childProfiles', childId, 'videoWatchEvents');
        const eventData = {
            parentId: parentId,
            childProfileId: childId,
            youtubeVideoId: video.id,
            channelId: video.channelId,
            channelTitle: video.channelTitle,
            watchDurationSeconds: stateIsEnded ? Math.round(playerRef.current?.getDuration() || watchDurationSeconds) : watchDurationSeconds,
            watchedAt: new Date().toISOString(),
            videoTitle: video.title,
            videoThumbnailUrl: video.thumbnailUrl,
            videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
            contentTypeId: 'uncategorized'
        };
        addDocumentNonBlocking(watchEventsRef, eventData);
      }
    }
  };


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
                playsinline: 1, // Ensures inline playback on iOS
            },
            events: {
              onReady: (event: any) => {
                if (isPlaybackAllowed) {
                  event.target.unMute();
                }
              },
              onStateChange: onPlayerStateChange,
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


  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      const player = playerRef.current;

      if (!player || typeof player.playVideo !== 'function') return;

      if (entry.isIntersecting) {
        onVisible(index);
        if (isPlaybackAllowed) {
            player.unMute();
        }
        player.playVideo();
      } else {
        // This will trigger the PAUSED state change and log the event
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
  }, [isPlaybackAllowed, index, onVisible]);


  return (
    <div
      ref={videoContainerRef}
      className="flex h-screen w-full snap-start items-center justify-center"
    >
      <div className="relative h-full w-full max-w-sm overflow-hidden rounded-lg bg-black">
        {/* Player container - explicitly in the background */}
        <div className="absolute inset-0 z-0">
          <div id={playerId} className="h-full w-full" />
        </div>
        
        {/* Top-level overlay. It passes clicks through by default... */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* ...except for this bottom area, which is for scrolling. */}
          <div className="absolute bottom-0 left-0 right-0 h-1/4 pointer-events-auto bg-gradient-to-t from-black/70 to-transparent">
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <p className="font-bold text-lg drop-shadow-md">{video.channelTitle}</p>
              <p className="mt-1 text-sm drop-shadow-md">{video.title}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
