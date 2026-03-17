import HeroStatement from '@/components/home/HeroStatement';
import EditorialEntry from '@/components/home/EditorialEntry';
import CurrentExhibition from '@/components/home/CurrentExhibition';
import FitsAndFrames from '@/components/home/FitsAndFrames';
import CurrentRotation from '@/components/home/CurrentRotation';
import FeaturedLabels from '@/components/home/FeaturedLabels';
import ManifestoFragment from '@/components/home/ManifestoFragment';

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroStatement />
      <EditorialEntry />
      <CurrentExhibition />
      <FitsAndFrames />
      <CurrentRotation />
      <FeaturedLabels />
      <ManifestoFragment />
    </div>
  );
}
