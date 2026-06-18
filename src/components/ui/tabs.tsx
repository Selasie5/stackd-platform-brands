import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type Tab<T extends string = string> = {
  id: T
  label: string
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
              'relative px-4 py-2.5 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-700'
            )}
          >
            {tab.label}
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
