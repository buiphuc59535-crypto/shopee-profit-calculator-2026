import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <label className="grid gap-2 text-sm font-medium text-foreground" htmlFor={inputId}>
        {label ? <span>{label}</span> : null}
        <input
          id={inputId}
          className={cn(
            "h-12 w-full rounded-xl border bg-card px-3 text-base outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20",
            className,
          )}
          ref={ref}
          {...props}
        />
        {hint ? <span className="text-xs font-normal text-muted-foreground">{hint}</span> : null}
      </label>
    );
  },
);
Input.displayName = "Input";
