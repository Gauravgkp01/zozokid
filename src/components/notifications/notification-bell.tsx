'use client';

import { Bell, Check, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFirebase, useCollection, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, limit, doc, writeBatch } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

export type Notification = {
  id: string;
  userId: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
};

type NotificationBellProps = {
  userType: 'parent' | 'teacher';
};

export function NotificationBell({ userType }: NotificationBellProps) {
  const { user, firestore } = useFirebase();
  const router = useRouter();

  const notificationsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    const collectionPath = userType === 'parent' ? `parents/${user.uid}/notifications` : `teachers/${user.uid}/notifications`;
    return query(collection(firestore, collectionPath), orderBy('createdAt', 'desc'), limit(10));
  }, [user, firestore, userType]);

  const { data: notifications, isLoading } = useCollection<Notification>(notificationsQuery);

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const handleNotificationClick = (notification: Notification) => {
    if (!user || !firestore) return;
    
    // Mark as read
    if (!notification.isRead) {
      const collectionPath = userType === 'parent' ? `parents/${user.uid}/notifications` : `teachers/${user.uid}/notifications`;
      const notifRef = doc(firestore, collectionPath, notification.id);
      setDocumentNonBlocking(notifRef, { isRead: true }, { merge: true });
    }
    
    // Navigate
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user || !firestore || !notifications || unreadCount === 0) return;
    
    const batch = writeBatch(firestore);
    const collectionPath = userType === 'parent' ? `parents/${user.uid}/notifications` : `teachers/${user.uid}/notifications`;
    
    notifications.forEach(n => {
      if (!n.isRead) {
        const notifRef = doc(firestore, collectionPath, n.id);
        batch.update(notifRef, { isRead: true });
      }
    });

    await batch.commit();
  };


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative rounded-full border-gray-300 text-foreground"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 light">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="h-auto px-2 py-1 text-xs">
              <Check className="mr-1 h-3 w-3" />
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading && (
            <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        )}
        {!isLoading && (!notifications || notifications.length === 0) && (
            <p className="p-4 text-center text-sm text-muted-foreground">You have no notifications.</p>
        )}
        {!isLoading && notifications && notifications.length > 0 && (
            <div className="max-h-80 overflow-y-auto">
            {notifications.map(notification => (
                <DropdownMenuItem key={notification.id} onSelect={() => handleNotificationClick(notification)} className={`flex cursor-pointer flex-col items-start gap-1 whitespace-normal ${!notification.isRead ? 'bg-accent' : ''}`}>
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                </DropdownMenuItem>
            ))}
            </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
