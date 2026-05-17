import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, id, children, ...props }, ref) => {
    const selectId = id ?? props.name;
    return (
      <label className="grid gap-2 text-sm font-medium text-foreground" htmlFor={selectId}>
        {label ? <span>{label}</span> : null}
        <span className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "h-12 w-full appearance-none rounded-xl border bg-card px-3 pr-10 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20",
              className,
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </span>
      </label>
    );
  },
);
Select.displayName = "Select";

