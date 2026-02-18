'use client';

import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Loader2, Book } from 'lucide-react';
import type { Class } from '@/app/teacher-dashboard/page';

type ChildClassesListProps = {
    childId: string;
    parentId: string;
};

export function ChildClassesList({ childId, parentId }: ChildClassesListProps) {
    const { firestore } = useFirebase();

    const classesQuery = useMemoFirebase(() => {
        if (!firestore || !childId || !parentId) return null;
        // This query finds all classes where the 'students' array contains a specific student-parent pair.
        return query(
            collection(firestore, 'classes'),
            where('students', 'array-contains', { studentId: childId, parentId: parentId })
        );
    }, [firestore, childId, parentId]);

    const { data: classes, isLoading } = useCollection<Class>(classesQuery);

    if (isLoading) {
        return (
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Loading classes...</span>
            </div>
        );
    }

    if (!classes || classes.length === 0) {
        return null; // Don't render anything if the child is not enrolled in any classes.
    }

    return (
        <div className="mt-2 flex flex-wrap items-center gap-2">
            {classes.map(c => (
                <div key={c.id} className="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                    <Book className="h-3 w-3" />
                    <span>{c.name}</span>
                </div>
            ))}
        </div>
    );
}
