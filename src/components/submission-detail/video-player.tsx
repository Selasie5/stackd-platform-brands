import { cn } from '@/lib/utils'
import { Film, Download } from 'lucide-react'

export function VideoPlayer({
  watermarkedPreviewUrl,
  cleanVideoUrl,
  thumbnailUrl,
  status,
  playing,
  onTogglePlay,
}: {
  watermarkedPreviewUrl?: string | null
  cleanVideoUrl?: string | null
  thumbnailUrl?: string | null
  status: string
  playing: boolean
  onTogglePlay: () => void
}) {
  const showClean = status === 'approved' && cleanVideoUrl
  const src = showClean ? cleanVideoUrl : watermarkedPreviewUrl

  if (!src) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-lg bg-zinc-100">
        <Film className="h-8 w-8 text-zinc-300" />
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-lg bg-black">
      <video
        src={src}
        poster={thumbnailUrl ?? undefined}
        className="aspect-video w-full cursor-pointer object-contain"
        onClick={onTogglePlay}
        controls={playing}
        muted
        playsInline
      />
      {!showClean && (
        <div className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white/80">
          Preview
        </div>
      )}
      {showClean && (
        <button
          type="button"
          className={cn(
            'absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
            'bg-white/90 text-zinc-900 hover:bg-white'
          )}
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </button>
      )}
    </div>
  )
}
