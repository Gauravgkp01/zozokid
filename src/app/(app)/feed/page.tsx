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
    <div className="h-screen w-full snap-y snap-mandatory overflow-y-auto bg-black">
      {videos.map((video) => (
        <div
          key={video.id}
          className="flex h-screen w-full items-center justify-center snap-start"
        >
          <div className="relative h-full w-full max-w-sm overflow-hidden rounded-lg">
            <Reel video={video} />
          </div>
        </div>
      ))}
    </div>
  );
}
