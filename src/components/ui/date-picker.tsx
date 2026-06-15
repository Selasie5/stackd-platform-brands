import { format, parse } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const DATE_VALUE_FORMAT = 'yyyy-MM-dd'

function parseDateValue(value?: string) {
  if (!value) return undefined

  try {
    const parsed = parse(value, DATE_VALUE_FORMAT, new Date())
    return Number.isNaN(parsed.getTime()) ? undefined : parsed
  } catch {
    return undefined
  }
}

export interface DatePickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  fromDate?: Date
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  disabled = false,
  className,
  fromDate,
}: DatePickerProps) {
  const selectedDate = parseDateValue(value)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex h-9 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-left text-base transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
            !selectedDate && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 text-zinc-400" />
          <span className="truncate">
            {selectedDate ? format(selectedDate, 'MMM d, yyyy') : placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 shadow-[0_4px_12px_rgba(0,0,0,0.05)]" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => onChange(date ? format(date, DATE_VALUE_FORMAT) : '')}
          disabled={fromDate ? { before: fromDate } : undefined}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
