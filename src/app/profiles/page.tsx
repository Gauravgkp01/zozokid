import Link from 'next/link';
import { Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const profiles = [
  {
    id: 'gkp',
    name: 'gkp',
    age: 12,
    avatar: 'profile-kid',
  },
];

export default function ProfilesPage() {
  const profileImage = PlaceHolderImages.find((p) => p.id === profiles[0].avatar);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-[#8E44AD] to-[#3498DB] p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white/10 p-6 shadow-lg backdrop-blur-xl">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 text-purple-900">
              <span className="font-bold">SK</span>
            </div>
            <h1 className="text-xl font-bold text-white">SafeKids</h1>
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

        <main className="my-16 text-center text-white">
          <h2 className="text-4xl font-extrabold">Who is watching?</h2>
          <p className="mt-2 text-white/80">
            Pick your profile to start exploring fun videos!
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4">
            {profiles.map((profile) => (
              <Link href="/feed" key={profile.id} className="group text-center">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-white transition-transform group-hover:scale-105">
                    {profileImage && (
                      <AvatarImage
                        src={profileImage.imageUrl}
                        alt={profile.name}
                        data-ai-hint={profileImage.imageHint}
                      />
                    )}
                    <AvatarFallback className="bg-gray-700 text-white">
                      {profile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-yellow-400 px-3 py-1 text-sm font-bold text-purple-900">
                    Age {profile.age}
                  </div>
                </div>
                <p className="mt-4 text-lg font-bold">{profile.name}</p>
              </Link>
            ))}
          </div>
        </main>

        <footer className="text-center">
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
        </footer>
      </div>
    </div>
  );
}
