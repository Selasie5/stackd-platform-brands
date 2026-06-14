import * as React from "react"
import { cn } from "#/lib/utils.ts"

interface SpleenetLoaderProps {
  size?: "sm" | "md" | "lg"
  className?: string
}


function SpleenetLoader({ size = "md", className }: SpleenetLoaderProps) {
  const sizeMap = {
    sm: { height: 16, barWidth: 2, gap: 2 },
    md: { height: 24, barWidth: 3, gap: 3 },
    lg: { height: 32, barWidth: 4, gap: 4 },
  }

  const { height, barWidth, gap } = sizeMap[size]

  const barRatios = [0.72, 1.0, 1.0, 0.85, 0.72]
  const barDelays = [0, 0.12, 0.24, 0.36, 0.48]

  const totalWidth = barRatios.length * barWidth + (barRatios.length - 1) * gap

  return (
    <div
      className={cn("inline-flex items-end", className)}
      style={{ width: totalWidth, height }}
      role="status"
      aria-label="Loading"
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

SpleenetLoader.displayName = "SpleenetLoader"

export { SpleenetLoader }
