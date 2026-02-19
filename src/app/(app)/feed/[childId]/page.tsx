'use client';

import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { VideoReelItem } from '@/components/feed/video-reel-item';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useFirebase } from '@/firebase';

export type Video = {
  id: string; // This will be the document id, which is the youtube video id
  parentId: string;
  addedById: string;
  addedByType: 'parent' | 'teacher';
  createdAt: string;
  title: string;
  thumbnailUrl: string;
  channelId: string;
  channelTitle: string;
};

const PAGE_SIZE = 10;

export default function FeedPage() {
  const params = useParams();
  const childId = params.childId as string;
  const { user, firestore } = useFirebase();
  const [isPlaybackAllowed, setIsPlaybackAllowed] = useState(false);
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // On the client, check if the user has already granted permission in this session.
  useEffect(() => {
    if (sessionStorage.getItem('playbackAllowed') === 'true') {
      setIsPlaybackAllowed(true);
    }
  }, []);

  const loadMoreVideos = useCallback(async () => {
    if (isLoading || !hasMore || !user || !firestore) return;
    setIsLoading(true);

    let q = query(
      collection(firestore, 'parents', user.uid, 'videoQueue'),
      orderBy('createdAt', 'desc'),
      limit(PAGE_SIZE)
    );
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    try {
      const documentSnapshots = await getDocs(q);
      const newVideos = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as Video));
      
      setVideos(prevVideos => [...prevVideos, ...newVideos]);
      
      const newLastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];
      setLastDoc(newLastDoc);
      
      setHasMore(documentSnapshots.docs.length === PAGE_SIZE);

    } catch (error) {
      console.error("Error loading more videos: ", error);
    } finally {
      setIsLoading(false);
      if (initialLoad) setInitialLoad(false);
    }
  }, [isLoading, hasMore, user, firestore, lastDoc, initialLoad]);

  useEffect(() => {
      // Initial load
      if(user && firestore && videos.length === 0) {
        loadMoreVideos();
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, firestore]);

  const handleVideoVisible = useCallback((index: number) => {
    setActiveIndex(index);
    // Load more when the user is 5 videos away from the end for smoother scrolling
    if (index >= videos.length - 5 && hasMore && !isLoading) {
      loadMoreVideos();
    }
  }, [videos.length, hasMore, isLoading, loadMoreVideos]);

  if (initialLoad) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <Loader2 className="h-16 w-16 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full snap-y snap-mandatory overflow-y-auto bg-black">
      {videos.length > 0 && user ? (
        <>
          {videos.map((video, index) => (
            <VideoReelItem
              key={`${video.id}-${index}`} // Using index in key to ensure uniqueness if videos have same id
              video={video}
              childId={childId}
              parentId={user.uid}
              isPlaybackAllowed={isPlaybackAllowed}
              index={index}
              onVisible={handleVideoVisible}
              activeIndex={activeIndex}
            />
          ))}
          {isLoading && (
             <div className="flex h-screen w-full snap-start items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-white" />
             </div>
          )}
        </>
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
