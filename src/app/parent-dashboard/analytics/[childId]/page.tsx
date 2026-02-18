'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  Film,
  Tv,
  Eye,
} from 'lucide-react';
import {
  Bar,
  BarChart as BarChartComponent,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Image from 'next/image';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useFirebase, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import type { ChildProfile } from '@/app/parent-dashboard/page';
import { Loader2 } from 'lucide-react';

export type VideoWatchEvent = {
  id: string;
  parentId: string;
  childProfileId: string;
  youtubeVideoId: string;
  channelId: string;
  channelTitle: string;
  contentTypeId?: string;
  watchDurationSeconds: number;
  watchedAt: string; // ISO string
  videoTitle: string;
  videoThumbnailUrl: string;
  videoUrl: string;
};

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h > 0 ? `${h}h ` : ''}${m}m`;
}

export default function AnalyticsPage() {
  const { firestore, user } = useFirebase();
  const params = useParams();
  const childId = params.childId as string;

  const childProfileRef = useMemoFirebase(() => {
    if (!user || !firestore || !childId) return null;
    return doc(firestore, 'parents', user.uid, 'childProfiles', childId);
  }, [user, firestore, childId]);

  const { data: profile, isLoading: isLoadingProfile } = useDoc<ChildProfile>(childProfileRef);

  const watchEventsQuery = useMemoFirebase(() => {
    if (!user || !firestore || !childId) return null;
    return query(
      collection(firestore, 'parents', user.uid, 'childProfiles', childId, 'videoWatchEvents')
    );
  }, [user, firestore, childId]);

  const { data: watchEvents, isLoading: isLoadingEvents } = useCollection<VideoWatchEvent>(watchEventsQuery);

  const analytics = useMemo(() => {
    if (!watchEvents || watchEvents.length === 0) {
        return {
            totalWatchTime: 0,
            videosWatched: 0,
            favoriteChannel: 'N/A',
            dailyWatchData: Array(7).fill(0).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - i);
              return { date: d.toLocaleDateString('en-US', { weekday: 'short' }), minutes: 0 };
            }).reverse(),
            recentVideos: [],
        };
    }

    const totalWatchTime = watchEvents.reduce((acc, event) => acc + event.watchDurationSeconds, 0);
    const videosWatched = watchEvents.length;

    const channelWatchTimes: { [key: string]: number } = {};
    watchEvents.forEach(event => {
        if (event.channelTitle) {
            channelWatchTimes[event.channelTitle] = (channelWatchTimes[event.channelTitle] || 0) + event.watchDurationSeconds;
        }
    });
    const favoriteChannel = Object.keys(channelWatchTimes).length > 0 ? Object.entries(channelWatchTimes).reduce((a, b) => a[1] > b[1] ? a : b)[0] : 'N/A';

    const weeklyData: { date: string, minutes: number }[] = Array(7).fill(0).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return { date: d.toLocaleDateString('en-US', { weekday: 'short' }), minutes: 0 };
    }).reverse();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0,0,0,0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    watchEvents.forEach(event => {
        const eventDate = new Date(event.watchedAt);
        if (eventDate >= sevenDaysAgo) {
            const dayStr = eventDate.toLocaleDateString('en-US', { weekday: 'short' });
            const dayObj = weeklyData.find(d => d.date === dayStr);
            if (dayObj) {
                dayObj.minutes += Math.round(event.watchDurationSeconds / 60);
            }
        }
    });

    const recentVideos = [...watchEvents]
      .sort((a,b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime())
      .slice(0, 5);

    return { totalWatchTime, videosWatched, favoriteChannel, dailyWatchData: weeklyData, recentVideos };

  }, [watchEvents]);

  if (isLoadingProfile || isLoadingEvents) {
    return (
      <div className="light flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="light flex min-h-screen flex-col items-center justify-center bg-white">
        <h1 className="text-2xl font-bold">Profile not found</h1>
        <Button asChild className="mt-4">
          <Link href="/parent-dashboard">Go Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="light min-h-screen bg-white font-body text-foreground">
      <header className="flex items-center justify-between border-b bg-card p-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
            <Link href="/parent-dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Analytics for {profile.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Review their watch activity.
            </p>
          </div>
        </div>
      </header>

      <main className="space-y-8 p-4 md:p-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Watch Time
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(analytics.totalWatchTime)}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Videos Watched
              </CardTitle>
              <Film className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.videosWatched}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Favorite Channel
              </CardTitle>
              <Tv className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">{analytics.favoriteChannel}</div>
              <p className="text-xs text-muted-foreground">Most time spent</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Watch Time by Day</CardTitle>
              <CardDescription>
                Minutes watched in the last 7 days.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] w-full">
              <ChartContainer config={{}} className="h-full w-full">
                <BarChartComponent data={analytics.dailyWatchData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    label={{
                      value: 'Minutes',
                      angle: -90,
                      position: 'insideLeft',
                      offset: -5,
                    }}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    content={<ChartTooltipContent />}
                  />
                  <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={4} />
                </BarChartComponent>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recently Watched</CardTitle>
              <CardDescription>
                The last 5 videos this child watched.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics.recentVideos.length > 0 ? analytics.recentVideos.map((video: VideoWatchEvent) => (
                <div key={video.id} className="flex items-center gap-3">
                  <Image src={video.videoThumbnailUrl} alt={video.videoTitle} width={80} height={45} className="rounded-md object-cover"/>
                  <div className='flex-1'>
                    <p className="text-sm font-semibold truncate">{video.videoTitle}</p>
                    <p className="text-xs text-muted-foreground">{video.channelTitle}</p>
                  </div>
                  <Button asChild variant="ghost" size="icon">
                    <a href={video.videoUrl} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              )) : (
                <p className="text-sm text-center text-muted-foreground py-8">No watch history yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
