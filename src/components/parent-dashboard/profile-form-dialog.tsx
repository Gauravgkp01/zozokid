'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useFirebase, addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { ChildProfile } from '@/app/parent-dashboard/page';

const classLevels = [
  'Pre-nursery',
  'Nursery',
  'LKG',
  'UKG',
  '1st',
  '2nd',
  '3rd',
  '4th',
  '5th',
] as const;

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  dateOfBirth: z.date({
    required_error: 'A date of birth is required.',
  }),
  class: z.enum(classLevels, {
    required_error: 'You need to select a class level.',
  }),
  avatarUrl: z.string().url({ message: 'Please select an avatar.' }),
});

const avatars = PlaceHolderImages.filter((p) => p.id.startsWith('avatar-'));

interface ProfileFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: ChildProfile;
}

export function ProfileFormDialog({ open, onOpenChange, profile }: ProfileFormDialogProps) {
  const { user, firestore } = useFirebase();
  const isEditMode = !!profile;

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (profile && open) {
      form.reset({
        name: profile.name,
        dateOfBirth: new Date(profile.dateOfBirth),
        class: profile.class,
        avatarUrl: profile.avatarUrl,
      });
    } else if (!profile && open) {
      form.reset({
        name: '',
        dateOfBirth: undefined,
        class: undefined,
        avatarUrl: avatars[0]?.imageUrl,
      });
    }
  }, [profile, open, form]);

  function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in.',
      });
      return;
    }

    const profileData = {
      parentId: user.uid,
      name: values.name,
      dateOfBirth: values.dateOfBirth.toISOString().split('T')[0], // YYYY-MM-DD
      class: values.class,
      avatarUrl: values.avatarUrl,
      updatedAt: new Date().toISOString(),
    };

    if (isEditMode) {
      // Update existing profile
      const profileRef = doc(firestore, 'parents', user.uid, 'childProfiles', profile.id);
      const updatedData = {
        ...profileData,
        createdAt: profile.createdAt // Preserve original creation date
      }
      setDocumentNonBlocking(profileRef, updatedData, { merge: true });
      toast({
        title: 'Profile Updated',
        description: `${values.name}'s profile has been updated.`,
      });

    } else {
      // Add new profile
      const newProfileData = {
        ...profileData,
        allowedChannelIds: [],
        blockedChannelIds: [],
        allowedContentTypeIds: [],
        blockedContentTypeIds: [],
        createdAt: new Date().toISOString(),
      }
      const childProfilesCollection = collection(
        firestore,
        'parents',
        user.uid,
        'childProfiles'
      );
      addDocumentNonBlocking(childProfilesCollection, newProfileData);
      toast({
        title: 'Profile Added',
        description: `${values.name} has been added to your profiles.`,
      });
    }
    
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Profile' : 'Add a New Child Profile'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update your child's details below." : "Enter the details below to create a new profile for your child."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Choose an Avatar</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-4 gap-4"
                    >
                      {avatars.map((avatar) => (
                        <FormItem key={avatar.id} className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={avatar.imageUrl} className="sr-only" />
                          </FormControl>
                          <FormLabel className={cn("cursor-pointer rounded-full border-2 border-transparent transition-all", field.value === avatar.imageUrl && "border-primary ring-2 ring-primary")}>
                            <Image
                              src={avatar.imageUrl}
                              alt={avatar.description}
                              width={64}
                              height={64}
                              className="rounded-full"
                            />
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Child's Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Pippo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="class"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">{isEditMode ? 'Save Changes' : 'Create Profile'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
