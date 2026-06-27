interface ChipProps {
  label: string
  selected?: boolean
  onClick?: () => void
  disabled?: boolean
}

export function Chip({ label, selected, onClick, disabled }: ChipProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        'inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all',
        selected
          ? 'bg-primary-500 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
