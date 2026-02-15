'use client';

import Link from 'next/link';
import {
  BarChart3,
  LogOut,
  Users,
  Video,
  Clock,
  TrendingUp,
  Plus,
  Loader2,
  Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ProfileFormDialog } from '@/components/parent-dashboard/profile-form-dialog';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import Image from 'next/image';
import { useState } from 'react';

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
  
export type ChildProfile = {
    id: string;
    name: string;
    dateOfBirth: string;
    avatarUrl?: string;
    class: string;
};

const getAge = (dateString: string) => {
    if (!dateString) return '';
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
};

export default function ParentDashboardPage() {
    const { user, firestore } = useFirebase();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [profileToEdit, setProfileToEdit] = useState<ChildProfile | undefined>(undefined);


    const childProfilesQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, 'parents', user.uid, 'childProfiles');
      }, [user, firestore]);
    
    const { data: profiles, isLoading } = useCollection<ChildProfile>(childProfilesQuery);

    const handleAddProfile = () => {
      setProfileToEdit(undefined);
      setDialogOpen(true);
    }
    
    const handleEditProfile = (profile: ChildProfile) => {
      setProfileToEdit(profile);
      setDialogOpen(true);
    }
    
  return (
    <div className="light min-h-screen bg-white font-body text-foreground">
      <header className="flex items-center justify-between bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <ZoZoKidLogo />
          <div>
            <h1 className="font-bold text-foreground">
                Welcome, {user?.email?.split('@')[0] || 'Parent'}
            </h1>
            <p className="text-sm text-muted-foreground">Parent Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-full border-gray-300 text-foreground"
            asChild
          >
            <Link href="/profiles">
              <Users className="mr-2 h-4 w-4" />
              Profiles
            </Link>
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-gray-300 text-foreground"
            asChild
          >
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
          <Card className="bg-gray-50">
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
          <Card className="bg-gray-50">
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
          <Card className="bg-gray-50">
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
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg">Child Profiles</CardTitle>
              <CardDescription>
                Manage and monitor your children
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            {isLoading && (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}
            {!isLoading && profiles && profiles.map((profile) => (
              <div key={profile.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                   {profile.avatarUrl && (
                        <Image
                            src={profile.avatarUrl}
                            alt={profile.name}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                        />
                    )}
                  <div>
                    <p className="font-bold">{profile.name}</p>
                    <p className="text-sm text-muted-foreground">Age: {getAge(profile.dateOfBirth)}</p>
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
                    onClick={() => handleEditProfile(profile)}
                  >
                    <Pencil className="h-5 w-5" />
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
            ))}
             {!isLoading && (!profiles || profiles.length === 0) && (
                <p className="py-4 text-center text-muted-foreground">No child profiles yet.</p>
             )}
              <Button variant="outline" className="w-full rounded-full" onClick={handleAddProfile}>
                <Plus className="mr-2 h-4 w-4" />
                Add Another Child
            </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-50">
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
      <ProfileFormDialog open={dialogOpen} onOpenChange={setDialogOpen} profile={profileToEdit} />
    </div>
  );
}
