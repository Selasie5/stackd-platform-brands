import { useEffect, useMemo, useRef } from 'react'
import { Clock3 } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

const HOURS = Array.from({ length: 24 }, (_, index) => index)
const MINUTES = Array.from({ length: 60 }, (_, index) => index)

function parseTimeValue(value?: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value ?? '')
  if (!match) return null

  const hour = Number(match[1])
  const minute = Number(match[2])

  if (hour > 23 || minute > 59) return null

  return { hour, minute }
}

function formatTimeValue(hour: number, minute: number) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function formatTimeLabel(hour: number, minute: number) {
  const period = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`
}

function TimeColumn({
  label,
  values,
  selected,
  onSelect,
  formatValue,
}: {
  label: string
  values: number[]
  selected: number
  onSelect: (value: number) => void
  formatValue: (value: number) => string
}) {
  const selectedRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'center' })
  }, [selected])

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <p className="border-b border-zinc-100 px-2 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </p>
      <ScrollArea className="h-48">
        <div className="flex flex-col p-1">
          {values.map((value) => {
            const isSelected = value === selected
            return (
              <button
                key={value}
                ref={isSelected ? selectedRef : undefined}
                type="button"
                onClick={() => onSelect(value)}
                className={cn(
                  'rounded-md px-2 py-1.5 text-sm transition-colors',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                )}
              >
                {formatValue(value)}
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

export interface TimePickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function TimePicker({
  value,
  onChange,
  placeholder = 'Pick a time',
  disabled = false,
  className,
}: TimePickerProps) {
  const parsed = useMemo(() => parseTimeValue(value), [value])
  const hour = parsed?.hour ?? 12
  const minute = parsed?.minute ?? 0

  const updateTime = (nextHour: number, nextMinute: number) => {
    onChange(formatTimeValue(nextHour, nextMinute))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex h-9 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-left text-base transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
            !parsed && 'text-muted-foreground',
            className
          )}
        >
          <Clock3 className="h-4 w-4 shrink-0 text-zinc-400" />
          <span className="truncate">
            {parsed ? formatTimeLabel(hour, minute) : placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
        align="start"
      >
        <div className="flex w-44 divide-x divide-zinc-100">
          <TimeColumn
            label="Hour"
            values={HOURS}
            selected={hour}
            onSelect={(nextHour) => updateTime(nextHour, minute)}
            formatValue={(nextHour) => String(nextHour).padStart(2, '0')}
          />
          <TimeColumn
            label="Min"
            values={MINUTES}
            selected={minute}
            onSelect={(nextMinute) => updateTime(hour, nextMinute)}
            formatValue={(nextMinute) => String(nextMinute).padStart(2, '0')}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
