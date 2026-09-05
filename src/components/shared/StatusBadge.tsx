import React from 'react'

export type ProjectStatus = 'pending' | 'cutting' | 'sewing' | 'fitting' | 'ready' | 'delivered' | string

interface Props {
  status: ProjectStatus
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  pending:   { label: 'Pending',   bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500' },
  cutting:   { label: 'Cutting',   bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-500' },
  sewing:    { label: 'Sewing',    bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200',  dot: 'bg-purple-500' },
  fitting:   { label: 'Fitting',   bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  dot: 'bg-orange-500' },
  ready:     { label: 'Ready',     bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  delivered: { label: 'Delivered', bg: 'bg-stone-100',  text: 'text-stone-600',   border: 'border-stone-200',   dot: 'bg-stone-400' },
}

export function StatusBadge({ status, className = '', size = 'md' }: Props) {
  const config = STATUS_CONFIG[status.toLowerCase()] || {
    label: status,
    bg: 'bg-stone-50',
    text: 'text-stone-600',
    border: 'border-stone-200',
    dot: 'bg-stone-400',
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[9px]',
    md: 'px-2.5 py-0.5 text-[10px]',
    lg: 'px-3 py-1 text-xs'
  }[size] || 'px-2.5 py-0.5 text-[10px]'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-black uppercase tracking-wider border ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}
