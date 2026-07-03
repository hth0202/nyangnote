interface DateTimeInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
}

export function DateTimeInput({ value, onChange, label }: DateTimeInputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-text-secondary">{label}</label>}
      <input
        type="datetime-local"
        value={value}
        max={toLocalDateTimeString()}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-gray-100 rounded-2xl text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
      />
    </div>
  )
}

export function toLocalDateTimeString(date: Date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
