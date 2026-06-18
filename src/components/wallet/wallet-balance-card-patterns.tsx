import { useId } from 'react'
import { cn } from '@/lib/utils'

export function SpleenetLogoPattern({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 opacity-[0.14]', className)}
      style={{
        backgroundImage: 'url(/favicon.svg)',
        backgroundSize: '34px auto',
        backgroundRepeat: 'repeat',
      }}
    />
  )
}

export function IceFrostPattern({ className }: { className?: string }) {
  const patternId = useId().replace(/:/g, '')

  return (
    <svg
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
      preserveAspectRatio="none"
    >
      <defs>
        <pattern
          id={`ice-shards-${patternId}`}
          patternUnits="userSpaceOnUse"
          width="56"
          height="56"
        >
          <rect width="56" height="56" fill="transparent" />
          <path
            d="M0 18 L56 0 L56 8 L0 26 Z"
            fill="rgba(255,255,255,0.22)"
          />
          <path
            d="M8 56 L56 28 L56 36 L8 56 Z"
            fill="rgba(255,255,255,0.16)"
          />
          <path
            d="M28 0 L36 0 L20 56 L12 56 Z"
            fill="rgba(186,230,253,0.35)"
          />
          <path
            d="M0 40 L18 0 L24 0 L6 40 Z"
            fill="rgba(224,242,254,0.28)"
          />
          <circle cx="44" cy="12" r="2.5" fill="rgba(255,255,255,0.35)" />
          <circle cx="14" cy="44" r="1.8" fill="rgba(255,255,255,0.28)" />
        </pattern>
        <pattern
          id={`ice-lines-${patternId}`}
          patternUnits="userSpaceOnUse"
          width="24"
          height="24"
          patternTransform="rotate(35)"
        >
          <line x1="0" y1="12" x2="24" y2="12" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <line x1="12" y1="0" x2="12" y2="24" stroke="rgba(186,230,253,0.18)" strokeWidth="0.75" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#ice-shards-${patternId})`} />
      <rect width="100%" height="100%" fill={`url(#ice-lines-${patternId})`} opacity="0.85" />
    </svg>
  )
}
