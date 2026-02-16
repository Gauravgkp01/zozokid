'use client';

import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

type Video = {
  id: string; // This will be the document id, which is the youtube video id
  createdAt: string;
};

export default function FeedPage() {
  const { user, firestore } = useFirebase();

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
    <div className="h-screen w-full snap-y snap-mandatory overflow-y-auto bg-black">
      {videos && videos.length > 0 ? (
        videos.map((video) => (
          <div
            key={video.id}
            className="flex h-screen w-full items-center justify-center snap-start"
          >
            <div className="relative h-full w-full max-w-sm overflow-hidden rounded-lg bg-black">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${video.id}?autoplay=0&controls=1&modestbranding=1&rel=0`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>
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

    