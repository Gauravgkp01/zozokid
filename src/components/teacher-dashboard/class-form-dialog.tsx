'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
import { useFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

const classSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Class name must be at least 2 characters.' }),
});

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
      studentIds: [], // Student selection will be implemented later
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
      form.reset();
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a New Class</DialogTitle>
          <DialogDescription>
            Enter a name for your new class. You can add students later.
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

            <div className="space-y-2">
              <FormLabel>Add Students</FormLabel>
              <div className="rounded-md border border-dashed p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  No students available to add. Parents must first share their
                  child's profile with you from their dashboard.
                </p>
              </div>
            </div>

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
