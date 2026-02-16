'use client';

import { useState, useEffect } from 'react';
import { useFirebase, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2, X, Brain, Gamepad2, SpellCheck, Clapperboard, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

type Parent = {
    id: string;
    allowedChannelUrls?: string[];
    allowedContentTypes?: string[];
}

const contentCategories = [
  { id: 'Kids cartoon', label: 'Kids Cartoons', icon: Clapperboard },
  { id: 'IQ games', label: 'IQ Games', icon: Brain },
  { id: 'Fun games', label: 'Fun Games', icon: Gamepad2 },
  { id: 'Fun english learning', label: 'English Learning', icon: SpellCheck },
];

export function ContentPreferences() {
  const { user, firestore } = useFirebase();
  const { toast } = useToast();
  
  const [newChannelUrl, setNewChannelUrl] = useState('');
  const [allowedChannels, setAllowedChannels] = useState<string[]>([]);
  const [allowedCategories, setAllowedCategories] = useState<string[]>([]);

  const parentRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'parents', user.uid);
  }, [user, firestore]);

  const { data: parent, isLoading } = useDoc<Parent>(parentRef);

  useEffect(() => {
    if (parent) {
      setAllowedChannels(parent.allowedChannelUrls || []);
      setAllowedCategories(parent.allowedContentTypes || []);
    } else {
      setAllowedChannels([]);
      setAllowedCategories([]);
    }
  }, [parent]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!parent) {
    return <p className="text-sm text-destructive text-center py-8">Could not load parent data.</p>;
  }

  const handleAddChannel = () => {
    if (!newChannelUrl.trim()) return;
    
    if (!newChannelUrl.startsWith('https://www.youtube.com/')) {
        toast({
            variant: 'destructive',
            title: 'Invalid URL',
            description: 'Please enter a valid YouTube channel URL.',
        });
        return;
    }

    if (allowedChannels.includes(newChannelUrl)) {
        toast({
            variant: 'destructive',
            title: 'Channel already added',
            description: 'This channel is already in the allowed list.',
        });
        return;
    }

    setAllowedChannels([...allowedChannels, newChannelUrl]);
    setNewChannelUrl('');
  }

  const handleRemoveChannel = (urlToRemove: string) => {
    setAllowedChannels(allowedChannels.filter(url => url !== urlToRemove));
  }

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    if (checked) {
        setAllowedCategories([...allowedCategories, categoryId]);
    } else {
        setAllowedCategories(allowedCategories.filter(id => id !== categoryId));
    }
  }
  
  const handleSaveChanges = () => {
    if (!parentRef) return;
    const updatedData = {
        allowedChannelUrls: allowedChannels,
        allowedContentTypes: allowedCategories,
        updatedAt: new Date().toISOString(),
    };
    setDocumentNonBlocking(parentRef, updatedData, { merge: true });
    toast({
        title: 'Preferences Saved',
        description: `Your global content settings have been updated.`,
    })
  }

  return (
    <div className="space-y-6">
        <div>
            <Label htmlFor="channelUrl" className="text-base font-medium">Allowed Channels</Label>
            <p className="text-sm text-muted-foreground mb-2">Add YouTube channel URLs that you approve for viewing.</p>
            <div className="flex items-center space-x-2">
                <Input 
                    id="channelUrl" 
                    placeholder="https://www.youtube.com/@channelname"
                    value={newChannelUrl}
                    onChange={(e) => setNewChannelUrl(e.target.value)}
                />
                <Button onClick={handleAddChannel} size="icon" variant="outline">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            <div className="mt-4 space-y-2">
                {allowedChannels.map(url => (
                    <div key={url} className="flex items-center justify-between rounded-md border bg-background p-2">
                        <p className="text-sm truncate pr-2">{url}</p>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveChannel(url)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                {allowedChannels.length === 0 && <p className="text-xs text-center text-muted-foreground pt-2">No allowed channels yet.</p>}
            </div>
        </div>

        <div className="space-y-4">
             <Label className="text-base font-medium">Allowed Categories</Label>
             <p className="text-sm text-muted-foreground">Toggle content categories you want to allow.</p>
            {contentCategories.map(category => (
                 <div key={category.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                        <category.icon className="h-6 w-6 text-muted-foreground" />
                        <span className="font-medium">{category.label}</span>
                    </div>
                    <Switch 
                        checked={allowedCategories.includes(category.id)}
                        onCheckedChange={(checked) => handleCategoryToggle(category.id, checked)}
                    />
                 </div>
            ))}
        </div>

        <Button className="w-full" onClick={handleSaveChanges}>Save Changes</Button>
    </div>
  );
}
