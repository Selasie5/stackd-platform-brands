import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type Tab<T extends string = string> = {
  id: T
  label: string
  badge?: number
  content: ReactNode
}

export function Tabs<T extends string>({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: Tab<T>[]
  activeTab: T
  onChange: (id: T) => void
}) {
  return (
    <div>
      <div className="flex gap-1 border-b border-zinc-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-700'
            )}
          >
            {tab.label}
            {tab.badge != null && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-zinc-100 px-1 text-xs font-medium text-zinc-600">
                {tab.badge}
              </span>
            )}
            {activeTab === tab.id && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-zinc-900" />
            )}
          </button>
        ))}
      </div>
      <div className="pt-6">
        {tabs.find((t) => t.id === activeTab)?.content}
      </div>
    </div>
  )
}
