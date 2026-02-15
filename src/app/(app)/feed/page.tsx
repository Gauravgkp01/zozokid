import { Reel } from '@/components/feed/reel';

export default async function FeedPage() {
  const videos = [
    {
      id: '5',
      channel: '@elitechess',
      title: 'He Sacrifices Everything!',
      image: 'reel-chess',
      likes: '1.2M',
      comments: '1.4k',
      shares: '2.5k',
    },
    {
      id: '1',
      channel: '@coolfacts',
      title: 'Amazing Space Facts! #shorts',
      image: 'reel-space',
      likes: '12.3k',
      comments: '234',
      shares: '102',
    },
    {
      id: '2',
      channel: '@legomaster',
      title: 'Building a giant LEGO car',
      image: 'reel-lego',
      likes: '45.1k',
      comments: '1.2k',
      shares: '876',
    },
    {
      id: '3',
      channel: '@artforkids',
      title: 'How to draw a cartoon dog',
      image: 'reel-drawing',
      likes: '9.8k',
      comments: '150',
      shares: '50',
    },
    {
      id: '4',
      channel: '@minecrafter',
      title: 'My new Minecraft base tour',
      image: 'reel-minecraft',
      likes: '102k',
      comments: '5.6k',
      shares: '2.1k',
    },
  ];

  return (
    <div className="flex h-screen items-center justify-center bg-black">
      <div className="relative h-full w-full max-w-sm snap-y snap-mandatory overflow-y-auto rounded-lg">
        {videos.map((video) => (
          <Reel key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
