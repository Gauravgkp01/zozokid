import Link from 'next/link';
import { BarChart3, LogOut, Plus, Users, Video } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const ZoZoKidLogo = () => (
  <svg
    width="24"
    height="24"
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
    <div className="min-h-screen bg-gray-50 font-body">
      <header className="flex items-center justify-between bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-lg font-bold">
          <ZoZoKidLogo />
          <span>ZoZoKid</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Users className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href="/profiles">
              <LogOut className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="space-y-6 p-4">
        <h1 className="text-xl font-bold text-gray-700">Parent Dashboard</h1>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Content safety</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Progress value={90} className="h-2" />
            <span className="text-lg font-bold text-green-600">90%</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Child Profiles</CardTitle>
            <CardDescription>Manage and monitor your children</CardDescription>
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
                <Button variant="outline" size="icon" className="rounded-full">
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
            <CardDescription>Trusted video sources for your kids</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center p-6">
              <Video className="h-16 w-16 text-gray-300" />
            </div>
            <p className="text-muted-foreground">No approved channels yet</p>
            <Button className="mt-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add First Channel
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
