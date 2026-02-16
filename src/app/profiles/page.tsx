'use client';

import Link from 'next/link';
import { Lock, User, Loader2, School } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirebase, useCollection, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { collection, doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

type ChildProfile = {
  id: string;
  name: string;
  age: number;
  avatarUrl?: string;
};

export default function ProfilesPage() {
  const { user, firestore } = useFirebase();
  const router = useRouter();

  // Effect to create parent document if it doesn't exist
  useEffect(() => {
    if (!user || !firestore) return;

    const parentRef = doc(firestore, 'parents', user.uid);
    const checkAndCreateParentDoc = async () => {
      const docSnap = await getDoc(parentRef);
      if (!docSnap.exists()) {
        const newParentData = {
          id: user.uid,
          externalAuthId: user.uid,
          email: user.email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setDocumentNonBlocking(parentRef, newParentData, { merge: true });
      }
    };
    checkAndCreateParentDoc();
  }, [user, firestore]);

  const childProfilesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'parents', user.uid, 'childProfiles');
  }, [user, firestore]);

  const { data: profiles, isLoading } =
    useCollection<ChildProfile>(childProfilesQuery);

  const handleProfileClick = () => {
    sessionStorage.setItem('playbackAllowed', 'true');
    router.push('/feed');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#8E44AD] to-[#3498DB] md:flex md:items-center md:justify-center md:p-4">
      <div className="flex h-screen w-full flex-col justify-between p-6 text-white md:h-auto md:max-w-sm md:rounded-3xl md:justify-start md:bg-white/10 md:shadow-lg md:backdrop-blur-xl">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 text-purple-900">
              <span className="font-bold">ZK</span>
            </div>
            <h1 className="text-xl font-bold text-white">ZoZoKid</h1>
          </div>
          <Button
            variant="ghost"
            className="rounded-full bg-white/20 hover:bg-white/30"
            asChild
          >
            <Link href="/parent-dashboard">
              <Lock className="mr-2 h-4 w-4" />
              Parent Controls
            </Link>
          </Button>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center text-center md:my-16 md:flex-none">
          <h2 className="text-4xl font-extrabold">Who is watching?</h2>
          <p className="mt-2 text-white/80">
            Pick your profile to start exploring fun videos!
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4">
            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-16 w-16 animate-spin text-white" />
              </div>
            )}
            {profiles &&
              profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="group cursor-pointer text-center"
                  onClick={handleProfileClick}
                >
                  <div className="relative">
                    <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-transparent transition-transform group-hover:scale-105">
                      {profile.avatarUrl ? (
                        <Image
                          src={profile.avatarUrl}
                          alt={profile.name}
                          width={120}
                          height={120}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-16 w-16 text-white" />
                      )}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-yellow-400 px-3 py-1 text-sm font-bold text-purple-900">
                      Age {profile.age}
                    </div>
                  </div>
                  <p className="mt-4 text-lg font-bold">{profile.name}</p>
                </div>
              ))}
            {!isLoading && (!profiles || profiles.length === 0) && (
              <p className="text-white/80">
                No profiles yet. Add one in Parent Controls.
              </p>
            )}
          </div>
        </main>

        <footer className="text-center space-y-2">
          <Button
            variant="ghost"
            className="w-full rounded-full bg-white/20 hover:bg-white/30"
            asChild
          >
            <Link href="/parent-dashboard">
              <Lock className="mr-2 h-4 w-4" />
              Manage Profiles in Parent Mode
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full rounded-full bg-white/20 hover:bg-white/30"
            asChild
          >
            <Link href="/teacher/login">
              <School className="mr-2 h-4 w-4" />
              Teacher Login
            </Link>
          </Button>
        </footer>
      </div>
    </div>
  );
}
