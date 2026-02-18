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
  Trash2,
  Send,
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
import { useFirebase, useCollection, useMemoFirebase, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, doc, writeBatch, getDoc, updateDoc } from 'firebase/firestore';
import Image from 'next/image';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { YoutubeDiscovery } from '@/components/parent-dashboard/youtube-discovery';
import { getVideoDetails } from '@/ai/flows/get-video-details-flow';
import { signOut } from 'firebase/auth';
import type { Class } from '@/app/teacher-dashboard/page';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';

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
    age: number;
    avatarUrl?: string;
    class: string;
    createdAt: string;
    parentId: string;
    updatedAt: string;
    sharedWithTeacherIds: string[];
};

export default function ParentDashboardPage() {
    const { user, firestore, auth } = useFirebase();
    const router = useRouter();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [profileToEdit, setProfileToEdit] = useState<ChildProfile | undefined>(undefined);
    const { toast } = useToast();
    const [youtubeLink, setYoutubeLink] = useState('');
    const [isAddingVideo, setIsAddingVideo] = useState(false);
    const [isClearingFeed, setIsClearingFeed] = useState(false);
    const [classCode, setClassCode] = useState('');
    const [selectedChildId, setSelectedChildId] = useState('');
    const [isSendingRequest, setIsSendingRequest] = useState(false);


    const childProfilesQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, 'parents', user.uid, 'childProfiles');
      }, [user, firestore]);
    
    const { data: profiles, isLoading } = useCollection<ChildProfile>(childProfilesQuery);

    const videoQueueQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, 'parents', user.uid, 'videoQueue');
    }, [user, firestore]);
    
    const { data: videosInQueue, isLoading: isLoadingQueue } = useCollection(videoQueueQuery);

    const handleAddProfile = () => {
      setProfileToEdit(undefined);
      setDialogOpen(true);
    }
    
    const handleEditProfile = (profile: ChildProfile) => {
      setProfileToEdit(profile);
      setDialogOpen(true);
    }

    const extractVideoID = (url: string) => {
      const regex = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^&?/]+)/;
      const match = url.match(regex);
      return match ? match[1] : null;
    };
    
    const handleAddVideo = async () => {
        if (!user || !firestore) {
            toast({
              variant: 'destructive',
              title: 'Not logged in',
              description: 'You must be logged in to add videos.',
            });
            return;
        }

        const videoId = extractVideoID(youtubeLink);
    
        if (!videoId) {
          toast({
            variant: 'destructive',
            title: 'Invalid YouTube link',
            description: 'Please provide a valid YouTube video link.',
          });
          return;
        }
        
        setIsAddingVideo(true);
        try {
            const videoDetails = await getVideoDetails(videoId);
            const videoRef = doc(firestore, 'parents', user.uid, 'videoQueue', videoDetails.id);
            const videoData = {
                parentId: user.uid,
                createdAt: new Date().toISOString(),
                title: videoDetails.title,
                thumbnailUrl: videoDetails.thumbnailUrl,
                channelId: videoDetails.channelId,
                channelTitle: videoDetails.channelTitle,
            };
    
            setDocumentNonBlocking(videoRef, videoData, { merge: true });
    
            toast({
                title: 'Video Added!',
                description: 'The video has been added to the feed.',
            });
    
            setYoutubeLink('');
        } catch (error) {
            console.error('Error adding video by link:', error);
            toast({
                variant: 'destructive',
                title: 'Error adding video',
                description: (error as Error).message || 'Could not fetch video details.',
            });
        } finally {
            setIsAddingVideo(false);
        }
    };
    
    const handleClearFeed = async () => {
        if (!user || !firestore) return;
        if (!videosInQueue || videosInQueue.length === 0) {
            toast({
                title: 'Feed is already empty',
            });
            return;
        }

        setIsClearingFeed(true);
        try {
            const batch = writeBatch(firestore);
            videosInQueue.forEach(video => {
                const videoRef = doc(firestore, 'parents', user.uid, 'videoQueue', video.id);
                batch.delete(videoRef);
            });
            await batch.commit();

            toast({
                title: 'Feed Cleared',
                description: `Successfully removed ${videosInQueue.length} video(s) from the feed.`,
            });
        } catch (error) {
            console.error('Error clearing feed:', error);
            toast({
                variant: 'destructive',
                title: 'Error Clearing Feed',
                description: (error as Error).message || 'Could not remove videos from the feed.',
            });
        } finally {
            setIsClearingFeed(false);
        }
    };

    const handleSendJoinRequest = async () => {
      if (!user || !firestore || !classCode.trim() || !selectedChildId) {
        toast({
          variant: 'destructive',
          title: 'Missing Information',
          description: 'Please provide a class code and select a child.',
        });
        return;
      }
  
      setIsSendingRequest(true);
      try {
        const classRef = doc(firestore, 'classes', classCode.trim());
        const classSnap = await getDoc(classRef);
  
        if (!classSnap.exists()) {
          throw new Error('Class not found. Please check the code.');
        }
  
        const classData = classSnap.data() as Class;
        const selectedProfile = profiles?.find(p => p.id === selectedChildId);
  
        if (!selectedProfile) {
          throw new Error('Selected child profile not found.');
        }
  
        // 1. Add join request
        const joinRequestsRef = collection(firestore, 'classJoinRequests');
        const requestData = {
          classId: classSnap.id,
          className: classData.name,
          teacherId: classData.teacherId,
          parentId: user.uid,
          childProfileId: selectedProfile.id,
          childName: selectedProfile.name,
          childAvatarUrl: selectedProfile.avatarUrl || '',
          status: 'pending',
          createdAt: new Date().toISOString(),
          viewers: [user.uid, classData.teacherId],
        };
        await addDocumentNonBlocking(joinRequestsRef, requestData);
  
        // 2. Grant teacher read access to child profile
        const childRef = doc(firestore, 'parents', user.uid, 'childProfiles', selectedProfile.id);
        const currentSharedIds = selectedProfile.sharedWithTeacherIds || [];
        if (!currentSharedIds.includes(classData.teacherId)) {
          await updateDoc(childRef, {
            sharedWithTeacherIds: [...currentSharedIds, classData.teacherId],
          });
        }
  
        toast({
          title: 'Request Sent!',
          description: `A request for ${selectedProfile.name} to join "${classData.name}" has been sent.`,
        });
  
        setClassCode('');
        setSelectedChildId('');
      } catch (error) {
        console.error('Error sending join request:', error);
        toast({
          variant: 'destructive',
          title: 'Error Sending Request',
          description: (error as Error).message || 'An unexpected error occurred.',
        });
      } finally {
        setIsSendingRequest(false);
      }
    };

    const handleLogout = () => {
      if (auth) {
        signOut(auth).then(() => {
          router.push('/login');
        });
      }
    };
    
  return (
    <div className="light min-h-screen bg-white font-body text-foreground">
      <header className="flex flex-wrap items-center justify-between gap-4 bg-card p-4 shadow-sm">
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
                asChild
                className="rounded-full border-gray-300 text-foreground"
            >
                <Link href="/profiles" className="px-3 sm:px-4">
                <Users className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Profiles</span>
                </Link>
            </Button>
            <Button
                variant="outline"
                onClick={handleLogout}
                className="rounded-full border-gray-300 text-foreground px-3 sm:px-4"
            >
                <LogOut className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
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
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Aggregated analytics coming soon.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gray-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Videos in Queue
              </CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoadingQueue ? <Loader2 className="h-6 w-6 animate-spin" /> : (videosInQueue?.length ?? 0)}</div>
              <p className="text-xs text-muted-foreground">
                Total videos approved for watching.
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
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Aggregated analytics coming soon.
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
              <div 
                key={profile.id} 
                className="flex flex-col items-start gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
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
                    <p className="text-sm text-muted-foreground">Age: {profile.age}</p>
                  </div>
                </div>
                <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto">
                  <Button
                    style={{ backgroundColor: '#FF4081' }}
                    className="flex-1 rounded-full px-5 text-white hover:bg-[#FF4081]/90 sm:flex-none"
                    asChild
                  >
                    <Link href={`/feed/${profile.id}`}>Watch</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={(e) => { e.stopPropagation(); handleEditProfile(profile);}}
                  >
                    <Pencil className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    asChild
                  >
                    <Link href={`/parent-dashboard/analytics/${profile.id}`}>
                      <BarChart3 className="h-5 w-5" />
                    </Link>
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
          
          <div className="space-y-6">
            <YoutubeDiscovery />

            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Join a Class</CardTitle>
                <CardDescription>
                  Enter a class code from a teacher to send a join request.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Enter Class Code"
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value)}
                  />
                  <Select value={selectedChildId} onValueChange={setSelectedChildId} disabled={!profiles || profiles.length === 0}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a child to enroll" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles?.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                           <div className="flex items-center gap-2">
                            {profile.avatarUrl && (
                                <Image src={profile.avatarUrl} alt={profile.name} width={24} height={24} className="rounded-full" />
                            )}
                            <span>{profile.name}</span>
                           </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSendJoinRequest} disabled={isSendingRequest || !classCode || !selectedChildId} className="w-full">
                  {isSendingRequest ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Send Join Request
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Add Video by Link</CardTitle>
                <CardDescription>
                  Paste a YouTube link to add it to the feed for all children.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex w-full items-center space-x-2">
                  <Input
                    type="text"
                    id="youtubeLink"
                    placeholder="Paste YouTube link here"
                    value={youtubeLink}
                    onChange={(e) => setYoutubeLink(e.target.value)}
                    className="flex-grow"
                  />
                  <Button onClick={handleAddVideo} disabled={isAddingVideo}>
                    {isAddingVideo ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Add Video' }
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 border-destructive">
              <CardHeader>
                <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  This action is permanent and cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleClearFeed}
                  disabled={isClearingFeed || isLoadingQueue || !videosInQueue || videosInQueue.length === 0}
                >
                  {isClearingFeed ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Clear Entire Feed
                </Button>
                {!isLoadingQueue && (!videosInQueue || videosInQueue.length === 0) && (
                    <p className="text-xs text-muted-foreground text-center mt-2">The feed is already empty.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <ProfileFormDialog open={dialogOpen} onOpenChange={setDialogOpen} profile={profileToEdit} />
    </div>
  );
}
