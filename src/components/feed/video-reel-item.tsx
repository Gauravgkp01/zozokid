'use client';

import { useEffect, useRef, useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useFirebase, addDocumentNonBlocking } from '@/firebase';
import Image from 'next/image';

// Make YT and YT.Player available in the window scope for TypeScript
declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: {
      Player: new (id: string, options: any) => any;
      PlayerState: { [key:string]: number };
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
  activeIndex: number;
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
  activeIndex,
}: VideoReelItemProps) {
  const { firestore } = useFirebase();
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  const videoId = video.id;
  const playerId = `ytplayer-${videoId}-${index}`; // Ensure player ID is unique per item

  // Determine if this item should have an active player
  const isNearby = useMemo(() => (index >= activeIndex - 1 && index <= activeIndex + 3), [index, activeIndex]);
  const isActive = useMemo(() => index === activeIndex, [index, activeIndex]);

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

  // Effect for creating/destroying the player
  useEffect(() => {
    if (isNearby) {
      ensureYouTubeApi().then(() => {
          if (!videoContainerRef.current || playerRef.current) return;

          playerRef.current = new window.YT.Player(playerId, {
              videoId: videoId,
              playerVars: {
                  autoplay: 0,
                  controls: 1,
                  modestbranding: 1,
                  rel: 0,
                  mute: 1, 
                  playsinline: 1, 
              },
              events: {
                onReady: (event: any) => {
                  if (isActive && isPlaybackAllowed) {
                    event.target.unMute();
                  }
                },
                onStateChange: onPlayerStateChange,
              }
          });
      });
    }

    // Cleanup: destroy player when it's no longer nearby
    return () => {
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
            playerRef.current.destroy();
            playerRef.current = null;
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNearby, videoId, playerId]);


  // Effect for controlling visibility
  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        onVisible(index);
      }
    };

    if (videoContainerRef.current) {
        observerRef.current = new IntersectionObserver(handleIntersection, {
            threshold: 0.75, // When 75% of the video is visible, it becomes active
        });
        observerRef.current.observe(videoContainerRef.current);
    }

    return () => {
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }
    };
  }, [index, onVisible]);

  // Effect to play/pause based on `isActive`
  useEffect(() => {
    const player = playerRef.current;
    if (player && typeof player.playVideo === 'function') {
      if (isActive) {
        if (isPlaybackAllowed) {
            player.unMute();
        }
        player.playVideo();
      } else {
        player.pauseVideo();
      }
    }
  }, [isActive, isPlaybackAllowed]);


  return (
    <div
      ref={videoContainerRef}
      className="flex h-screen w-full snap-start items-center justify-center"
    >
      <div className="relative h-full w-full max-w-sm overflow-hidden rounded-lg bg-black">
        {isNearby ? (
          <div className="absolute inset-0 z-0">
            <div id={playerId} className="h-full w-full" />
          </div>
        ) : (
          <>
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="h-full w-full object-cover"
              unoptimized
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <svg className="h-16 w-16 text-white/70" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path></svg>
            </div>
          </>
        )}
        
        {/* Overlay for scrolling and info */}
        <div className="absolute inset-0 z-10 pointer-events-none">
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
