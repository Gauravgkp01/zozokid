'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Users, Loader2, ArrowRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
} from 'firebase/firestore';

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

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Teacher Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Classes</CardTitle>
            <CardDescription>Manage your classes and students.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading && (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
              {!isLoading &&
                classes &&
                classes.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      {c.avatarUrl && (
                        <Image src={c.avatarUrl} alt={c.name} width={40} height={40} className="rounded-full" />
                      )}
                      <div>
                        <p className="font-bold">{c.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {c.students?.length || 0} student(s)
                        </p>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/teacher-dashboard/class/${c.id}`}>
                        Manage <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              {!isLoading && (!classes || classes.length === 0) && (
                <p className="py-4 text-center text-muted-foreground">
                  You haven't created any classes yet.
                </p>
              )}
              <Button
                variant="default"
                className="w-full"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Class
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>How ZoZoKid Works for Teachers</CardTitle>
            <CardDescription>
              A simple guide to get you started with your classes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">1</div>
                <div>
                    <h4 className="font-semibold">Create Your Class</h4>
                    <p className="text-muted-foreground">Click the "Create New Class" button. Give your class a name and an avatar to get started.</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">2</div>
                <div>
                    <h4 className="font-semibold">Manage Class & Share Code</h4>
                    <p className="text-muted-foreground">After clicking on the Manage class button you will be directed to your created class where you can find the list of student Join request and feed management section and their is a share button which you can click to share the class code either by copying or directly sharing to parents.</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">3</div>
                <div>
                    <h4 className="font-semibold">Parents Enroll Their Child</h4>
                    <p className="text-muted-foreground">Parents enter this code in their dashboard to request that their child join your class.</p>
                </div>
            </div>
             <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">4</div>
                <div>
                    <h4 className="font-semibold">Approve Requests</h4>
                    <p className="text-muted-foreground">You’ll see new join requests on the class page. Approve them to add students to your class and start sharing content!</p>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <ClassFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
