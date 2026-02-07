import ColoringEditor from '@/components/ColoringEditor';

// Sample coloring pages data (same as gallery)
const coloringPages: Record<string, { title: string; src: string | null }> = {
  blank: { title: 'Blank Canvas', src: null },
  butterfly: { title: 'Butterfly', src: '/lineart/butterfly.svg' },
  flower: { title: 'Flower', src: '/lineart/flower.svg' },
  house: { title: 'Cozy House', src: '/lineart/house.svg' },
  fish: { title: 'Tropical Fish', src: '/lineart/fish.svg' },
  star: { title: 'Happy Star', src: '/lineart/star.svg' },
  unicorn: { title: 'Magical Unicorn', src: '/lineart/unicorn.svg' },
};

// Generate static params for all known pages
export function generateStaticParams() {
  return Object.keys(coloringPages).map((id) => ({ id }));
}

// Generate metadata for each page
export function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return params.then(({ id }) => {
    const page = coloringPages[id];
    return {
      title: page ? `Color: ${page.title}` : 'Coloring Page',
      description: page ? `Color the ${page.title} coloring page` : 'Digital coloring book',
    };
  });
}

export default async function ColorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = coloringPages[id];

  // Handle blank canvas or known pages
  const initialImage = page?.src || null;
  const title = page?.title || 'Custom Page';

  return <ColoringEditor initialImage={initialImage} title={title} />;
}
