import { NavLink } from 'react-router-dom'
import { useRecordSheet } from '@/context/RecordSheetContext'
import { IconHome, IconTimeline } from '@/components/ui/Icons'

export function TabBar() {
  const { openSheet } = useRecordSheet()

  return (
    <nav className="fixed bottom-0 z-30 bg-white border-t border-divider pb-safe w-full max-w-[430px] left-1/2 -translate-x-1/2">
      <div className="flex items-stretch">

        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            ['flex-1 flex flex-col items-center justify-center gap-1 py-3.5 text-xs font-medium transition-colors',
              isActive ? 'text-primary-600' : 'text-gray-400'].join(' ')
          }
        >
          {({ isActive }) => (
            <>
              <IconHome size={22} className={isActive ? 'text-primary-600' : 'text-gray-400'} />
              홈
            </>
          )}
        </NavLink>

        {/* Center floating button — ring-white creates a visual base so it looks intentional */}
        <div className="flex-1 flex justify-center items-end pb-2.5">
          <button
            type="button"
            onClick={() => openSheet()}
            aria-label="새 기록"
            className="w-[54px] h-[54px] rounded-full bg-primary-500 text-white flex items-center justify-center -translate-y-4 active:scale-95 transition-all hover:bg-primary-600"
            style={{ boxShadow: '0 0 0 5px #ffffff, 0 6px 24px rgba(95,200,168,0.45)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <NavLink
          to="/timeline"
          className={({ isActive }) =>
            ['flex-1 flex flex-col items-center justify-center gap-1 py-3.5 text-xs font-medium transition-colors',
              isActive ? 'text-primary-600' : 'text-gray-400'].join(' ')
          }
        >
          {({ isActive }) => (
            <>
              <IconTimeline size={22} className={isActive ? 'text-primary-600' : 'text-gray-400'} />
              타임라인
            </>
          )}
        </NavLink>

      </div>
    </nav>
  )
}
