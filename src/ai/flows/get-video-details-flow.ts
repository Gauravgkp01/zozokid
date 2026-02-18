'use server';
/**
 * @fileOverview A flow for getting details of a single YouTube video.
 *
 * - getVideoDetails - A function that fetches details for a given video ID.
 * - GetVideoDetailsInput - The input type for the getVideoDetails function.
 * - VideoDetails - The return type for the getVideoDetails function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

const GetVideoDetailsInputSchema = z.string().describe('A YouTube video ID.');
export type GetVideoDetailsInput = z.infer<typeof GetVideoDetailsInputSchema>;

const VideoDetailsSchema = z.object({
  id: z.string(),
  title: z.string(),
  thumbnailUrl: z.string(),
  channelId: z.string(),
  channelTitle: z.string(),
});
export type VideoDetails = z.infer<typeof VideoDetailsSchema>;

export async function getVideoDetails(input: GetVideoDetailsInput): Promise<VideoDetails> {
    return getVideoDetailsFlow(input);
}

const getVideoDetailsFlow = ai.defineFlow(
    {
      name: 'getVideoDetailsFlow',
      inputSchema: GetVideoDetailsInputSchema,
      outputSchema: VideoDetailsSchema,
    },
    async (videoId) => {
        const apiKey = process.env.YOUTUBE_API_KEY;
        if (!apiKey) {
            throw new Error('YOUTUBE_API_KEY environment variable not set.');
        }

        const videoDetailsUrl = `${YOUTUBE_API_BASE_URL}/videos?part=snippet&id=${videoId}&key=${apiKey}`;
        const response = await fetch(videoDetailsUrl);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to fetch video details from YouTube API: ${errorData.error.message}`);
        }
        const data = await response.json();
        const video = data.items[0];

        if (!video) {
            throw new Error(`Video with ID '${videoId}' not found.`);
        }

        return {
            id: video.id,
            title: video.snippet.title,
            thumbnailUrl: video.snippet.thumbnails.default.url,
            channelId: video.snippet.channelId,
            channelTitle: video.snippet.channelTitle,
        };
    }
);
