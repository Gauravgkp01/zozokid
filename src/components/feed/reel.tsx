import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Send } from 'lucide-react';

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
    <div className="relative h-full w-full flex-shrink-0">
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
          <p className="font-bold">{video.channel}</p>
        </div>
        <p className="mt-2 text-sm font-medium">{video.title}</p>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-24 right-2 flex flex-col items-center gap-4 text-white">
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <Heart className="h-7 w-7" />
          </Button>
          <span className="text-xs font-bold">{video.likes}</span>
        </div>
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <MessageCircle className="h-7 w-7" />
          </Button>
          <span className="text-xs font-bold">{video.comments}</span>
        </div>
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <Send className="h-7 w-7" />
          </Button>
          <span className="text-xs font-bold">{video.shares}</span>
        </div>
      </div>
    </div>
  );
}
