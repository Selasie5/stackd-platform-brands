import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "#/lib/utils.ts"

export interface SelectOption {
  value: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
}

export interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
}

const Select = ({ value, onChange, options, placeholder = "Select...", disabled = false, className }: SelectProps) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      if (isOpen) {
        const handleClickOutside = (event: MouseEvent) => {
          if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
            setIsOpen(false)
          }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
      }
    }, [isOpen])

    const selectedOption = options.find((o) => o.value === value)

    return (
      <div className="relative w-full" ref={containerRef}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-9 w-full flex items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-base transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm text-left shadow-[0_1px_2px_rgba(0,0,0,0.02)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
            className
          )}
        >
          <div className="flex items-center gap-2.5">
            {selectedOption ? (
              <>
                {selectedOption.icon}
                <span className="text-zinc-900 dark:text-zinc-100">{selectedOption.label}</span>
              </>
            ) : (
              <span className="text-zinc-400">{placeholder}</span>
            )}
          </div>
          <ChevronDown className="w-4 h-4 text-zinc-400" />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-white dark:bg-zinc-950 py-1 shadow-[0_4px_12px_rgba(0,0,0,0.05)] focus:outline-none text-base md:text-sm">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-40 disabled:pointer-events-none transition-colors",
                  option.value === value && "bg-zinc-50 dark:bg-zinc-900/50 font-medium"
                )}
              >
                {option.icon}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
}
Select.displayName = "Select"

export { Select }
