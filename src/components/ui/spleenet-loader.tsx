import { cn } from '@/lib/utils'

export type SpleenetLoaderSize = 'xs' | 'sm' | 'md' | 'lg'
export type SpleenetLoaderTone =
  | 'primary'
  | 'muted'
  | 'inverse'
  | 'amber'
  | 'emerald'
  | 'destructive'

interface SpleenetLoaderProps {
  size?: SpleenetLoaderSize
  tone?: SpleenetLoaderTone
  className?: string
  label?: string
}

const sizeMap = {
  xs: { height: 14, barWidth: 2, gap: 1.5 },
  sm: { height: 16, barWidth: 2, gap: 2 },
  md: { height: 24, barWidth: 3, gap: 3 },
  lg: { height: 32, barWidth: 4, gap: 4 },
} as const

const toneClasses: Record<SpleenetLoaderTone, string> = {
  primary: 'text-primary',
  muted: 'text-zinc-400 dark:text-zinc-500',
  inverse: 'text-white',
  amber: 'text-amber-600',
  emerald: 'text-emerald-600',
  destructive: 'text-destructive',
}

const barRatios = [0.72, 1.0, 1.0, 0.85, 0.72]
const barDelays = [0, 0.12, 0.24, 0.36, 0.48]

function SpleenetLoader({
  size = 'md',
  tone = 'primary',
  className,
  label = 'Loading',
}: SpleenetLoaderProps) {
  const { height, barWidth, gap } = sizeMap[size]
  const totalWidth = barRatios.length * barWidth + (barRatios.length - 1) * gap

  return (
    <div
      className={cn('inline-flex items-end', toneClasses[tone], className)}
      style={{ width: totalWidth, height }}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      {barRatios.map((ratio, i) => (
        <div
          key={i}
          className="spleenet-loader-bar rounded-[1px]"
          style={{
            width: barWidth,
            height: height * ratio,
            marginRight: i < barRatios.length - 1 ? gap : 0,
            animationDelay: `${barDelays[i]}s`,
            backgroundColor: 'currentColor',
          }}
        />
      ))}
    </div>
  )
}

SpleenetLoader.displayName = 'SpleenetLoader'

export { SpleenetLoader }
