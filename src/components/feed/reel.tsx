import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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
          <p className="font-bold">{video.channel}</p>
        </div>
        <p className="mt-2 text-sm font-medium">{video.title}</p>
      </div>
    </div>
  );
}
