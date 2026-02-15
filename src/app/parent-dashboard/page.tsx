import Link from 'next/link';
import {
  BarChart3,
  LogOut,
  Plus,
  Users,
  Video,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const ZoZoKidLogo = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 8C4 6.89543 4.89543 6 6 6H18C19.1046 6 20 6.89543 20 8V16C20 17.1046 19.1046 18 18 18H6C4.89543 18 4 17.1046 4 16V8Z"
      fill="#2196F3"
    />
    <circle cx="9" cy="12" r="1.5" fill="white" />
    <circle cx="15" cy="12" r="1.5" fill="white" />
    <path d="M8 6L7 3" stroke="#FFC107" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 6L17 3" stroke="#FFC107" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default function ParentDashboardPage() {
  const pippoProfileImage = PlaceHolderImages.find(
    (p) => p.id === 'profile-pippo'
  );

  return (
    <div className="min-h-screen bg-background font-body">
      <header className="flex items-center justify-between bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <ZoZoKidLogo />
          <div>
            <h1 className="font-bold text-foreground">Welcome, Saurav</h1>
            <p className="text-sm text-muted-foreground">Parent Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-full" asChild>
            <Link href="/profiles">
              <Users className="mr-2 h-4 w-4" />
              Profiles
            </Link>
          </Button>
          <Button variant="outline" className="rounded-full" asChild>
            <Link href="/login">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Link>
          </Button>
        </div>
      </header>

      <main className="space-y-8 p-4 md:p-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Dashboard Overview
          </h2>
          <p className="text-muted-foreground">
            Manage your children's video experience
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Watch Time
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12h 30m</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                New Channels Approved
              </CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+5</div>
              <p className="text-xs text-muted-foreground">
                in the last 7 days
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Trending Topics
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Space</div>
              <p className="text-xs text-muted-foreground">
                Most watched category
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Child Profiles</CardTitle>
              <CardDescription>
                Manage and monitor your children
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14">
                    {pippoProfileImage && (
                      <AvatarImage
                        src={pippoProfileImage.imageUrl}
                        alt="Pippo"
                        data-ai-hint={pippoProfileImage.imageHint}
                      />
                    )}
                    <AvatarFallback>P</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold">Pippo</p>
                    <p className="text-sm text-muted-foreground">Age: 4</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    style={{ backgroundColor: '#FF4081' }}
                    className="rounded-full px-5 text-white hover:bg-[#FF4081]/90"
                  >
                    Watch
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                  >
                    <BarChart3 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <Button variant="outline" className="w-full rounded-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Another Child
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Approved Channels</CardTitle>
              <CardDescription>
                Trusted video sources for your kids
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex justify-center p-6">
                <Video className="h-16 w-16 text-muted-foreground/30" />
              </div>
              <p className="text-muted-foreground">No approved channels yet</p>
              <Button className="mt-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add First Channel
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
