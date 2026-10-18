import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2 select-none active:scale-[0.98]";

    const variants = {
      primary:
        "bg-[#0071E3] text-white hover:bg-[#0077ED] active:bg-[#0066CC] shadow-2xs border border-transparent",
      secondary:
        "bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#EBEBED] active:bg-[#E0E0E3] border border-[#E5E5EA]",
      ghost:
        "bg-transparent text-[#48484A] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] active:bg-[#EBEBED]",
      danger:
        "bg-[#FF3B30] text-white hover:bg-[#E0352B] active:bg-[#C92F26] border border-transparent",
      outline:
        "bg-white text-[#1D1D1F] border border-[#E5E5EA] hover:border-[#D1D1D6] hover:bg-[#F5F5F7] active:bg-[#EBEBED] shadow-2xs",
    };

    const sizes = {
      sm: "text-[12.5px] px-3 py-1.5 rounded-lg gap-1.5",
      md: "text-[13.5px] px-4 py-2 rounded-xl gap-2",
      lg: "text-[15px] px-5 py-2.5 rounded-xl gap-2",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-3.5 w-3.5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
