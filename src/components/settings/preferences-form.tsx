'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { updatePreferences } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

const preferencesSchema = z.object({
  childName: z.string().min(2, 'Name must be at least 2 characters.'),
  childAge: z.coerce
    .number()
    .min(2, 'Age must be at least 2.')
    .max(18, 'Age must be 18 or less.'),
  childInterests: z.string().min(3, 'Please list at least one interest.'),
  excludedChannels: z.string().optional(),
  excludedKeywords: z.string().optional(),
});

export function PreferencesForm() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof preferencesSchema>>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      childName: 'Alex',
      childAge: 8,
      childInterests: 'Minecraft, LEGO, Drawing, Space',
      excludedChannels: 'Cocomelon, T-Series',
      excludedKeywords: 'scary, horror, violence',
    },
  });

  async function onSubmit(values: z.infer<typeof preferencesSchema>) {
    await updatePreferences(values);
    toast({
      title: 'Preferences Updated',
      description: 'Your feed will be updated with new content shortly.',
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Content Preferences</CardTitle>
            <CardDescription>
              These settings will be used by our AI to curate a safe feed for
              your child.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="childName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Child&apos;s Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Alex" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="childAge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Child&apos;s Age</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="childInterests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interests</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="minecraft, lego, drawing..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Separate interests with a comma. This helps us find videos
                    they&apos;ll love.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="excludedChannels"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Excluded Channels</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Cocomelon, T-Series..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Channels to block. Separate with a comma.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="excludedKeywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Excluded Keywords</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="scary, horror, violence..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Block videos with these words in the title or description.
                    Separate with a comma.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit">Save Preferences</Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
