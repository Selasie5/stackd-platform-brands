import { useState } from 'react'
import { Play } from 'lucide-react'

export function WatermarkedPlayer({
  watermarkedPreviewUrl,
  thumbnailUrl,
  title,
}: {
  watermarkedPreviewUrl?: string | null
  thumbnailUrl?: string | null
  title: string
}) {
  const [playing, setPlaying] = useState(false)

  if (!playing) {
    return (
      <div className="group relative aspect-[9/16] overflow-hidden rounded-lg bg-zinc-900">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={`${title} thumbnail`}
            className="h-full w-full object-cover opacity-80"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-xs text-zinc-500">No preview</span>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center">
          <button
            type="button"
            aria-label="Play watermarked preview"
            onClick={() => setPlaying(true)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
          >
            <Play className="h-5 w-5 fill-current" />
          </button>
        </div>

        <div className="absolute bottom-2 left-2 right-2">
          <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
            Watermarked preview
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative aspect-[9/16] overflow-hidden rounded-lg bg-zinc-900">
      {watermarkedPreviewUrl ? (
        <video
          src={watermarkedPreviewUrl}
          controls
          className="h-full w-full"
          autoPlay
          playsInline
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="text-xs text-zinc-500">Preview not available</p>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="select-none text-[11px] font-bold uppercase tracking-widest text-white/20 -rotate-30">
          Watermarked
        </span>
      </div>
    </div>
  )
}
