interface TextAreaProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  label?: string
  rows?: number
}

export function TextArea({ value, onChange, placeholder, label, rows = 3 }: TextAreaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-text-secondary">{label}</label>}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 bg-gray-100 rounded-2xl text-text-primary text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-300 placeholder:text-placeholder"
      />
    </div>
  )
}
