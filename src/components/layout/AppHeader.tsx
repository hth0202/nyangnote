import { useNavigate } from 'react-router-dom'
import { IconSettings } from '@/components/ui/Icons'

interface Props {
  title: string
  subtitle?: string
}

/**
 * 메인 탭 화면(홈·타임라인) 공용 헤더.
 * subtitle 유무와 무관하게 min-height를 고정해서 화면 전환 시
 * 타이틀·설정 아이콘·아래 콘텐츠가 위아래로 움직이지 않는다.
 */
export function AppHeader({ title, subtitle }: Props) {
  const navigate = useNavigate()

  return (
    <header className="px-5 pt-5 pb-4 min-h-[92px] flex items-start justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-text-primary leading-8 truncate">{title}</h1>
        {subtitle && <p className="text-text-secondary text-sm mt-1">{subtitle}</p>}
      </div>
      <button
        type="button"
        onClick={() => navigate('/settings')}
        className="w-10 h-10 -mt-1 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-95 transition-all text-gray-500 shrink-0"
        aria-label="설정"
      >
        <IconSettings size={22} />
      </button>
    </header>
  )
}
