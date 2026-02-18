'use client';

import { useState } from 'react';
import Image from 'next/image';
import { discoverYoutubeContent, type YoutubeChannelResult, type YoutubeVideoResult } from '@/ai/flows/youtube-search-flow';
import { getShortVideosFromChannel } from '@/ai/flows/get-short-videos-from-channel-flow';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Search, Video, PlusCircle } from 'lucide-react';
import { useFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

type YoutubeSearchOutput = {
    channels: YoutubeChannelResult[];
    videos: YoutubeVideoResult[];
}

export function YoutubeDiscovery() {
    const { user, firestore } = useFirebase();
    const { toast } = useToast();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<YoutubeSearchOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [addingChannelId, setAddingChannelId] = useState<string | null>(null);


    const handleSearch = async () => {
        if (!query.trim()) return;
        setIsLoading(true);
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
        setIsLoading(false);
    };

    const handleAddVideo = (videoId: string) => {
        if (!user || !firestore) {
            toast({
                variant: 'destructive',
                title: 'Not logged in',
                description: 'You must be logged in to add videos.',
            });
            return;
        }

        const videoRef = doc(firestore, 'parents', user.uid, 'videoQueue', videoId);
        const videoData = {
            parentId: user.uid,
            createdAt: new Date().toISOString(),
        };

        setDocumentNonBlocking(videoRef, videoData, { merge: true });

        toast({
            title: 'Video Added!',
            description: 'The video has been added to the feed.',
        });
    };

    const handleAddChannel = async (channel: YoutubeChannelResult) => {
        if (!user || !firestore) {
            toast({
                variant: 'destructive',
                title: 'Not logged in',
                description: 'You must be logged in to add a channel.',
            });
            return;
        }
        setAddingChannelId(channel.id);
        toast({
            title: `Adding videos from ${channel.title}...`,
            description: 'This might take a moment. We are filtering for short videos.',
        });
    
        try {
            const videoIds = await getShortVideosFromChannel(channel.id);
    
            if (videoIds.length === 0) {
                toast({
                    title: 'No short videos found',
                    description: `We couldn't find any videos under 2 minutes in ${channel.title}.`,
                });
                return;
            }
    
            let addedCount = 0;
            for (const videoId of videoIds) {
                const videoRef = doc(firestore, 'parents', user.uid, 'videoQueue', videoId);
                const videoData = {
                    parentId: user.uid,
                    createdAt: new Date().toISOString(),
                };
                setDocumentNonBlocking(videoRef, videoData, { merge: true });
                addedCount++;
            }
    
            toast({
                title: 'Channel Content Added!',
                description: `${addedCount} videos from ${channel.title} were added to the feed.`,
            });
    
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

    return (
        <Card className="bg-gray-50">
            <CardHeader>
                <CardTitle className="text-lg">Discover Content</CardTitle>
                <CardDescription>
                    Search for channels or categories to find new videos.
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
                    <Button onClick={handleSearch} disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        <span className="sr-only">Search</span>
                    </Button>
                </div>

                {isLoading && (
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
                                                Add Channel
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
                                            <Button size="sm" onClick={() => handleAddVideo(video.id)}>
                                                <Video className="mr-2 h-4 w-4" /> Add
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
    );
}
