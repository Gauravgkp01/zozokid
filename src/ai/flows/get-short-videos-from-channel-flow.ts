'use server';
/**
 * @fileOverview A flow for getting short videos from a youtube channel.
 *
 * - getShortVideosFromChannel - A function that fetches all videos from a channel and filters them by duration (< 2 minutes).
 * - GetShortVideosFromChannelInput - The input type for the getShortVideosFromChannel function.
 * - GetShortVideosFromChannelOutput - The return type for the getShortVideosFromChannel function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Schemas
const GetShortVideosFromChannelInputSchema = z.string().describe('A YouTube channel ID.');
export type GetShortVideosFromChannelInput = z.infer<typeof GetShortVideosFromChannelInputSchema>;

const GetShortVideosFromChannelOutputSchema = z.array(z.string()).describe('A list of YouTube video IDs.');
export type GetShortVideosFromChannelOutput = z.infer<typeof GetShortVideosFromChannelOutputSchema>;

// Helper function to parse ISO 8601 duration
function parseISO8601Duration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    return hours * 3600 + minutes * 60 + seconds;
}


// Exported wrapper function
export async function getShortVideosFromChannel(input: GetShortVideosFromChannelInput): Promise<GetShortVideosFromChannelOutput> {
  return getShortVideosFromChannelFlow(input);
}


const getShortVideosFromChannelFlow = ai.defineFlow(
  {
    name: 'getShortVideosFromChannelFlow',
    inputSchema: GetShortVideosFromChannelInputSchema,
    outputSchema: GetShortVideosFromChannelOutputSchema,
  },
  async (channelId) => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error('YOUTUBE_API_KEY environment variable not set.');
    }

    // 1. Get the uploads playlist ID from the channel ID
    const channelDetailsUrl = `${YOUTUBE_API_BASE_URL}/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
    const channelResponse = await fetch(channelDetailsUrl);
    if (!channelResponse.ok) {
        throw new Error('Failed to fetch channel details from YouTube API.');
    }
    const channelData = await channelResponse.json();
    const uploadsPlaylistId = channelData.items[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) {
        throw new Error('Could not find uploads playlist for the channel.');
    }

    // 2. Fetch all video IDs from the uploads playlist (paginated)
    let allVideoIds: string[] = [];
    let nextPageToken: string | undefined;
    do {
        const playlistItemsUrl = `${YOUTUBE_API_BASE_URL}/playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}${nextPageToken ? `&pageToken=${nextPageToken}`: ''}`;
        const playlistResponse = await fetch(playlistItemsUrl);
        if (!playlistResponse.ok) {
            throw new Error('Failed to fetch playlist items from YouTube API.');
        }
        const playlistData = await playlistResponse.json();
        const videoIds = playlistData.items.map((item: any) => item.contentDetails.videoId).filter(Boolean);
        allVideoIds.push(...videoIds);
        nextPageToken = playlistData.nextPageToken;
    } while (nextPageToken);

    // 3. Fetch video details in batches of 50 to get durations
    const shortVideoIds: string[] = [];
    for (let i = 0; i < allVideoIds.length; i += 50) {
        const videoIdBatch = allVideoIds.slice(i, i + 50);
        const videoDetailsUrl = `${YOUTUBE_API_BASE_URL}/videos?part=contentDetails&id=${videoIdBatch.join(',')}&key=${apiKey}`;
        const videoDetailsResponse = await fetch(videoDetailsUrl);
        if (!videoDetailsResponse.ok) {
            console.error('Failed to fetch video details for a batch.');
            continue; // Skip batch on error
        }
        const videoDetailsData = await videoDetailsResponse.json();
        
        // 4. Filter videos by duration (< 120 seconds)
        videoDetailsData.items.forEach((video: any) => {
            const duration = video.contentDetails.duration;
            if (parseISO8601Duration(duration) < 120) {
                shortVideoIds.push(video.id);
            }
        });
    }
    
    return shortVideoIds;
  }
);
