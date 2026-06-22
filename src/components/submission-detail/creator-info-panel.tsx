import { ExternalLink } from 'lucide-react'

export interface CreatorInfo {
  id: string
  name: string
  avatarUrl?: string | null
  school?: string | null
  profileLink?: string | null
  sampleVideosLink?: string | null
}

export function CreatorInfoPanel({ creator }: { creator: CreatorInfo }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Creator</h3>

      <div className="mt-3 flex items-center gap-3">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-200">
          {creator.avatarUrl ? (
            <img src={creator.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs font-medium text-zinc-500">
              {creator.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-900">{creator.name}</p>
          {creator.school && (
            <p className="truncate text-xs text-zinc-500">{creator.school}</p>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {creator.profileLink && (
          <a
            href={creator.profileLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 transition-colors hover:text-zinc-900"
          >
            <ExternalLink className="h-3 w-3" />
            View full profile
          </a>
        )}
        {creator.sampleVideosLink && (
          <a
            href={creator.sampleVideosLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 transition-colors hover:text-zinc-900"
          >
            <ExternalLink className="h-3 w-3" />
            Sample videos
          </a>
        )}
      </div>
    </div>
  )
}
