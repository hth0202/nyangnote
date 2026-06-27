import { type ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
  className?: string
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  onClick,
  type = 'button',
  className = '',
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all active:scale-95'
  const sizes = { sm: 'px-4 py-2 text-sm', md: 'px-6 py-3 text-base', lg: 'px-8 py-4 text-lg w-full' }
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-40',
    secondary: 'bg-secondary text-gray-800 hover:bg-amber-200 disabled:opacity-40',
    ghost: 'bg-transparent text-primary-600 hover:bg-primary-50 disabled:opacity-40',
    danger: 'bg-error text-white hover:bg-red-600 disabled:opacity-40',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={[base, sizes[size], variants[variant], className].join(' ')}
    >
      {loading ? <span className="animate-spin mr-2">⏳</span> : null}
      {children}
    </button>
  )
}
