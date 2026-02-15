import Image from 'next/image';
import { Heart, MessageCircle, Send, MoreVertical } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type Video = {
  id: string;
  channel: string;
  title: string;
  image: string;
};

export function Reel({ video }: { video: Video }) {
  const placeholder = PlaceHolderImages.find((p) => p.id === video.image);

  return (
    <div className="relative h-full w-full flex-shrink-0 snap-start">
      {placeholder && (
        <Image
          src={placeholder.imageUrl}
          alt={placeholder.description}
          fill
          className="object-cover"
          data-ai-hint={placeholder.imageHint}
          priority
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <div className="mb-2 flex items-center gap-2">
          <Avatar className="h-8 w-8 border-2 border-white">
            <AvatarImage
              src={`https://picsum.photos/seed/${video.id}/40/40`}
            />
            <AvatarFallback>
              {video.channel.charAt(1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <p className="font-semibold">{video.channel}</p>
        </div>
        <p className="text-sm">{video.title}</p>
      </div>
      <div className="absolute bottom-4 right-2 flex flex-col items-center gap-4 text-white">
        <button className="flex flex-col items-center gap-1 transition-transform active:scale-95">
          <Heart className="h-7 w-7 drop-shadow-lg" />
          <span className="text-xs font-semibold">12.3k</span>
        </button>
        <button className="flex flex-col items-center gap-1 transition-transform active:scale-95">
          <MessageCircle className="h-7 w-7 drop-shadow-lg" />
          <span className="text-xs font-semibold">234</span>
        </button>
        <button className="flex flex-col items-center gap-1 transition-transform active:scale-95">
          <Send className="h-7 w-7 drop-shadow-lg" />
          <span className="text-xs font-semibold">102</span>
        </button>
        <button className="transition-transform active:scale-95">
          <MoreVertical className="h-7 w-7 drop-shadow-lg" />
        </button>
      </div>
    </div>
  );
}
