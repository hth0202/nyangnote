import { useNavigate } from 'react-router-dom'
import { IconChevronLeft } from '@/components/ui/Icons'

interface Props {
  title: string
  /** 기본값: 브라우저 히스토리 뒤로가기 */
  onBack?: () => void
}

/**
 * 서브 화면(설정·공동 보호자 등) 공용 헤더.
 * 뒤로가기 버튼 + 타이틀 — 크기·간격·아이콘을 전 화면에서 동일하게 유지한다.
 */
export function PageHeader({ title, onBack }: Props) {
  const navigate = useNavigate()

  return (
    <header className="px-5 pt-5 pb-4 min-h-[72px] flex items-center gap-3">
      <button
        type="button"
        onClick={onBack ?? (() => navigate(-1))}
        className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-95 transition-all text-text-primary shrink-0"
        aria-label="뒤로 가기"
      >
        <IconChevronLeft size={24} />
      </button>
      <h1 className="text-xl font-bold text-text-primary truncate">{title}</h1>
    </header>
  )
}
