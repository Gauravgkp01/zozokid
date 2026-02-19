'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  Loader2,
  ArrowRight,
  Trash2,
  Share2,
  School,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ClassFormDialog } from '@/components/teacher-dashboard/class-form-dialog';
import {
  useFirebase,
  useCollection,
  useMemoFirebase,
  setDocumentNonBlocking,
} from '@/firebase';
import {
  collection,
  doc,
  getDoc,
  query,
  where,
  writeBatch,
  getDocs,
  arrayRemove,
} from 'firebase/firestore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { getShortVideosFromChannel } from '@/ai/flows/get-short-videos-from-channel-flow';

export type AddedContent = {
  type: 'video' | 'channel';
  id: string;
  title: string;
  thumbnailUrl: string;
  addedAt: string;
};

export type Class = {
  id: string;
  name: string;
  teacherId: string;
  avatarUrl?: string;
  students: { studentId: string; parentId: string }[];
  content?: AddedContent[];
};

export default function TeacherDashboardPage() {
  const { user, firestore } = useFirebase();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !firestore) return;

    const teacherRef = doc(firestore, 'teachers', user.uid);
    const checkAndCreateTeacherDoc = async () => {
      const docSnap = await getDoc(teacherRef);
      if (!docSnap.exists()) {
        const newTeacherData = {
          id: user.uid,
          externalAuthId: user.uid,
          email: user.email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setDocumentNonBlocking(teacherRef, newTeacherData, { merge: true });
      }
    };
    checkAndCreateTeacherDoc();
  }, [user, firestore]);

  const classesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'classes'),
      where('teacherId', '==', user.uid)
    );
  }, [user, firestore]);

  const { data: classes, isLoading } = useCollection<Class>(classesQuery);

  const analytics = useMemo(() => {
    if (!classes) {
      return { totalClasses: 0, totalStudents: 0 };
    }

    const totalClasses = classes.length;
    const totalStudents = classes.reduce((acc, currentClass) => {
      return acc + (currentClass.students?.length || 0);
    }, 0);

    return { totalClasses, totalStudents };
  }, [classes]);

  const handleDeleteClass = async (classToDelete: Class) => {
    if (!firestore || !user) {
      toast({ variant: 'destructive', title: 'You must be logged in.' });
      return;
    }
    setIsDeleting(classToDelete.id);

    try {
      const batch = writeBatch(firestore);

      // Step 1: Aggregate all video IDs to be deleted from student queues
      if (
        classToDelete.content &&
        classToDelete.content.length > 0 &&
        classToDelete.students &&
        classToDelete.students.length > 0
      ) {
        const videoIdsToDelete = new Set<string>();

        const channelContent = classToDelete.content.filter(
          (item) => item.type === 'channel'
        );
        const videoContent = classToDelete.content.filter(
          (item) => item.type === 'video'
        );

        videoContent.forEach((item) => videoIdsToDelete.add(item.id));

        // Fetch video IDs for each channel. This involves network requests.
        for (const channelItem of channelContent) {
          const videos = await getShortVideosFromChannel(channelItem.id);
          videos.forEach((video) => videoIdsToDelete.add(video.id));
        }

        // Add deletion operations to the batch
        if (videoIdsToDelete.size > 0) {
          classToDelete.students.forEach((student) => {
            videoIdsToDelete.forEach((videoId) => {
              const videoRef = doc(
                firestore,
                'parents',
                student.parentId,
                'videoQueue',
                videoId
              );
              batch.delete(videoRef);
            });
          });
        }
      }

      // Step 2: Remove teacher access from child profiles
      if (classToDelete.students && classToDelete.students.length > 0) {
        classToDelete.students.forEach((student) => {
          const childProfileRef = doc(
            firestore,
            'parents',
            student.parentId,
            'childProfiles',
            student.studentId
          );
          batch.update(childProfileRef, {
            sharedWithTeacherIds: arrayRemove(classToDelete.teacherId),
          });
        });
      }

      // Step 3: Delete pending join requests for this class
      const requestsQuery = query(
        collection(firestore, 'classJoinRequests'),
        where('classId', '==', classToDelete.id)
      );
      const requestsSnapshot = await getDocs(requestsQuery);
      requestsSnapshot.forEach((requestDoc) => batch.delete(requestDoc.ref));

      // Step 4: Delete the class document itself
      const classRef = doc(firestore, 'classes', classToDelete.id);
      batch.delete(classRef);

      await batch.commit();

      toast({
        title: 'Class Deleted',
        description: `"${classToDelete.name}" and all associated data have been removed.`,
      });
    } catch (error) {
      console.error('Error deleting class:', error);
      toast({
        variant: 'destructive',
        title: 'Error Deleting Class',
        description:
          (error as Error).message || 'An unexpected error occurred.',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="flex-1 bg-white">
      <div className="p-4 border-b">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Teacher Dashboard
        </h2>

        <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Classes
              </CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  analytics.totalClasses
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  analytics.totalStudents
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-col">
        {isLoading && (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isLoading &&
          classes &&
          classes.map((c) => (
            <Link
              key={c.id}
              href={`/teacher-dashboard/class/${c.id}`}
              className="block border-b hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex flex-1 items-center gap-4 min-w-0">
                  {c.avatarUrl ? (
                    <Image
                      src={c.avatarUrl}
                      alt={c.name}
                      width={48}
                      height={48}
                      className="rounded-full shrink-0"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <span className="text-lg font-bold text-muted-foreground">
                        {c.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-base">
                      {c.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {c.students?.length || 0} student(s)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <AlertDialog>
                    <AlertDialogTrigger
                      asChild
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:bg-red-100 hover:text-destructive rounded-full"
                        disabled={isDeleting === c.id}
                      >
                        {isDeleting === c.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="light">
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the class "{c.name}",
                          remove all students, and delete all content you've
                          added from their feeds. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteClass(c);
                          }}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <ArrowRight className="h-5 w-5 text-gray-300" />
                </div>
              </div>
            </Link>
          ))}
        {!isLoading && (!classes || classes.length === 0) && (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <h3 className="text-lg font-semibold">
              You haven't created any classes yet.
            </h3>
            <p className="text-muted-foreground mt-1">
              Click the '+' button to get started.
            </p>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 text-sm">
          <h3 className="font-bold text-base mb-2">How It Works</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              <strong>Create a Class:</strong> Click the{' '}
              <Plus className="inline-block h-4 w-4" /> button to set up a new
              class.
            </li>
            <li>
              <strong>Manage & Share:</strong> After clicking on a created class,
              you will be directed to its page where you can find the list of
              students, join requests, and feed management section. There is a{' '}
              <Share2 className="inline-block h-4 w-4" /> share button which you
              can click to share the class code either by copying or directly
              sharing to parents.
            </li>
            <li>
              <strong>Enroll Students:</strong> Parents use this code to request
              to join your class. You can approve or deny their requests in the
              'Requests' tab for each class.
            </li>
          </ol>
        </div>
      </div>

      <Button
        onClick={() => setDialogOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
        size="icon"
      >
        <Plus className="h-6 w-6 text-primary-foreground" />
        <span className="sr-only">Create New Class</span>
      </Button>
      <ClassFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
