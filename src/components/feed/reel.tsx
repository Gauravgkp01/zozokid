import Image from 'next/image';
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Send,
  Repeat,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '../ui/button';

type Video = {
  id: string;
  channel: string;
  title: string;
  image: string;
  likes: string;
  comments: string;
  shares: string;
};

export function Reel({ video }: { video: Video }) {
  const placeholder = PlaceHolderImages.find((p) => p.id === video.image);

  return (
    <div className="relative h-full w-full flex-shrink-0 snap-start overflow-hidden rounded-lg">
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10"></div>

      {/* Bottom Info */}
      <div className="absolute bottom-4 left-4 right-4 text-white">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage
              src={`https://picsum.photos/seed/${video.id}/40/40`}
            />
            <AvatarFallback>
              {video.channel.charAt(1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <p className="font-bold">{video.channel}</p>
          <Button
            size="sm"
            className="ml-2 rounded-full bg-white text-black hover:bg-white/90"
          >
            Subscribe
          </Button>
        </div>
        <p className="mt-2 text-sm font-medium">{video.title}</p>
      </div>

      {/* Right Controls */}
      <div className="absolute bottom-20 right-2 flex flex-col items-center gap-3 text-white">
        <button className="flex flex-col items-center gap-1 transition-transform active:scale-95">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50">
            <ThumbsUp className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold">{video.likes}</span>
        </button>
        <button className="flex flex-col items-center gap-1 transition-transform active:scale-95">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50">
            <ThumbsDown className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold">Dislike</span>
        </button>
        <button className="flex flex-col items-center gap-1 transition-transform active:scale-95">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50">
            <MessageCircle className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold">{video.comments}</span>
        </button>
        <button className="flex flex-col items-center gap-1 transition-transform active:scale-95">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50">
            <Send className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold">{video.shares}</span>
        </button>
        <button className="flex flex-col items-center gap-1 transition-transform active:scale-95">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50">
            <Repeat className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold">Remix</span>
        </button>
        <button className="mt-2 transition-transform active:scale-95">
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage
              src={`https://picsum.photos/seed/${video.id}c/40/40`}
            />
            <AvatarFallback>
              {video.channel.charAt(1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
      </div>
    </div>
  );
}
