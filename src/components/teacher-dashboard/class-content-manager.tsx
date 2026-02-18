'use client';

import { useState } from 'react';
import Image from 'next/image';
import { discoverYoutubeContent, type YoutubeChannelResult, type YoutubeVideoResult } from '@/ai/flows/youtube-search-flow';
import { getShortVideosFromChannel } from '@/ai/flows/get-short-videos-from-channel-flow';
import { getVideoDetails } from '@/ai/flows/get-video-details-flow';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Search, Video, PlusCircle, Link as LinkIcon } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { doc, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Class } from '@/app/teacher-dashboard/page';

type YoutubeSearchOutput = {
    channels: YoutubeChannelResult[];
    videos: YoutubeVideoResult[];
}

type ClassContentManagerProps = {
    classData: Class;
};

export function ClassContentManager({ classData }: ClassContentManagerProps) {
    const { firestore } = useFirebase();
    const { toast } = useToast();

    // State for YouTube Discovery
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<YoutubeSearchOutput | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [addingChannelId, setAddingChannelId] = useState<string | null>(null);
    const [addingVideoId, setAddingVideoId] = useState<string | null>(null);


    // State for Add by Link
    const [youtubeLink, setYoutubeLink] = useState('');
    const [isAddingByLink, setIsAddingByLink] = useState(false);

    const handleBatchAddVideos = async (videosToAdd: { id: string, title: string, thumbnailUrl: string, channelId: string, channelTitle: string }[]) => {
        if (!firestore || !classData.students || classData.students.length === 0) {
            toast({
                variant: 'destructive',
                title: 'No Students in Class',
                description: 'You cannot add videos because there are no students enrolled in this class.',
            });
            return false;
        }

        try {
            const batch = writeBatch(firestore);
            
            videosToAdd.forEach(video => {
                const videoData = {
                    createdAt: new Date().toISOString(),
                    title: video.title,
                    thumbnailUrl: video.thumbnailUrl,
                    channelId: video.channelId,
                    channelTitle: video.channelTitle,
                };

                classData.students.forEach(student => {
                    const videoRef = doc(firestore, 'parents', student.parentId, 'videoQueue', video.id);
                    batch.set(videoRef, { ...videoData, parentId: student.parentId }, { merge: true });
                });
            });

            await batch.commit();
            return true;
        } catch (error) {
            console.error('Error adding videos in batch:', error);
            toast({
                variant: 'destructive',
                title: 'Error Adding Videos',
                description: (error as Error).message || 'Could not add videos to the class feed.',
            });
            return false;
        }
    };


    const handleSearch = async () => {
        if (!query.trim()) return;
        setIsSearching(true);
        setResults(null);
        try {
            const searchResults = await discoverYoutubeContent(query);
            setResults(searchResults);
        } catch (error) {
            console.error('Error searching YouTube:', error);
            toast({
                variant: 'destructive',
                title: 'Search Failed',
                description: (error as Error).message || 'Could not fetch YouTube search results.',
            });
        }
        setIsSearching(false);
    };

    const handleAddVideo = async (video: YoutubeVideoResult) => {
        setAddingVideoId(video.id);
        const success = await handleBatchAddVideos([video]);
        if (success) {
            toast({
                title: 'Video Added!',
                description: `"${video.title}" was added to the feed for all ${classData.students.length} student(s).`,
            });
        }
        setAddingVideoId(null);
    };

    const handleAddChannel = async (channel: YoutubeChannelResult) => {
        setAddingChannelId(channel.id);
        toast({
            title: `Adding videos from ${channel.title}...`,
            description: 'This might take a moment. We are filtering for short videos.',
        });
    
        try {
            const videos = await getShortVideosFromChannel(channel.id);
    
            if (videos.length === 0) {
                toast({
                    title: 'No short videos found',
                    description: `We couldn't find any videos under 2 minutes in ${channel.title}.`,
                });
                setAddingChannelId(null);
                return;
            }
            
            const success = await handleBatchAddVideos(videos);

            if (success) {
                 toast({
                    title: 'Channel Content Added!',
                    description: `${videos.length} videos from ${channel.title} were added to the feed for all ${classData.students.length} student(s).`,
                });
            }
    
        } catch (error) {
            console.error('Error adding channel videos:', error);
            toast({
                variant: 'destructive',
                title: 'Failed to add channel',
                description: (error as Error).message || 'Could not add videos from the channel.',
            });
        } finally {
            setAddingChannelId(null);
        }
    };

    const extractVideoID = (url: string) => {
        const regex = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^&?/]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };
      
    const handleAddVideoByLink = async () => {
        const videoId = extractVideoID(youtubeLink);
    
        if (!videoId) {
          toast({
            variant: 'destructive',
            title: 'Invalid YouTube link',
            description: 'Please provide a valid YouTube video link.',
          });
          return;
        }
        
        setIsAddingByLink(true);
        try {
            const videoDetails = await getVideoDetails(videoId);
            const success = await handleBatchAddVideos([videoDetails]);

            if (success) {
                toast({
                    title: 'Video Added!',
                    description: `The video has been added to the feed for all ${classData.students.length} student(s).`,
                });
                setYoutubeLink('');
            }
        } catch (error) {
            console.error('Error adding video by link:', error);
            toast({
                variant: 'destructive',
                title: 'Error adding video',
                description: (error as Error).message || 'Could not fetch video details.',
            });
        } finally {
            setIsAddingByLink(false);
        }
    };


    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Add Video by Link</CardTitle>
                    <CardDescription>
                        Paste a YouTube link to add it to the feed for all students in this class.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex w-full items-center space-x-2">
                        <Input
                            type="text"
                            placeholder="Paste YouTube link here"
                            value={youtubeLink}
                            onChange={(e) => setYoutubeLink(e.target.value)}
                            className="flex-grow"
                        />
                        <Button onClick={handleAddVideoByLink} disabled={isAddingByLink}>
                            {isAddingByLink ? <Loader2 className="h-4 w-4 animate-spin"/> : <LinkIcon className="h-4 w-4" /> }
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Discover Content for Class</CardTitle>
                    <CardDescription>
                        Search for channels or videos to add to the feed for all students.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex w-full items-center space-x-2">
                        <Input
                            type="text"
                            placeholder="Search YouTube..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button onClick={handleSearch} disabled={isSearching}>
                            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            <span className="sr-only">Search</span>
                        </Button>
                    </div>

                    {isSearching && (
                        <div className="mt-6 flex justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    )}
                    
                    {results && (
                        <div className="mt-6 space-y-6 max-h-96 overflow-y-auto pr-2">
                            {results.channels.length > 0 && (
                                <div>
                                    <h3 className="text-md font-semibold mb-2">Channels</h3>
                                    <div className="space-y-2">
                                        {results.channels.map(channel => (
                                            <div key={channel.id} className="flex items-center gap-3 rounded-lg border p-2">
                                                <Image src={channel.thumbnailUrl} alt={channel.title} width={40} height={40} className="rounded-full" />
                                                <div className="flex-1">
                                                    <p className="font-bold truncate">{channel.title}</p>
                                                </div>
                                                <Button size="sm" onClick={() => handleAddChannel(channel)} disabled={addingChannelId === channel.id}>
                                                    {addingChannelId === channel.id ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <PlusCircle className="mr-2 h-4 w-4" />
                                                    )}
                                                    Add Channel Shorts
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {results.videos.length > 0 && (
                                <div>
                                    <h3 className="text-md font-semibold mb-2">Videos</h3>
                                    <div className="space-y-2">
                                        {results.videos.map(video => (
                                            <div key={video.id} className="flex items-center gap-3 rounded-lg border p-2">
                                                 <Image src={video.thumbnailUrl} alt={video.title} width={64} height={36} className="rounded-md object-cover" />
                                                 <div className="flex-1">
                                                    <p className="font-bold text-sm truncate">{video.title}</p>
                                                    <p className="text-xs text-muted-foreground">{video.channelTitle}</p>
                                                 </div>
                                                <Button size="sm" onClick={() => handleAddVideo(video)} disabled={addingVideoId === video.id}>
                                                    {addingVideoId === video.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Video className="mr-2 h-4 w-4" />}
                                                    Add
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {results.channels.length === 0 && results.videos.length === 0 && (
                                <p className="text-center text-muted-foreground mt-6">No results found.</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
