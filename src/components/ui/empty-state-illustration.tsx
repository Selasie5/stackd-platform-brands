import { useId } from 'react'
import { cn } from '@/lib/utils'

export function EmptyStateFolderIllustration({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, '')
  const glassGradientId = `folder-glass-${uid}`
  const docClipId = `folder-doc-clip-${uid}`

  return (
    <div
      className={cn('relative mx-auto h-[120px] w-[140px]', className)}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 140 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full drop-shadow-[0_18px_28px_rgba(15,23,42,0.14)]"
      >
        <defs>
          <linearGradient
            id={glassGradientId}
            x1="70"
            y1="22"
            x2="70"
            y2="100"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FFFFFF" stopOpacity="0.34" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.08" />
          </linearGradient>
          <clipPath id={docClipId}>
            <rect x="38" y="48" width="64" height="44" rx="6" />
          </clipPath>
        </defs>

        <path
          d="M16 34C16 27.3726 21.3726 22 28 22H58.3431C61.589 22 64.6716 23.2906 66.8284 25.5147L74.1716 33.0853C76.3284 35.3094 79.411 36.6 82.6569 36.6H112C118.627 36.6 124 41.9726 124 48.6V88C124 94.6274 118.627 100 112 100H28C21.3726 100 16 94.6274 16 88V34Z"
          fill="#18181B"
        />
        <path
          d="M28 22H58.3431C61.589 22 64.6716 23.2906 66.8284 25.5147L74.1716 33.0853C76.3284 35.3094 79.411 36.6 82.6569 36.6H112C118.627 36.6 124 41.9726 124 48.6V88C124 94.6274 118.627 100 112 100H28C21.3726 100 16 94.6274 16 88V34C16 27.3726 21.3726 22 28 22Z"
          fill={`url(#${glassGradientId})`}
          fillOpacity="0.72"
        />

        <g clipPath={`url(#${docClipId})`}>
          <rect x="38" y="48" width="64" height="44" rx="6" fill="white" fillOpacity="0.96" />
          <g className="empty-state-doc-scroll">
            <rect x="48" y="54" width="28" height="4" rx="2" fill="#D4D4D8" />
            <rect x="48" y="64" width="44" height="4" rx="2" fill="#E4E4E7" />
            <rect x="48" y="74" width="36" height="4" rx="2" fill="#E4E4E7" />
            <rect x="48" y="84" width="40" height="4" rx="2" fill="#E4E4E7" />
            <rect x="48" y="94" width="32" height="4" rx="2" fill="#D4D4D8" />
          </g>
        </g>
      </svg>
    </div>
  )
}
