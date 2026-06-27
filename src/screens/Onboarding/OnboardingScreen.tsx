import { useNavigate } from 'react-router-dom'

export function OnboardingScreen() {
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh bg-app-bg flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-8 w-full max-w-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-24 h-24 rounded-3xl bg-primary-500 flex items-center justify-center text-5xl shadow-lg">
            🐱
          </div>
          <h1 className="text-2xl font-bold text-text-primary">냥노트</h1>
          <p className="text-text-secondary text-sm text-center">고양이를 등록하거나, 초대 코드로 참여하세요</p>
        </div>

        <div className="w-full flex flex-col gap-3">
          <button
            type="button"
            onClick={() => navigate('/cat-setup')}
            className="w-full py-4 rounded-2xl bg-primary-500 text-white font-semibold text-base active:scale-95 transition-all"
          >
            🐱 새 고양이 등록하기
          </button>
          <button
            type="button"
            onClick={() => navigate('/join')}
            className="w-full py-4 rounded-2xl bg-white border border-divider text-text-primary font-semibold text-base active:scale-95 transition-all"
          >
            🔑 초대 코드로 참여하기
          </button>
        </div>
      </div>
    </div>
  )
}
