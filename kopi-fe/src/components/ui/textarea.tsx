import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted-foreground flex w-full bg-transparent text-base outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none max-h-[100px] overflow-y-auto",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
