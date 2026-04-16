import * as React from 'react';
import { cn } from '@/lib/utils';

export interface LogoAvatarProps {
  /** Authoritative domain used for the Google S2 Favicon lookup. */
  domain: string;
  /** Single-letter fallback shown if the logo fails to load. */
  letter: string;
  /** Brand-color hint used as the fallback background. */
  color: string;
  /** Display name for aria-label. */
  name: string;
  /** Pixel size (rendered square). Default 32. */
  size?: number;
  className?: string;
}

/**
 * Loads a real company logo via Google S2 Favicons (CDN, public, no key).
 * Shows a brand-color-tinted letter avatar as a fallback while loading or on error.
 */
export const LogoAvatar: React.FC<LogoAvatarProps> = ({
  domain, letter, color, name, size = 32, className,
}) => {
  const [state, setState] = React.useState<'loading' | 'loaded' | 'error'>('loading');

  // Request 2× physical size for retina-sharpness, but cap at 128 which is the S2 ceiling.
  const requestSize = Math.min(128, size * 2);
  const src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${requestSize}`;

  return (
    <div
      aria-label={`${name} logo`}
      className={cn(
        'relative flex items-center justify-center rounded-xs overflow-hidden shrink-0 text-white font-semibold',
        className,
      )}
      style={{ width: size, height: size, background: color, fontSize: Math.round(size * 0.42) }}
    >
      {/* Letter fallback painted underneath so it shows until the image loads. */}
      <span aria-hidden={state === 'loaded' ? 'true' : undefined} className="select-none">
        {letter}
      </span>
      {state !== 'error' && (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
          className={cn(
            'absolute inset-0 w-full h-full object-contain bg-white p-[10%]',
            'transition-opacity duration-200 ease-in-out',
            state === 'loaded' ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}
      {state === 'loading' && (
        <span aria-hidden="true" className="absolute inset-0 skeleton-shimmer opacity-30 pointer-events-none" />
      )}
    </div>
  );
};
