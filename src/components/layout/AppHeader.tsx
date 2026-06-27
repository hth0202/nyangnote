import { useNavigate } from 'react-router-dom'
import { IconSettings } from '@/components/ui/Icons'

interface Props {
  title: string
  subtitle?: string
}

export function AppHeader({ title, subtitle }: Props) {
  const navigate = useNavigate()

  return (
    <div className="px-5 pt-5 pb-4 flex items-center justify-between">
      <div>
        {subtitle && <p className="text-text-secondary text-sm">{subtitle}</p>}
        <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
      </div>
      <button
        type="button"
        onClick={() => navigate('/settings')}
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-95 transition-all text-gray-500"
        aria-label="설정"
      >
        <IconSettings size={22} />
      </button>
    </div>
  )
}
