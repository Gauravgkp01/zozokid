'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

const classSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Class name must be at least 2 characters.' }),
  avatarUrl: z.string().url({ message: 'Please select an avatar.' }),
});

const classAvatars = PlaceHolderImages.filter((p) =>
  ['avatar-book', 'avatar-apple', 'avatar-abc', 'avatar-globe'].includes(p.id)
);

interface ClassFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClassFormDialog({ open, onOpenChange }: ClassFormDialogProps) {
  const { user, firestore } = useFirebase();

  const form = useForm<z.infer<typeof classSchema>>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: '',
      avatarUrl: classAvatars[0]?.imageUrl,
    },
  });

  function onSubmit(values: z.infer<typeof classSchema>) {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in.',
      });
      return;
    }

    const classData = {
      teacherId: user.uid,
      name: values.name,
      avatarUrl: values.avatarUrl,
      students: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const classesCollection = collection(firestore, 'classes');
    addDocumentNonBlocking(classesCollection, classData);
    toast({
      title: 'Class Created',
      description: `The class "${values.name}" has been created.`,
    });

    onOpenChange(false);
  }

  useEffect(() => {
    if (open) {
      form.reset({
        name: '',
        avatarUrl: classAvatars[0]?.imageUrl,
      });
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a New Class</DialogTitle>
          <DialogDescription>
            Choose a name and avatar for your new class. You can add students later by sharing the class code.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Morning Group" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Choose a Class Avatar</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-4 gap-4"
                    >
                      {classAvatars.map((avatar) => (
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
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Create Class</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
