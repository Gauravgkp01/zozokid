'use client';

import { useState } from 'react';
import Image from 'next/image';
import { discoverYoutubeContent, type YoutubeChannelResult, type YoutubeVideoResult } from '@/ai/flows/youtube-search-flow';
import { getShortVideosFromChannel } from '@/ai/flows/get-short-videos-from-channel-flow';
import { getVideoDetails } from '@/ai/flows/get-video-details-flow';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Search, Video, PlusCircle, Link as LinkIcon, Trash2 } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { doc, writeBatch, updateDoc, arrayUnion } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Class, AddedContent } from '@/app/teacher-dashboard/page';

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

    // State for Deletion
    const [isDeleting, setIsDeleting] = useState<string | null>(null); // Use a unique identifier for the item being deleted
    const [isClearing, setIsClearing] = useState(false);

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
        if (success && firestore) {
            const classRef = doc(firestore, 'classes', classData.id);
            await updateDoc(classRef, {
                content: arrayUnion({
                    type: 'video',
                    id: video.id,
                    title: video.title,
                    thumbnailUrl: video.thumbnailUrl,
                    addedAt: new Date().toISOString()
                })
            });
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

            if (success && firestore) {
                 const classRef = doc(firestore, 'classes', classData.id);
                 await updateDoc(classRef, {
                     content: arrayUnion({
                         type: 'channel',
                         id: channel.id,
                         title: channel.title,
                         thumbnailUrl: channel.thumbnailUrl,
                         addedAt: new Date().toISOString()
                     })
                 });
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

            if (success && firestore) {
                const classRef = doc(firestore, 'classes', classData.id);
                await updateDoc(classRef, {
                    content: arrayUnion({
                        type: 'video',
                        id: videoDetails.id,
                        title: videoDetails.title,
                        thumbnailUrl: videoDetails.thumbnailUrl,
                        addedAt: new Date().toISOString()
                    })
                });
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

    const handleDeleteContent = async (itemToDelete: AddedContent) => {
        if (!firestore || !classData.students || classData.students.length === 0) {
            toast({ variant: 'destructive', title: 'No Students in Class' });
            return;
        }

        const uniqueItemId = itemToDelete.id + itemToDelete.addedAt;
        setIsDeleting(uniqueItemId);

        try {
            let videosToDelete: { id: string }[] = [];
            if (itemToDelete.type === 'video') {
                videosToDelete.push({ id: itemToDelete.id });
            } else if (itemToDelete.type === 'channel') {
                videosToDelete = await getShortVideosFromChannel(itemToDelete.id);
            }

            if (videosToDelete.length === 0 && itemToDelete.type === 'channel') {
                 toast({ title: 'No videos to remove.' });
            } else {
                const batch = writeBatch(firestore);
    
                // Delete videos from student queues
                classData.students.forEach(student => {
                    videosToDelete.forEach(video => {
                        const videoRef = doc(firestore, 'parents', student.parentId, 'videoQueue', video.id);
                        batch.delete(videoRef);
                    });
                });
    
                // Remove content from class document
                const classRef = doc(firestore, 'classes', classData.id);
                const updatedContent = (classData.content || []).filter(c => c.id !== itemToDelete.id || c.addedAt !== itemToDelete.addedAt);
                batch.update(classRef, { content: updatedContent });
                
                await batch.commit();
    
                toast({
                    title: 'Content Removed',
                    description: `"${itemToDelete.title}" and associated videos have been removed.`,
                });
            }
        } catch (error) {
            console.error('Error deleting content:', error);
            toast({
                variant: 'destructive',
                title: 'Error Removing Content',
                description: (error as Error).message || 'Could not remove the content.',
            });
        } finally {
            setIsDeleting(null);
        }
    };

    const handleClearAllContent = async () => {
        if (!firestore || !classData.students || classData.students.length === 0 || !classData.content || classData.content.length === 0) {
            toast({ title: 'Nothing to clear' });
            return;
        }

        setIsClearing(true);
        try {
            const videoIdsToDelete = new Set<string>();

            const channelPromises = (classData.content || [])
                .filter(item => item.type === 'channel')
                .map(item => getShortVideosFromChannel(item.id));
            
            const videoItems = (classData.content || []).filter(item => item.type === 'video');
            videoItems.forEach(item => videoIdsToDelete.add(item.id));

            const channelVideoLists = await Promise.all(channelPromises);
            channelVideoLists.forEach(list => list.forEach(video => videoIdsToDelete.add(video.id)));

            if (videoIdsToDelete.size === 0) {
                toast({ title: 'No videos to remove.' });
                // Also clear the content array if it only contained empty channels
                const classRef = doc(firestore, 'classes', classData.id);
                await updateDoc(classRef, { content: [] });
            } else {
                const batch = writeBatch(firestore);
    
                // Delete videos from student queues
                classData.students.forEach(student => {
                    videoIdsToDelete.forEach(videoId => {
                        const videoRef = doc(firestore, 'parents', student.parentId, 'videoQueue', videoId);
                        batch.delete(videoRef);
                    });
                });
    
                // Clear content from class document
                const classRef = doc(firestore, 'classes', classData.id);
                batch.update(classRef, { content: [] });
    
                await batch.commit();
    
                toast({
                    title: 'Class Feed Cleared',
                    description: `All ${videoIdsToDelete.size} unique videos have been removed.`,
                });
            }

        } catch (error) {
            console.error('Error clearing class feed:', error);
            toast({
                variant: 'destructive',
                title: 'Error Clearing Feed',
                description: (error as Error).message || 'Could not clear the class feed.',
            });
        } finally {
            setIsClearing(false);
        }
    };


    return (
        <div className="space-y-6">
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
            <Card>
                <CardHeader>
                    <CardTitle>Recently Added Content</CardTitle>
                    <CardDescription>A log of recently added content to this class.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {classData.content && classData.content.length > 0 ? (
                            [...classData.content]
                                .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
                                .map((item) => (
                                    <div key={item.id + item.addedAt} className="flex items-center gap-3 rounded-lg border bg-background p-2">
                                        <Image src={item.thumbnailUrl} alt={item.title} width={48} height={48} className="rounded-md object-cover" />
                                        <div className="flex-1 overflow-hidden">
                                            <p className="font-bold text-sm truncate">{item.title}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleDeleteContent(item)} 
                                            disabled={isDeleting !== null}
                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                                        >
                                            {isDeleting === (item.id + item.addedAt) ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                ))
                        ) : (
                            <p className="text-center text-muted-foreground text-sm py-8">No content has been added to this class yet.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
                    <CardDescription>
                        This will permanently remove all teacher-added content from every student&apos;s feed for this class.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        variant="destructive"
                        className="w-full"
                        onClick={handleClearAllContent}
                        disabled={isClearing || !classData.content || classData.content.length === 0}
                    >
                        {isClearing ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Clear All Added Content
                    </Button>
                    {(!classData.content || classData.content.length === 0) && (
                        <p className="text-xs text-muted-foreground text-center mt-2">The class feed is already empty.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
