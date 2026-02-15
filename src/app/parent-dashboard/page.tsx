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
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const ZoZoKidLogo = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="7" width="20" height="12" rx="3" fill="#42A5F5" />
    <path d="M9 11.5L15 15L9 18.5V11.5Z" fill="#FFCA28" />
    <path
      d="M7 7L6 4"
      stroke="#EC407A"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="5.5" cy="3" r="1" fill="#EC407A" />
    <path
      d="M17 7L18 4"
      stroke="#FFCA28"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="18.5" cy="3" r="1" fill="#FFCA28" />
    <path d="M7 19V21" stroke="#1E88E5" strokeWidth="2" strokeLinecap="round" />
    <path d="M17 19V21" stroke="#1E88E5" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default function ParentDashboardPage() {
  return (
    <div className="light min-h-screen bg-background font-body">
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
                  <div>
                    <p className="font-bold">Pippo</p>
                    <p className="text-sm text-muted-foreground">Age: 4</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    style={{ backgroundColor: '#FF4081' }}
                    className="rounded-full px-5 text-white hover:bg-[#FF4081]/90"
                    asChild
                  >
                    <Link href="/feed">Watch</Link>
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
