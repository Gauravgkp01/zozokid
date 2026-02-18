'use server';
/**
 * @fileOverview A flow for discovering YouTube content.
 *
 * - discoverYoutubeContent - A function that handles searching for YouTube channels and videos.
 * - YoutubeSearchInput - The input type for the discoverYoutubeContent function.
 * - YoutubeSearchOutput - The return type for the discoverYoutubeContent function.
 * - YoutubeChannelResult - The type for a channel search result.
 * - YoutubeVideoResult - The type for a video search result.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Schemas
const YoutubeSearchInputSchema = z.string().describe('A search query for YouTube content.');
export type YoutubeSearchInput = z.infer<typeof YoutubeSearchInputSchema>;

const YoutubeChannelResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  thumbnailUrl: z.string(),
});
export type YoutubeChannelResult = z.infer<typeof YoutubeChannelResultSchema>;

const YoutubeVideoResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  thumbnailUrl: z.string(),
  channelId: z.string(),
  channelTitle: z.string(),
});
export type YoutubeVideoResult = z.infer<typeof YoutubeVideoResultSchema>;

const YoutubeSearchOutputSchema = z.object({
  channels: z.array(YoutubeChannelResultSchema),
  videos: z.array(YoutubeVideoResultSchema),
});
export type YoutubeSearchOutput = z.infer<typeof YoutubeSearchOutputSchema>;

// Exported wrapper function
export async function discoverYoutubeContent(input: YoutubeSearchInput): Promise<YoutubeSearchOutput> {
  return discoverYoutubeContentFlow(input);
}

// Genkit Flow
const discoverYoutubeContentFlow = ai.defineFlow(
  {
    name: 'discoverYoutubeContentFlow',
    inputSchema: YoutubeSearchInputSchema,
    outputSchema: YoutubeSearchOutputSchema,
  },
  async (query) => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error('YOUTUBE_API_KEY environment variable not set.');
    }

    const searchUrl = `${YOUTUBE_API_BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=25&type=video,channel&key=${apiKey}`;

    const response = await fetch(searchUrl);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`YouTube API error: ${errorData.error.message}`);
    }

    const data = await response.json();

    const channels: YoutubeChannelResult[] = [];
    const videos: YoutubeVideoResult[] = [];

    data.items.forEach((item: any) => {
      if (item.id.kind === 'youtube#channel') {
        channels.push({
          id: item.id.channelId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnailUrl: item.snippet.thumbnails.default.url,
        });
      } else if (item.id.kind === 'youtube#video') {
        videos.push({
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnailUrl: item.snippet.thumbnails.default.url,
          channelId: item.snippet.channelId,
          channelTitle: item.snippet.channelTitle,
        });
      }
    });

    return { channels, videos };
  }
);
