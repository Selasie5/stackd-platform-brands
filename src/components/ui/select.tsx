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
  id?: string
}

function mergeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (!ref) continue
      if (typeof ref === "function") ref(node)
      else ref.current = node
    }
  }
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      value,
      onChange,
      options,
      placeholder = "Select...",
      disabled = false,
      className,
      id,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [focusedIndex, setFocusedIndex] = React.useState(-1)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const listboxId = React.useId()

    const enabledOptions = React.useMemo(
      () => options.filter((option) => !option.disabled),
      [options]
    )

    React.useEffect(() => {
      if (isOpen) {
        const handleClickOutside = (event: MouseEvent) => {
          if (
            containerRef.current &&
            !containerRef.current.contains(event.target as Node)
          ) {
            setIsOpen(false)
          }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
      }
    }, [isOpen])

    React.useEffect(() => {
      if (!isOpen) {
        setFocusedIndex(-1)
      }
    }, [isOpen])

    const selectedOption = options.find((option) => option.value === value)

    const openDropdown = React.useCallback(() => {
      if (disabled) return
      setIsOpen(true)
      const selectedIndex = enabledOptions.findIndex(
        (option) => option.value === value
      )
      setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0)
    }, [disabled, enabledOptions, value])

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (disabled) return

      if (!isOpen) {
        if (
          event.key === "ArrowDown" ||
          event.key === "ArrowUp" ||
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault()
          openDropdown()
        }
        return
      }

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault()
          setFocusedIndex((current) =>
            Math.min(current + 1, enabledOptions.length - 1)
          )
          break
        case "ArrowUp":
          event.preventDefault()
          setFocusedIndex((current) => Math.max(current - 1, 0))
          break
        case "Home":
          event.preventDefault()
          setFocusedIndex(0)
          break
        case "End":
          event.preventDefault()
          setFocusedIndex(enabledOptions.length - 1)
          break
        case "Enter":
        case " ":
          event.preventDefault()
          if (focusedIndex >= 0 && enabledOptions[focusedIndex]) {
            onChange(enabledOptions[focusedIndex].value)
            setIsOpen(false)
          }
          break
        case "Escape":
        case "Tab":
          event.preventDefault()
          setIsOpen(false)
          break
      }
    }

    return (
      <div
        className="relative w-full"
        ref={mergeRefs(ref, containerRef)}
        onKeyDown={handleKeyDown}
      >
        <button
          type="button"
          id={id}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          onClick={() => (isOpen ? setIsOpen(false) : openDropdown())}
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-left text-base shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
            className
          )}
        >
          <div className="flex items-center gap-2.5">
            {selectedOption ? (
              <>
                {selectedOption.icon}
                <span className="text-zinc-900 dark:text-zinc-100">
                  {selectedOption.label}
                </span>
              </>
            ) : (
              <span className="text-zinc-400">{placeholder}</span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-zinc-400" />
        </button>

        {isOpen && (
          <div
            id={listboxId}
            role="listbox"
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-white py-1 text-base shadow-[0_4px_12px_rgba(0,0,0,0.05)] focus:outline-none md:text-sm dark:bg-zinc-950"
          >
            {options.map((option) => {
              const enabledIndex = enabledOptions.findIndex(
                (item) => item.value === option.value
              )
              const isFocused = enabledIndex === focusedIndex

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  disabled={option.disabled}
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-zinc-700 transition-colors hover:bg-zinc-50 disabled:pointer-events-none disabled:opacity-40 dark:text-zinc-300 dark:hover:bg-zinc-900",
                    option.value === value &&
                      "bg-zinc-50 font-medium dark:bg-zinc-900/50",
                    isFocused && "bg-zinc-100 dark:bg-zinc-900"
                  )}
                >
                  {option.icon}
                  <span>{option.label}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
