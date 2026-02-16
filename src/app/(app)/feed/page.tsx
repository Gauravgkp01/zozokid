'use client';

import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { VideoReelItem } from '@/components/feed/video-reel-item';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

type Video = {
  id: string; // This will be the document id, which is the youtube video id
  createdAt: string;
};

export default function FeedPage() {
  const { user, firestore } = useFirebase();
  const [isPlaybackAllowed, setIsPlaybackAllowed] = useState(false);

  const videosQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'parents', user.uid, 'videoQueue'),
      orderBy('createdAt', 'desc')
    );
  }, [user, firestore]);

  const { data: videos, isLoading } = useCollection<Video>(videosQuery);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <Loader2 className="h-16 w-16 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full snap-y snap-mandatory overflow-y-auto bg-black">
      {!isPlaybackAllowed && !isLoading && videos && videos.length > 0 && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 text-white">
          <h2 className="text-2xl font-bold">
            Click to start streaming videos
          </h2>
          <Button
            className="mt-4"
            onClick={() => setIsPlaybackAllowed(true)}
          >
            Start Streaming
          </Button>
        </div>
      )}
      {videos && videos.length > 0 ? (
        videos.map((video) => (
          <VideoReelItem
            key={video.id}
            videoId={video.id}
            isPlaybackAllowed={isPlaybackAllowed}
          />
        ))
      ) : (
        <div className="flex h-screen w-full items-center justify-center text-center text-white">
          <div>
            <h2 className="text-2xl font-bold">Your Feed is Empty</h2>
            <p className="mt-2 text-muted-foreground">
              Go to the Parent Dashboard to add some videos!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
