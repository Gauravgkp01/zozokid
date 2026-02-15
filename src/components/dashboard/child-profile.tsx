import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function ChildProfile({
  child,
}: {
  child: { name: string; age: number; avatar: string; interests: string[] };
}) {
  const avatarImage = PlaceHolderImages.find((p) => p.id === child.avatar);
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <Avatar className="h-24 w-24 border-4 border-secondary">
        {avatarImage && (
          <AvatarImage
            src={avatarImage.imageUrl}
            alt={child.name}
            data-ai-hint={avatarImage.imageHint}
          />
        )}
        <AvatarFallback className="text-3xl">
          {child.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div>
        <h2 className="text-2xl font-bold">{child.name}</h2>
        <p className="text-muted-foreground">{child.age} years old</p>
      </div>
      <div>
        <h3 className="mb-2 font-semibold">Interests</h3>
        <div className="flex flex-wrap justify-center gap-2">
          {child.interests.map((interest) => (
            <Badge key={interest} variant="secondary" className="text-sm">
              {interest}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
