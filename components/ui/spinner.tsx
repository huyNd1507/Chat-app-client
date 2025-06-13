"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Định nghĩa các kiểu size
type SpinnerSize = "1" | "2" | "3";

interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize;
  color?: string;
}

const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ className, size = "2", color = "currentColor", ...props }, ref) => {
    // Xác định kích thước dựa trên size prop
    const sizeStyles = {
      "1": "w-4 h-4",
      "2": "w-6 h-6",
      "3": "w-8 h-8",
    }[size];

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex relative animate-spin",
          sizeStyles,
          className
        )}
        style={{ color }}
        {...props}
      >
        <span
          className="absolute w-full h-full rounded-full opacity-30"
          style={{ background: color }}
        />
        <span
          className="absolute w-1/2 h-1/2 rounded-full"
          style={{ background: color }}
        />
      </span>
    );
  }
);
Spinner.displayName = "Spinner";

export { Spinner };
