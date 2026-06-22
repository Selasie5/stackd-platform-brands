import { CheckCircle2, XCircle } from 'lucide-react'

const COMPLIANCE_ITEMS = [
  { key: 'confirmedFollowsBrief', label: 'Creator confirmed they followed the creative brief' },
  { key: 'confirmedOriginal', label: 'Creator confirmed the content is original' },
  { key: 'confirmedNoFakeEngagement', label: 'Creator confirmed no fake engagement' },
  { key: 'agreedToUsageRights', label: 'Creator agreed to usage rights terms' },
] as const

export function BriefCompliance({
  checks,
}: {
  checks: Record<string, boolean>
}) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Brief compliance
      </h3>
      <ul className="mt-3 space-y-2">
        {COMPLIANCE_ITEMS.map((item) => {
          const checked = checks[item.key] === true
          return (
            <li key={item.key} className="flex items-start gap-2">
              {checked ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              ) : (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              )}
              <span className="text-xs text-zinc-600">{item.label}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
