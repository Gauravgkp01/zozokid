'use server';
/**
 * @fileOverview A Genkit flow for intelligently curating YouTube Shorts for children,
 * considering parental preferences, age-appropriateness, and content exclusions.
 *
 * - intelligentSafeFeedCuration - A function that initiates the content curation process.
 * - IntelligentSafeFeedCurationInput - The input type for the intelligentSafeFeedCuration function.
 * - IntelligentSafeFeedCurationOutput - The return type for the intelligentSafeFeedCuration function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const IntelligentSafeFeedCurationInputSchema = z.object({
  childAge: z.number().describe("The age of the child in years."),
  childInterests: z.array(z.string()).describe("A list of topics or categories the child is interested in (e.g., 'animals', 'science experiments', 'cartoons')."),
  excludedChannels: z.array(z.string()).describe("A list of YouTube channel names or IDs to strictly exclude from recommendations."),
  excludedKeywords: z.array(z.string()).describe("A list of keywords or phrases that should not appear in video titles or descriptions."),
  seedTopic: z.string().optional().describe("An optional initial topic to kickstart the content curation (e.g., 'dinosaur facts', 'creative drawing ideas')."),
  previousVideos: z.array(z.object({
    videoId: z.string(),
    title: z.string(),
    channelName: z.string(),
  })).optional().describe("A list of previously watched videos by the child, used to refine recommendations and avoid duplicates."),
});
export type IntelligentSafeFeedCurationInput = z.infer<typeof IntelligentSafeFeedCurationInputSchema>;

const IntelligentSafeFeedCurationOutputSchema = z.object({
  youtubeSearchQueries: z.array(z.string()).describe("A list of YouTube search queries tailored for the child's profile, avoiding excluded content and suitable for short-form video."),
  curationRationale: z.string().describe("A brief explanation of the curation strategy and why these types of queries were generated."),
  recommendedCategories: z.array(z.string()).describe("A list of content categories recommended for the child based on their profile and interests."),
});
export type IntelligentSafeFeedCurationOutput = z.infer<typeof IntelligentSafeFeedCurationOutputSchema>;

export async function intelligentSafeFeedCuration(input: IntelligentSafeFeedCurationInput): Promise<IntelligentSafeFeedCurationOutput> {
  return intelligentSafeFeedCurationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentSafeFeedCurationPrompt',
  input: { schema: IntelligentSafeFeedCurationInputSchema },
  output: { schema: IntelligentSafeFeedCurationOutputSchema },
  prompt: `You are an intelligent content curator for a kids' YouTube platform called KidTube Safe. Your primary goal is to generate YouTube search queries and content categories that are appropriate for a child, safe, and strictly avoid specific exclusions. The queries should be designed to find short-form video content (like YouTube Shorts).

Here is the child's profile:
- Age: {{{childAge}}} years old
- Interests: {{#each childInterests}}- {{{this}}}
{{/each}}

Here are the parental exclusions to strictly follow:
- Excluded Channels: {{#if excludedChannels}}{{#each excludedChannels}}- {{{this}}}
{{/each}}{{else}}None specified.{{/if}}
- Excluded Keywords (in titles/descriptions): {{#if excludedKeywords}}{{#each excludedKeywords}}- {{{this}}}
{{/each}}{{else}}None specified.{{/if}}

{{#if seedTopic}}
Consider "{{{seedTopic}}}" as an initial topic for curation. Expand on this topic safely and appropriately.
{{/if}}

{{#if previousVideos.length}}
Based on the child's previous viewing history, try to identify new, interesting content while avoiding direct duplicates or content from channels that might have been implicitly disliked:
{{#each previousVideos}}- Video: "{{{title}}}" from channel "{{{channelName}}}"
{{/each}}
{{/if}}

Generate up to 5 YouTube search queries. These queries should be concise, directly usable in a YouTube search engine, and optimized for finding short-form video content. Ensure they lead to engaging and educational content suitable for the child's age, and actively avoid all specified excluded channels and keywords.

Also, provide a list of 3-5 recommended content categories based on the child's profile and a brief rationale for your curation strategy, explaining how you balanced interests with safety and exclusions.

Strictly adhere to the output JSON format provided by the schema.`,
});

const intelligentSafeFeedCurationFlow = ai.defineFlow(
  {
    name: 'intelligentSafeFeedCurationFlow',
    inputSchema: IntelligentSafeFeedCurationInputSchema,
    outputSchema: IntelligentSafeFeedCurationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
