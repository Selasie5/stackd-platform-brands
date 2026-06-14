import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import { CheckCircle2, AlertCircle, Info, XCircle } from "lucide-react"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl group-[.toaster]:p-4",
          description: "group-[.toast]:text-muted-foreground text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton: 
            "group-[.toast]:opacity-100 group-[.toast]:hover:bg-accent group-[.toast]:text-muted-foreground",
        },
      }}
      icons={{
        success: <CheckCircle2 className="text-green-500 w-5 h-5" />,
        error: <XCircle className="text-red-500 w-5 h-5" />,
        warning: <AlertCircle className="text-yellow-500 w-5 h-5" />,
        info: <Info className="text-blue-500 w-5 h-5" />,
      }}
      {...props}
    />
  )
}

export { Toaster }
