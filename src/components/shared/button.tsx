import React from 'react'
import { Loader2 } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  loading?: boolean
  icon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', loading, icon, children, ...props }, ref) => {
    
    // STRICT GLOBAL STYLING RULES
    const baseStyles = "px-6 py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2.5 text-base h-12"
    
    const variants = {
      primary: "bg-[#e91e8c] hover:bg-[#f03fa0] text-white shadow-lg shadow-[#e91e8c]/20",
      secondary: "bg-[#2d2540] hover:bg-[#3d3356] text-white border border-[#2d2540]",
      danger: "bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20",
      ghost: "bg-transparent hover:bg-purple-50 text-[#6b7280] hover:text-[#e91e8c]"
    }

    return (
      <button
        className={cn(baseStyles, variants[variant], className)}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          icon && <span className="shrink-0">{icon}</span>
        )}
        <span className="truncate">{children}</span>
      </button>
    )
  }
)

Button.displayName = 'Button'
