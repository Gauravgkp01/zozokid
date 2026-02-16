'use client';

import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { VideoReelItem } from '@/components/feed/video-reel-item';
import { useState, useEffect } from 'react';

type Video = {
  id: string; // This will be the document id, which is the youtube video id
  createdAt: string;
};

export default function FeedPage() {
  const { user, firestore } = useFirebase();
  const [isPlaybackAllowed, setIsPlaybackAllowed] = useState(false);

  // On the client, check if the user has already granted permission in this session.
  useEffect(() => {
    if (sessionStorage.getItem('playbackAllowed') === 'true') {
      setIsPlaybackAllowed(true);
    }
  }, []);

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
