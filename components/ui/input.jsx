import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground",

        // Transitions for smoother UX
        // "transition-colors duration-200",

        // Focus: no ring, just darkened border
        "focus:outline-none focus:border-muted-foreground",

        // Error: red outline if invalid (e.g. required & empty)
        "invalid:border-destructive",

        // Other states
        "file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",

        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };
