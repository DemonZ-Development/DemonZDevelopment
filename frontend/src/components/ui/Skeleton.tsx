import s from './Skeleton.module.css';

interface SkeletonCardProps {
  hasImage?: boolean;
}

export function SkeletonCard({ hasImage = true }: SkeletonCardProps) {
  return (
    <div className={s.skeletonCard}>
      {hasImage && <div className={s.image} />}
      <div className={s.title} />
      <div className={s.tagline} />
      <div className={s.description}>
        <div className={s.descLine1} />
        <div className={s.descLine2} />
      </div>
      <div className={s.footer}>
        <div className={s.badge} />
        <div className={s.meta} />
      </div>
    </div>
  );
}

interface SkeletonGridProps {
  count?: number;
  hasImage?: boolean;
  className?: string;
}

export function SkeletonGrid({ count = 3, hasImage = true, className }: SkeletonGridProps) {
  const skeletons = Array.from({ length: count });
  return (
    <div className={className}>
      {skeletons.map((_, idx) => (
        <SkeletonCard key={idx} hasImage={hasImage} />
      ))}
    </div>
  );
}
