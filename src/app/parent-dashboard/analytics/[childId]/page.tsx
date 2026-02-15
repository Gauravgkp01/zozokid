'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  Film,
  Tv,
} from 'lucide-react';
import {
  Bar,
  BarChart as BarChartComponent,
  CartesianGrid,
  Legend,
  Pie,
  PieChart as PieChartComponent,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';

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
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import type { ChildProfile } from '@/app/parent-dashboard/page';
import { Loader2 } from 'lucide-react';

const dailyWatchData = [
  { date: 'Mon', minutes: 30 },
  { date: 'Tue', minutes: 45 },
  { date: 'Wed', minutes: 60 },
  { date: 'Thu', minutes: 25 },
  { date: 'Fri', minutes: 75 },
  { date: 'Sat', minutes: 90 },
  { date: 'Sun', minutes: 50 },
];

const categoryWatchData = [
  { name: 'Educational', value: 400, fill: '#8884d8' },
  { name: 'Cartoons', value: 300, fill: '#82ca9d' },
  { name: 'Music', value: 200, fill: '#ffc658' },
  { name: 'Crafts', value: 100, fill: '#ff8042' },
];

export default function AnalyticsPage() {
  const { firestore, user } = useFirebase();
  const params = useParams();
  const childId = params.childId as string;

  const childProfileRef = useMemoFirebase(() => {
    if (!user || !firestore || !childId) return null;
    return doc(firestore, 'parents', user.uid, 'childProfiles', childId);
  }, [user, firestore, childId]);

  const { data: profile, isLoading } = useDoc<ChildProfile>(childProfileRef);

  if (isLoading) {
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
              <div className="text-2xl font-bold">7h 15m</div>
              <p className="text-xs text-muted-foreground">This week</p>
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
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">This week</p>
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
              <div className="text-2xl font-bold truncate">Blippi</div>
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
                <BarChartComponent data={dailyWatchData}>
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
              <CardTitle className="text-lg">Top Categories</CardTitle>
              <CardDescription>
                Breakdown of content categories watched.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex h-[300px] w-full items-center justify-center">
              <ChartContainer config={{}} className="h-full w-full">
                <PieChartComponent>
                  <Tooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={categoryWatchData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {categoryWatchData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChartComponent>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
