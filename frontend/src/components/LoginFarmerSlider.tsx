import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const LOGIN_SLIDES = [
  {
    src: '/login/farmer-1.jpg',
    caption: 'Smallholder farmers growing maize and sorghum for local markets',
    location: 'Juba County',
  },
  {
    src: '/login/farmer-2.jpg',
    caption: 'Extension officers supporting farmers with climate-smart practices',
    location: 'Wau County',
  },
  {
    src: '/login/farmer-3.jpg',
    caption: 'Fresh harvest ready for buyers and cooperatives',
    location: 'Bor County',
  },
  {
    src: '/login/farmer-4.jpg',
    caption: 'Women farmers leading community agricultural groups',
    location: 'Aweil County',
  },
  {
    src: '/login/farmer-5.jpg',
    caption: 'Connecting fields to markets across South Sudan',
    location: 'Rumbek County',
  },
];

const INTERVAL_MS = 6000;

/** Full-bleed rotating background for the login green panel */
export function LoginFarmerSlider({ onActiveChange }: { onActiveChange?: (index: number) => void }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    onActiveChange?.(active);
  }, [active, onActiveChange]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % LOGIN_SLIDES.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setActive((i) => (i - 1 + LOGIN_SLIDES.length) % LOGIN_SLIDES.length);
  const next = () => setActive((i) => (i + 1) % LOGIN_SLIDES.length);

  return (
    <div className="group absolute inset-0 z-0">
      {LOGIN_SLIDES.map((s, i) => (
        <div
          key={s.src}
          className={cn(
            'absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out',
            i === active ? 'opacity-100' : 'opacity-0'
          )}
          style={{ backgroundImage: `url(${s.src})` }}
          role="img"
          aria-label={s.caption}
        />
      ))}

      {/* Green brand overlay — images visible through tint */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(150deg, rgba(11,122,62,0.90) 0%, rgba(8,96,48,0.85) 50%, rgba(6,74,37,0.92) 100%)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-black/20" />

      <button
        type="button"
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 z-[1] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-black/25 text-white opacity-0 backdrop-blur-sm transition hover:bg-black/40 group-hover:opacity-100"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 z-[1] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-black/25 text-white opacity-0 backdrop-blur-sm transition hover:bg-black/40 group-hover:opacity-100"
      >
        <ChevronRight size={22} />
      </button>

      <div className="absolute bottom-8 left-12 z-[1] flex gap-2">
        {LOGIN_SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setActive(i)}
            className={cn(
              'h-1.5 rounded-full transition-all',
              i === active ? 'w-7 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
            )}
          />
        ))}
      </div>
    </div>
  );
}
