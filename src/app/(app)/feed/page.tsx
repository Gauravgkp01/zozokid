import { Reel } from '@/components/feed/reel';

export default async function FeedPage() {
  const videos = [
    {
      id: '1',
      channel: '@coolfacts',
      title: 'Amazing Space Facts! #shorts',
      image: 'reel-space',
    },
    {
      id: '2',
      channel: '@legomaster',
      title: 'Building a giant LEGO car',
      image: 'reel-lego',
    },
    {
      id: '3',
      channel: '@artforkids',
      title: 'How to draw a cartoon dog',
      image: 'reel-drawing',
    },
    {
      id: '4',
      channel: '@minecrafter',
      title: 'My new Minecraft base tour',
      image: 'reel-minecraft',
    },
  ];

  return (
    <div className="container mx-auto flex h-[calc(100vh-5rem)] flex-col items-center justify-center gap-6">
      <div className="relative h-full max-h-[70vh] w-full max-w-[340px] overflow-y-auto snap-y snap-mandatory rounded-2xl border-8 border-slate-900 bg-slate-900 shadow-2xl">
        {videos.map((video) => (
          <Reel key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
