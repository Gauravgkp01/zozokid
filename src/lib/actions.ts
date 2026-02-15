'use server';

import { revalidatePath } from 'next/cache';

export async function updatePreferences(values: any) {
  console.log('Updating preferences with:', values);
  // In a real app, you would save these values to your database.
  
  // Revalidate the feed path to ensure the AI-curation uses the latest preferences.
  revalidatePath('/feed');

  return { success: true, message: 'Preferences updated successfully.' };
}
