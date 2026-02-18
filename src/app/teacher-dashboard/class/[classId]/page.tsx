'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  ClipboardCopy,
  Users,
  UserPlus,
  Loader2,
  Check,
  X,
  UserCheck,
} from 'lucide-react';
import {
  useFirebase,
  useDoc,
  useCollection,
  useMemoFirebase,
  setDocumentNonBlocking,
} from '@/firebase';
import {
  collection,
  doc,
  query,
  where,
  getDoc,
  writeBatch,
  arrayUnion,
  updateDoc,
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import type { Class } from '@/app/teacher-dashboard/page';
import type { ChildProfile } from '@/app/parent-dashboard/page';

type ClassJoinRequest = {
  id: string;
  classId: string;
  className: string;
  teacherId: string;
  parentId: string;
  childProfileId: string;
  childName: string;
  childAvatarUrl: string;
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
};

function StudentList({ students }: { students: { studentId: string; parentId: string }[] }) {
  const { firestore } = useFirebase();
  const [studentProfiles, setStudentProfiles] = useState<ChildProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore || students.length === 0) {
        setIsLoading(false);
        return;
    }
    
    async function fetchStudentProfiles() {
        setIsLoading(true);
        const profiles: ChildProfile[] = [];
        for (const student of students) {
            const studentRef = doc(firestore, 'parents', student.parentId, 'childProfiles', student.studentId);
            const studentSnap = await getDoc(studentRef);
            if (studentSnap.exists()) {
                profiles.push({ id: studentSnap.id, ...studentSnap.data() } as ChildProfile);
            }
        }
        setStudentProfiles(profiles);
        setIsLoading(false);
    }

    fetchStudentProfiles();
  }, [students, firestore]);

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (studentProfiles.length === 0) {
    return <p className="text-center text-sm text-muted-foreground p-8">No students have been added to this class yet.</p>
  }
  
  return (
    <div className="space-y-3">
        {studentProfiles.map(profile => (
            <div key={profile.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                    {profile.avatarUrl && (
                        <Image src={profile.avatarUrl} alt={profile.name} width={40} height={40} className="rounded-full" />
                    )}
                    <div>
                        <p className="font-semibold">{profile.name}</p>
                        <p className="text-xs text-muted-foreground">Age: {profile.age}</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/parent-dashboard/analytics/${profile.id}`}>View Analytics</Link>
                </Button>
            </div>
        ))}
    </div>
  )
}

export default function ClassDetailsPage() {
  const { user, firestore } = useFirebase();
  const params = useParams();
  const classId = params.classId as string;
  const { toast } = useToast();

  const classRef = useMemoFirebase(() => {
    if (!firestore || !classId) return null;
    return doc(firestore, 'classes', classId);
  }, [firestore, classId]);

  const { data: classData, isLoading: isLoadingClass } = useDoc<Class>(classRef);

  const joinRequestsQuery = useMemoFirebase(() => {
    if (!firestore || !classId) return null;
    return query(
      collection(firestore, 'classJoinRequests'),
      where('classId', '==', classId),
      where('status', '==', 'pending')
    );
  }, [firestore, classId]);

  const { data: joinRequests, isLoading: isLoadingRequests } = useCollection<ClassJoinRequest>(joinRequestsQuery);

  const copyClassCode = () => {
    navigator.clipboard.writeText(classId);
    toast({ title: 'Class Code Copied!', description: 'You can now share this code with parents.' });
  };

  const handleRequest = async (request: ClassJoinRequest, newStatus: 'approved' | 'denied') => {
    if (!firestore || !classData) return;

    try {
        const batch = writeBatch(firestore);

        const requestRef = doc(firestore, 'classJoinRequests', request.id);
        batch.update(requestRef, { status: newStatus });
        
        if (newStatus === 'approved') {
            const classRef = doc(firestore, 'classes', classId);
            const studentData = { studentId: request.childProfileId, parentId: request.parentId };
            
            // Check if student is already in the class
            if (!classData.students?.some(s => s.studentId === studentData.studentId)) {
                batch.update(classRef, {
                    students: arrayUnion(studentData)
                });
            }
        }

        await batch.commit();

        toast({
            title: `Request ${newStatus}`,
            description: `${request.childName} has been ${newStatus}.`,
        });

    } catch (error) {
        console.error(`Error handling request:`, error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not update the request status.',
        });
    }
  };

  if (isLoadingClass) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  if (!classData) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Class not found</h1>
        <Button asChild>
          <Link href="/teacher-dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <header className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/teacher-dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
            {classData.avatarUrl && (
                <Image src={classData.avatarUrl} alt={classData.name} width={48} height={48} className="rounded-full" />
            )}
            <div>
                <h1 className="text-2xl font-bold">{classData.name}</h1>
                <p className="text-muted-foreground">Manage your class details, students, and join requests.</p>
            </div>
        </div>
      </header>
      
      <Card>
        <CardHeader>
            <CardTitle>Share Class Code</CardTitle>
            <CardDescription>Parents can use this code to request to join your class from their dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center space-x-2 rounded-lg border bg-muted p-3">
                <p className="flex-grow font-mono text-sm">{classId}</p>
                <Button size="icon" variant="ghost" onClick={copyClassCode}>
                    <ClipboardCopy className="h-5 w-5" />
                </Button>
            </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="students">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="students">
            <Users className="mr-2 h-4 w-4" /> Students ({classData.students?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="requests">
            <UserPlus className="mr-2 h-4 w-4" /> Requests ({joinRequests?.length || 0})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="students">
            <Card>
                <CardHeader>
                    <CardTitle>Enrolled Students</CardTitle>
                    <CardDescription>The list of students currently in this class.</CardDescription>
                </CardHeader>
                <CardContent>
                    <StudentList students={classData.students || []} />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="requests">
            <Card>
                 <CardHeader>
                    <CardTitle>Join Requests</CardTitle>
                    <CardDescription>Approve or deny requests from parents.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {isLoadingRequests && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                    {!isLoadingRequests && joinRequests && joinRequests.length > 0 ? (
                        joinRequests.map(req => (
                            <div key={req.id} className="flex items-center justify-between rounded-lg border p-3">
                                <div className="flex items-center gap-3">
                                    {req.childAvatarUrl && (
                                        <Image src={req.childAvatarUrl} alt={req.childName} width={40} height={40} className="rounded-full" />
                                    )}
                                    <p className="font-semibold">{req.childName}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="icon" variant="outline" className="text-green-600 hover:bg-green-50 hover:text-green-700" onClick={() => handleRequest(req, 'approved')}>
                                        <Check className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleRequest(req, 'denied')}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-sm text-muted-foreground p-8">No pending join requests.</p>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
