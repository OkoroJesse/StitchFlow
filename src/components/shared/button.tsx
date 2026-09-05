import React from 'react'
import { Loader2 } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'mobile-cta'
  loading?: boolean
  icon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', loading, icon, children, ...props }, ref) => {
    
    // UNIFIED GLOBAL BUTTON SYSTEM
    const baseStyles = "px-4 py-2 rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 text-sm h-10 shrink-0 cursor-pointer"
    
    const variants = {
      primary: "bg-[#4a1525] hover:bg-[#5c1d30] text-white shadow-sm shadow-[#4a1525]/10 border border-[#380e1b]",
      secondary: "bg-white hover:bg-[#FAF8F5] text-[#1C1917] border border-[#E7E5E4] shadow-2xs",
      outline: "bg-transparent border border-[#4a1525] text-[#4a1525] hover:bg-[#fbf0f3]",
      danger: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200",
      ghost: "bg-transparent hover:bg-stone-100 text-[#57534E] hover:text-[#1C1917]",
      'mobile-cta': "w-full py-3.5 h-12 text-base font-bold bg-[#4a1525] hover:bg-[#5c1d30] text-white rounded-xl shadow-md"
    }

    return (
      <button
        className={cn(baseStyles, variants[variant], className)}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          icon && <span className="shrink-0">{icon}</span>
        )}
        <span className="truncate">{children}</span>
      </button>
    )
  }
)

Button.displayName = 'Button'
