import { useAuth } from '@/hooks/useAuth'

export function LoginScreen() {
  const { signIn } = useAuth()

  return (
    <div className="min-h-dvh bg-app-bg flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-8 w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-24 h-24 rounded-3xl bg-primary-500 flex items-center justify-center text-5xl shadow-lg">
            🐱
          </div>
          <h1 className="text-3xl font-bold text-text-primary">냥노트</h1>
          <p className="text-text-secondary text-center text-sm leading-relaxed">
            고양이의 건강을 꼼꼼하게 기록하고<br />
            병원 진료 시 바로 보여주세요
          </p>
        </div>

        {/* Features */}
        <div className="w-full bg-white rounded-3xl p-5 flex flex-col gap-3 shadow-sm">
          {[
            { emoji: '⚡', text: '빠른 기록 — 탭 한 번으로' },
            { emoji: '🏥', text: '병원용 요약 화면 제공' },
            { emoji: '👥', text: '공동 보호자와 함께 기록' },
            { emoji: '📵', text: '오프라인에서도 기록 가능' },
          ].map(f => (
            <div key={f.text} className="flex items-center gap-3">
              <span className="text-xl">{f.emoji}</span>
              <span className="text-sm text-text-primary">{f.text}</span>
            </div>
          ))}
        </div>

        {/* Sign in */}
        <div className="w-full flex flex-col gap-3">
          <button
            type="button"
            onClick={signIn}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 font-semibold py-4 rounded-2xl border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google로 시작하기
          </button>
        </div>
      </div>
    </div>
  )
}
