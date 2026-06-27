# 냥노트 개발 히스토리

작업 일자: 2026-06-27 ~  
기록 기준: 파일 타임스탬프 + 작업 로그

---

## 2026-06-27

### 기획서 초안 작성 (v0.1)

`cat-health-record-app-plan.md` 초안 작성.

확정 전 논의 항목:
- 음수량 입력 방식 (정량 vs 정성)
- 사료 급여량 단위
- 오프라인 상태에서의 동작
- 화장실 기록 분리 방식
- 체중 기록 구조
- 앱 이름 및 컬러 시스템
- 빠른 기록 UX 흐름

---

## 2026-06-28

### 00:05 — 기획서 v0.2 확정

기획 결정사항 확정 후 `cat-health-record-app-plan.md` v0.2로 업데이트.

확정 내용:
- **앱 이름**: 냥노트
- **컬러 시스템**: Primary #5FC8A8(초록), Secondary #FFE6AA(옐로), Semantic(Success/Warning/Error/Info), Background/Text 토큰 전체 확정
- **음수량**: 관찰 기반 chip (거의 안 마심 / 평소보다 적게 / 평소만큼 / 평소보다 많이 / 매우 많이 마심)
- **사료 단위**: 습식은 캔·파우치, 건식은 그릇 기반 chip + 직접 입력
- **오프라인 동작**: 입력 허용, 상단 고정 배너 표시 (자동 미소멸), 온라인 복귀 시 자동 동기화
- **화장실 기록**: 소변/대변 항상 별도 기록 (동시 입력 시에도 2개 생성)
- **체중**: Cat 모델 단일 필드 아닌 날짜별 Record로 관리
- **빠른 기록 UX**: 홈 → 항목 버튼 탭 → 핵심 필드만 입력 → 저장, 수정은 타임라인에서

---

### 00:11 — 프로젝트 스캐폴딩

파일 수동 생성 (디렉토리 비어있지 않아 `npm create vite` 사용 불가).

생성 파일:
- `vite.config.ts` — `@vitejs/plugin-react` + `@tailwindcss/vite` + `vite-plugin-pwa` + path alias `@/`
- `tsconfig.app.json`, `tsconfig.json`, `tsconfig.node.json`
- `index.html` — lang="ko", theme-color, viewport
- `.gitignore`, `.env.example`

기술 스택: React 19 + TypeScript + Vite 6 + Tailwind CSS v4 + Firebase v11 + vite-plugin-pwa

---

### 00:12 — 핵심 타입 및 훅 초기 생성

- `src/types/index.ts` — AppUser, Cat, CatMember, CatInvite, RecordType, HealthRecord 및 모든 Details 타입 정의
- `src/hooks/useAuth.ts` — Firebase Auth Google 로그인/로그아웃 훅
- `src/hooks/useCat.ts` — 고양이 선택/목록 훅 (localStorage 기반 선택 유지)
- `src/hooks/useOnline.ts` — 온/오프라인 상태 감지 훅 (lastSyncTime 포함)
- `src/lib/offline.ts` — 오프라인 유틸리티

---

### 00:13 — 기본 UI 컴포넌트 생성

- `src/components/ui/Button.tsx` — primary/secondary/ghost 버튼, loading 상태
- `src/components/ui/Chip.tsx` — 선택형 chip
- `src/components/ui/DateTimeInput.tsx` — 날짜/시간 입력
- `src/components/ui/SectionLabel.tsx` — 섹션 레이블
- `src/components/ui/TextArea.tsx` — 자유 메모 입력

---

### 00:18 — 앱 진입점 생성

- `src/main.tsx` — ReactDOM.createRoot, BrowserRouter 감싸기
- `src/vite-env.d.ts`

---

### 00:19 — Firebase 설정 및 훅 완성

- `src/hooks/useRecords.ts` — 기록 추가/구독 훅
- `package.json` 의존성 확정, `npm install` 완료
  - `@vitejs/plugin-react@^4.4.1 --legacy-peer-deps` (vite v6 peer dep 충돌 해결)

**오류 해결**: `@vitejs/plugin-react` v6가 vite v8 요구 → `^4.4.1`로 다운그레이드

---

### 00:20 — Firebase 초기화 (오프라인 퍼시스턴스)

- `src/lib/firebase.ts` — `initializeFirestore` + `persistentLocalCache({ tabManager: persistentMultipleTabManager() })`
- `public/` — PWA 아이콘, manifest 아이콘 자산

**변경 이유**: `enableIndexedDbPersistence` deprecated → `initializeFirestore` 방식으로 대체

---

### 00:21 — 문서

- `SETUP.md` — Firebase 프로젝트 연동 절차, Firestore 컬렉션 인덱스 설정 안내

---

### 00:45 — Firebase 환경 변수 설정

- `.env.local` — 실제 Firebase 프로젝트 credentals 입력 완료 (사용자 직접 입력)

---

### 00:49 — 레이아웃 컴포넌트

- `src/components/layout/OfflineBanner.tsx` — 상단 고정 오프라인 배너 (마지막 동기화 시간 표시)
- `src/components/ui/BottomSheet.tsx` — 바텀시트 기본 컴포넌트

---

### 00:50 — 글로벌 스타일 (index.css)

- `src/index.css` 작성

주요 내용:
- Tailwind v4 `@theme` 블록 — 냥노트 컬러 토큰 전체 (`primary-*`, `secondary-*`, `text-*`, `app-bg` 등)
- 모바일 전용 레이아웃: `#root { max-width: 430px; margin: 0 auto; box-shadow: 0 0 40px rgba(0,0,0,0.08) }`
- `body { background-color: #E6ECE8 }` — 폰 프레임 바깥 배경
- 전역 스크롤바 숨김: `scrollbar-width: none`, `::-webkit-scrollbar { display: none }`
- `@keyframes slide-up` — RecordOverlay 슬라이드 업 애니메이션

---

### 00:52 — 빠른 기록 시트 (초기)

- `src/components/records/QuickRecordSheet.tsx` — 기록 유형 선택 바텀시트 (사료/음수/화장실/증상/기분/체중)

---

### 00:54 — 주요 화면 생성

- `src/screens/Home/HomeScreen.tsx` — 홈 대시보드 (고양이 정보, 오늘 요약, 빠른 기록 버튼 6종)
- `src/screens/Timeline/TimelineScreen.tsx` — 타임라인 (날짜 필터, 유형 필터, 기록 목록)
- `src/screens/Login/LoginScreen.tsx` — Google 로그인 버튼

---

### 00:55 — 탭 내비게이션 및 컨텍스트

- `src/components/layout/TabBar.tsx` — 홈 / 플로팅 + 버튼 / 타임라인 3탭 구조
- `src/context/RecordSheetContext.tsx` — `openSheet(type?)` 컨텍스트 (TabBar + 화면 간 공유)
- `src/App.tsx` 초기 버전 — 인증·고양이 상태 기반 분기, RecordSheetProvider 연결

---

### 00:57 — 확인 다이얼로그

- `src/components/ui/ConfirmDialog.tsx` — "저장하지 않고 나가시겠어요?" 모달

---

### 00:58 — 기록 입력 폼 (사료·음수)

- `src/components/records/FoodForm.tsx` — 사료 유형, 급여량(캔/파우치/그릇 chip), 먹은 양, 식욕, 태그
- `src/components/records/WaterForm.tsx` — 음수 수준 chip, 측정 방식, 정량 입력 옵션

---

### 00:59 — 기록 입력 폼 (나머지)

- `src/components/records/MoodForm.tsx` — 기분, 활동량, 행동 태그
- `src/components/records/SymptomForm.tsx` — 증상 유형, 심각도, 횟수, 구토 상세
- `src/components/records/ToiletForm.tsx` — 소변/대변 분리, 양, 굳기, 상태 태그
- `src/components/records/WeightForm.tsx` — 체중(kg) 숫자 입력, 측정 맥락

---

### 01:04 — RecordOverlay (풀스크린 오버레이) + 헤더 수정

**변경 이유**: 기록 입력 정보가 많아 바텀시트가 좁음 → 새 창 레이어 방식으로 전환

- `src/components/records/RecordOverlay.tsx` 신규 생성
  - `fixed top-0 bottom-0` 풀스크린 슬라이드업 오버레이
  - 뒤로 가기 버튼: 입력 중 → ConfirmDialog 표시
  - 단계: `type` → `toilet_type` (화장실만) → `form`
  - `handleSave` try/catch/finally로 감쌈 (`setSaving(false)` finally 보장)
  - 저장 오류 시 상단 에러 배너 표시
  - `onDirty` 콜백으로 dirty 상태 추적

- `src/components/layout/AppHeader.tsx` 수정
  - `pt-14` → `pt-6` (상단 여백 과도 문제 해결)
  - 설정 아이콘 위치 헤더 우측으로 이동

**오류 해결**: 저장 버튼 누르면 무한 로딩 → `handleSave`에 try/catch/finally 추가

---

### 01:07 — SVG 아이콘 교체

**변경 이유**: 이모지 아이콘 → 단일 색상 SVG 아이콘으로 교체

- `src/components/ui/Icons.tsx` 생성
  - `IconHome` — 하우스 아웃라인 SVG
  - `IconTimeline` — 불릿 리스트 SVG
  - `IconSettings` — Heroicons `cog-8-tooth` 경로 (8개 톱니 + 중앙 원)

TabBar, AppHeader에서 기존 이모지 제거 후 SVG 컴포넌트로 교체

**오류 해결 과정**:
1. 1차 시도: 방사형 선 SVG → 태양처럼 보임 (잘못됨)
2. 2차 시도: 단순 기어 SVG → 형태 부정확
3. 3차 시도: Heroicons 공식 `cog-8-tooth` path 사용 → 확정

---

### 01:09 — 타입 시스템 업데이트

- `src/types/index.ts` 수정
  - `Cat` 인터페이스에 `neutered?: boolean` 추가
  - `CatInvite` 타입의 `id: string` → `code: string` 변경 (초대 코드 방식 반영)
  - `CatMember`에 `photoURL?: string` 추가

---

### 01:10 — 데이터베이스 레이어 전면 개편 + 온보딩 화면

`src/lib/db.ts` 주요 변경:

- `stripUndefined()` 함수 파일 최상단으로 이동 (Firestore `undefined` 필드 에러 방지용)
- `collectionGroup` import 추가
- `createCat(cat, ownerInfo)` — `ownerInfo` 파라미터 추가 (displayName/email/photoURL), `members` 서브컬렉션에 오너 문서 저장
- `getCatsByMember(userId)` — `collectionGroup('members')` 쿼리로 공동 보호자로 등록된 고양이도 조회
- 초대 코드 함수 신규 추가:
  - `createInviteCode(catId, catName, invitedBy, invitedByName)` — 기존 pending 코드 취소 후 새 코드 생성, 7일 만료
  - `lookupInviteCode(code)` — `inviteCodes/{code}` 조회, 만료 자동 처리
  - `acceptInviteCode(code, member)` — 코드 유효성 검증 + 보호자 6명 제한 + 중복 참여 방지 후 `members` 추가
  - `getActiveCatInviteCode(catId)` — 현재 유효한 초대 코드 조회

초대 코드 규격: 6자리 대문자 알파뉴메릭, 혼동 글자 제외 (`ABCDEFGHJKLMNPQRSTUVWXYZ23456789`)

**오류 해결**: Firestore `Function setDoc() called with invalid data. Unsupported field value: undefined` → `stripUndefined()` 재귀 함수로 저장 전 undefined 필드 전부 제거

`src/screens/Onboarding/OnboardingScreen.tsx` 신규 생성:
- 고양이 없는 첫 사용자를 위한 진입점
- "새 고양이 등록하기" → `/cat-setup`
- "초대 코드로 참여하기" → `/join`

---

### 01:14 — 공동 보호자 화면 + 라우팅 완성

`src/screens/Guardian/GuardianScreen.tsx` 신규 생성:
- 보호자 목록 (프로필 이미지, 역할 표시, 나/오너 배지)
- 초대 코드 생성·표시·공유·복사 (오너만 접근 가능)
- 코드 잔여 유효일 표시
- `navigator.share()` 미지원 시 클립보드 복사로 폴백
- 보호자 제거 기능 (오너만)

`src/screens/Join/JoinScreen.tsx` 신규 생성:
- 6자리 코드 입력 (대문자 자동 변환, 혼동 글자 필터)
- "코드 확인하기" → 고양이 이름·초대자 표시
- "보호자로 참여하기" → `acceptInviteCode` 호출
- 에러 메시지 인라인 표시 (유효하지 않은 코드 / 이미 참여 / 최대 인원 초과)

`src/screens/CatSetup/CatSetupScreen.tsx` 수정:
- `createCat` 호출 시 `ownerInfo` 파라미터 전달 (displayName, email, photoURL)

`firestore.rules` 수정:
- `inviteCodes/{code}` 컬렉션 규칙 추가 (인증 사용자 read/write 허용)

---

### 01:15 — 라우터 및 설정 화면 최종 연결

`src/App.tsx` 수정:
- 고양이 없는 상태일 때 온보딩 라우트 분기 처리
  ```
  /          → OnboardingScreen
  /cat-setup → CatSetupScreen
  /join      → JoinScreen
  ```
- 고양이 있는 상태 라우트에 `/guardian` 추가
- `JoinScreen`에 `onJoined(catId)` 콜백 — refetch + selectCat 후 홈 진입

`src/screens/Settings/SettingsScreen.tsx` 수정:
- "보호자" 섹션 추가: "공동 보호자 관리" → `/guardian` 링크

---

## 구현 완료 기능 요약

| 기능 | 상태 |
|---|---|
| Google 로그인 / 로그아웃 | ✅ |
| 고양이 등록 (이름·생일·성별·중성화) | ✅ |
| Firestore 오프라인 퍼시스턴스 | ✅ |
| 오프라인 상태 배너 | ✅ |
| 사료 기록 입력 | ✅ |
| 음수 기록 입력 | ✅ |
| 기분/활동 기록 입력 | ✅ |
| 증상 기록 입력 | ✅ |
| 화장실 기록 입력 (소변/대변 분리) | ✅ |
| 체중 기록 입력 | ✅ |
| 타임라인 조회 + 날짜·유형 필터 | ✅ |
| 홈 대시보드 빠른 기록 버튼 | ✅ |
| 기록 유형별 직행 진입 (initialType) | ✅ |
| 풀스크린 RecordOverlay | ✅ |
| 입력 중 뒤로가기 확인 다이얼로그 | ✅ |
| 모바일 전용 레이아웃 (430px 고정) | ✅ |
| 하단 탭 내비게이션 (홈·타임라인·+버튼) | ✅ |
| 단일 색상 SVG 아이콘 | ✅ |
| 설정 화면 | ✅ |
| 공동 보호자 초대 코드 생성·공유 | ✅ |
| 초대 코드 입력·검증·참여 | ✅ |
| 보호자 목록 조회·제거 | ✅ |
| 온보딩 화면 (등록 vs 참여 선택) | ✅ |
| PWA 구성 (manifest, service worker) | ✅ |

## 미구현 (2차 버전)

| 기능 |
|---|
| 사진 첨부 (Firebase Storage — Blaze 요금제 필요) |
| 기록 수정 UI (케밥 메뉴 → 오버레이) | ✅ |
| 기록 삭제 UI (케밥 메뉴 → 확인 다이얼로그) | ✅ |
| ~~기록 수정/삭제 UI~~ |
| 통계 그래프 (체중 추이 등) |
| 병원용 요약 화면 |
| 알림 자동화 |
| 다중 고양이 전환 UI |
| CSV 내보내기 |

---

## 2026-06-28 (추가 작업)

### ~01:30 — 공동 보호자 화면 무한 로딩 버그 수정

**요청**: "공동 보호자 들어가면 불러오는 중만 뜨는데 에러인듯"

**원인 분석**:
1. `GuardianScreen`의 `load` 함수에 try/catch가 없어서, 에러 발생 시 `setLoading(false)`가 호출되지 않고 무한 로딩 상태로 멈춤
2. `getActiveCatInviteCode`와 `createInviteCode`에서 Firestore `where` 조건 두 개를 동시에 사용 (`catId` + `status`) → Firestore 복합 인덱스(composite index) 없으면 쿼리 에러 발생 → 위 문제로 연결

**수정 파일**:

- `src/lib/db.ts`
  - `getActiveCatInviteCode`: `where('catId', '==', catId)` 단일 조건만 사용, `status`·만료일 필터는 클라이언트에서 처리 (복합 인덱스 불필요)
  - `createInviteCode`: 기존 코드 취소 쿼리도 동일하게 단일 조건으로 변경, pending 필터를 클라이언트에서 처리

- `src/screens/Guardian/GuardianScreen.tsx`
  - `load` 함수에 try/catch/finally 추가 → 에러가 나도 `setLoading(false)` 보장
  - `loadError` 상태 추가 → 에러 발생 시 "다시 시도" 버튼과 함께 오류 메시지 표시

---

### ~01:40 — Firestore 보안 규칙 미배포 문제

**요청**: "Missing or insufficient permissions. 그렇다는데 그럼 나 어떻게 뭘 수정하라는거임"

**원인**: `firestore.rules` 파일은 로컬에만 있고 Firebase에 배포된 적 없음. Firebase는 기본 규칙(모든 접근 거부)으로 동작 중이어서 권한 에러 발생.

**안내**: Firebase Console → Firestore Database → 규칙 탭에서 `firestore.rules` 내용 직접 붙여넣고 게시.

**코드 변경 없음**

---

### ~01:45 — Firestore 규칙 붙여넣기 파싱 에러

**요청**: "Line 15: Unexpected ')'.; Line 26: Unexpected '}'."

**원인**: 채팅 메시지에서 직접 복붙 시 `$(...)` 같은 특수 표현이 깨질 수 있음.

**안내**: 채팅이 아닌 로컬 파일(`firestore.rules`)에서 직접 복사하도록 안내. `cat /Users/taffy/Documents/dev/cat/firestore.rules` 명령어 또는 VS Code에서 파일 열어 복사.

**결과**: 재시도 후 정상 반영됨.

**코드 변경 없음**

---

### ~02:00 — 초대 코드 단순화 (만료 제거, 고양이당 코드 1개 고정)

**요청**: "초대코드에 새 코드 생성은 없애도 될 거 같아. 그냥 고양이 한 마리당 코드 하나인 걸로 하고, 만료도 없애"

**수정 파일**:

- `src/types/index.ts`
  - `CatInvite`에서 `status`, `expiresAt` 필드 제거

- `src/lib/db.ts`
  - `createInviteCode` → `getOrCreateInviteCode`로 교체: 이미 코드가 있으면 기존 코드 반환, 없을 때만 새로 생성. 만료·취소 로직 전부 제거
  - `lookupInviteCode`: status/expiry 체크 제거, 존재 여부만 확인
  - `acceptInviteCode`: 코드 status 업데이트 로직 제거 (코드는 영구 유지)
  - `getActiveCatInviteCode` → `getCatInviteCode`로 교체: status/만료 필터 없이 고양이의 코드 단순 조회

- `src/screens/Guardian/GuardianScreen.tsx`
  - "새 코드 생성" 버튼 제거
  - "N일 후 만료" 텍스트 제거
  - `handleGenerateCode` → `handleGetCode`로 교체 (getOrCreateInviteCode 호출)
  - import 업데이트 (`createInviteCode`, `getActiveCatInviteCode` → `getOrCreateInviteCode`, `getCatInviteCode`)

---

### ~02:10 — 공유하기 시트에 카카오톡 안 보이는 문제 문의

**요청**: "공유하기 눌렀을 때 카카오톡이나 이런 거에도 되게 뜨고 싶은데, 원래 이렇게 단촐하게 나오는거야?" (스크린샷: Mail, 메시지, 메모 등 macOS 앱만 표시됨)

**원인**: 맥 브라우저에서 테스트 중이기 때문. `navigator.share()`는 해당 기기 OS의 기본 공유 시트를 열므로, 맥에서는 macOS 공유 확장(Mail, 메시지 등)만 표시됨. 카카오톡은 macOS 공유 확장을 지원하지 않아 목록에 없음. "2개의 이미지"는 macOS가 페이지 파비콘 등을 자동 첨부하는 것으로 실제 공유 내용(텍스트)에는 무관.

**결론**: 코드 정상. 아이폰에서 열면 카카오톡 등 설치된 앱이 포함된 iOS 공유 시트가 표시됨. 테스트 방법: `ipconfig getifaddr en0`으로 맥 IP 확인 후 같은 와이파이의 아이폰 브라우저에서 `http://[IP]:5175` 접속.

**코드 변경 없음**

---

### ~02:20 — 보호자 목록 표시 방식 변경

**요청**: "초대한 사람을 주 보호자로 하는 거 말고 그냥 구글 계정으로 나오게 해줘 보호자1 보호자2 이렇게"

**수정 파일**:

- `src/screens/Guardian/GuardianScreen.tsx`
  - 멤버 목록 `joinedAt` 기준 오름차순 정렬 (번호 순서 고정)
  - "주 보호자" / "공동 보호자" 역할 텍스트 → "보호자1", "보호자2" 등 가입 순 번호로 변경

---

### ~02:30 — 보호자 목록 카드 레이아웃 변경

**요청**: "보호자1 / 이름 / 구글 계정 / (프로필 사진 있으면 구글 프로필 사진으로) 이런 식으로 해줘"

**수정 파일**:

- `src/screens/Guardian/GuardianScreen.tsx`
  - 각 보호자 항목 레이아웃 변경: 프로필 사진(좌) + 보호자N(상단 초록 레이블) + 이름 + 이메일 순으로 표시
  - 프로필 사진 크기 `w-10 h-10` → `w-11 h-11`로 소폭 확대
  - 구글 계정 이메일(`member.email`) 추가 표시

---

### ~03:00 — 기록 수정 기능 추가 / + 버튼 정렬 수정 / 내비 바 높이 증가

**요청**:
1. "빠른 기록 입력하고 나서 상세 화면 없고, 수정도 불가한 문제 있음"
2. "추가 버튼 동그라미 도형과 + 아이콘 수직 수평 중앙 정렬 일치하지 않는 이슈"
3. "내비 바 높이 지금보다 1.3배 키워줘"

**수정 파일**:

- `src/components/layout/TabBar.tsx`
  - + 텍스트 문자 → SVG 라인 아이콘으로 교체 (폰트 메트릭 영향 없는 완전 중앙 정렬)
  - NavLink `py-2` → `py-4` (≈1.3× 높이)
  - `items-end` → `items-stretch`로 변경, 센터 버튼 컨테이너 `pb-4`로 통일

- `src/components/records/FoodForm.tsx`
- `src/components/records/WaterForm.tsx`
- `src/components/records/ToiletForm.tsx`
- `src/components/records/MoodForm.tsx`
- `src/components/records/SymptomForm.tsx`
- `src/components/records/WeightForm.tsx`
  - 각 폼에 `initialValues` prop 추가 (recordedAt, note, details)
  - 수정 모드 진입 시 기존 값으로 상태 초기화 (날짜·시간, 각 선택 항목, 메모 전부)

- `src/components/records/RecordOverlay.tsx`
  - `editRecord?: HealthRecord` prop 추가
  - `onUpdate?: (recordId, details, recordedAt, note) => Promise<void>` prop 추가
  - 수정 모드 시: type 선택 단계 건너뛰고 폼으로 직행, 헤더 "○○ 기록 수정"으로 표시
  - 저장 시 editRecord 있으면 onUpdate 호출, 없으면 기존 onSave 호출
  - 수정 완료 메시지 "기록이 수정되었어요"로 별도 표시

- `src/screens/Timeline/TimelineScreen.tsx`
  - `onEdit: (record: HealthRecord) => void` prop 추가
  - 각 기록 항목 펼쳤을 때 "수정" 버튼 표시 (e.stopPropagation으로 토글 이벤트와 분리)

- `src/App.tsx`
  - `editRecord` 상태 추가
  - `openEdit(record)` 함수 추가 — 타임라인 수정 버튼 클릭 시 호출
  - `handleUpdate` 함수 추가 — `useRecords.update()` 호출
  - `handleClose` 함수 — 닫을 때 editRecord 초기화
  - TimelineScreen에 `onEdit={openEdit}` 전달
  - RecordOverlay에 `onUpdate`, `editRecord` 전달

---

### ~04:00 — 케밥 메뉴(⋮)로 수정/삭제 UX 개편 + 홈 화면에도 적용

**요청**: "펼치면 수정 버튼 나오는 게 좀 UX 별로임 ㅠㅠ 그리고 타임라인에서 말고 홈 화면에서도 나와야 하지 않을까? 차라리 케밥버튼인가 그거 두고 수정, 삭제 드롭다운뜨게하면 어떠무"

**수정 파일**:

- `src/components/ui/KebabMenu.tsx` (신규 생성)
  - ⋮ 아이콘 버튼 (SVG 세 점)
  - 클릭 시 "수정 / 삭제" 드롭다운 표시 (`absolute right-0 top-9 z-50`)
  - 외부 클릭 시 드롭다운 닫힘 (`mousedown` 이벤트 전역 리스너)
  - 삭제 선택 시 `ConfirmDialog`로 "이 기록을 삭제할까요?" 확인 후 실행
  - `e.stopPropagation()` 적용 — 카드 expand 이벤트와 분리

- `src/screens/Timeline/TimelineScreen.tsx`
  - `onDelete: (record: HealthRecord) => void` prop 추가
  - `TimelineItem`을 `<button>` → `<div>` 래퍼로 교체
  - 타이틀/서브텍스트 영역만 expand 토글 담당 (tags·note 있을 때만 클릭 가능)
  - 우측에 `KebabMenu` 항상 표시 (펼치기 여부와 무관)
  - expand 섹션에서 "수정" 버튼 제거 → 기록자 텍스트만 남김
  - `KebabMenu` import 추가

- `src/screens/Home/HomeScreen.tsx`
  - `onEdit: (record: HealthRecord) => void`, `onDelete: (record: HealthRecord) => void` props 추가
  - `RecentRecordItem`에 `onEdit`/`onDelete` props 추가
  - 각 기록 카드 우측에 `KebabMenu` 추가
  - `KebabMenu` import 추가

- `src/App.tsx`
  - `useRecords`에서 `remove` 추가로 구조분해
  - `handleDelete(record)` 함수 추가 — `remove(record.id)` 호출
  - HomeScreen에 `onEdit={openEdit} onDelete={handleDelete}` 전달
  - TimelineScreen에 `onDelete={handleDelete}` 추가 전달

---

### ~05:00 — 전체 UI 여백·크기·간격 리파인 (내비바 + 홈 + 타임라인)

**요청**: "지금 UI가 최선인지 객관적으로 점검하고 여백, 크기, 간격, 마진&패딩 신경써서 리빌딩해줘. 특히 내비바 추가 버튼이 혼자 너무 붕뜬 느낌"

**수정 파일**:

- `src/components/layout/TabBar.tsx`
  - `-translate-y-4`와 `items-end pb-4` 제거 → 버튼이 바에서 떠 보이던 근본 원인 해결
  - `h-[60px] items-center` 고정 높이 구조로 변경 → 버튼이 바 안에 자연스럽게 통합
  - 버튼 크기: `w-14 h-14` → `w-[52px] h-[52px]`, 초록 컬러 그림자로 시각적 깊이 유지
  - NavLink 활성 상태: 색상만 변경 → `bg-primary-50 rounded-full` 아이콘 뒤 배경 추가
  - 아이콘 크기: 22px → 20px, 레이블: `text-xs` → `text-[10px]`, gap `gap-1` → `gap-[3px]`

- `src/components/layout/AppHeader.tsx`
  - 상단 여백: `pt-6` → `pt-5` (4px 축소)

- `src/screens/Home/HomeScreen.tsx`
  - `SectionLabel` 공용 컴포넌트 추가: `text-xs tracking-wider uppercase font-semibold text-gray-400`
  - `SummaryCard` 값 글씨: `font-semibold text-sm` → `font-bold text-[15px] leading-none` (핵심 데이터 가독성 향상)
  - `SummaryCard` 내부 gap: `gap-1` → `gap-2`, padding 균등화 `p-4` → `px-4 py-4`
  - Summary/Quick 카드 gap: `gap-3` → `gap-2.5` (2px 축소로 더 정돈된 느낌)
  - Quick buttons: `border border-divider` 제거, `py-4` → `pt-4 pb-3.5`, label `text-xs` → `text-[11px]`
  - 최근 기록 섹션 상단 여백: `mt-6` → `mt-7`
  - `RecentRecordItem`: label `font-medium` → `font-semibold`, sub에 `mt-[1px]` 추가

- `src/screens/Timeline/TimelineScreen.tsx`
  - 필터 탭: `px-4 py-2` → `px-3.5 py-1.5` (약간 컴팩트하게)
  - 날짜 그룹 레이블: `text-xs font-semibold text-text-secondary mb-2` → `text-[11px] font-semibold text-gray-400 tracking-wide uppercase mb-2.5`
  - 타임라인 아이템: `gap-3` → `gap-2.5`, emoji `text-xl` → `text-[20px] leading-none`
  - 확장 섹션: `gap-2` → `gap-1.5`
  - 시간 표시에 `tabular-nums` 추가 (숫자 너비 일관성)

---

### ~05:30 — 내비바 추가 버튼 플로팅 방식으로 복원 + ring 기법으로 개선

**요청**: "추가버튼을 내비 바 안에 넣어 버려서 개 구려졌어... 저게 뭐임"

**원인 분석**: 바 안에 넣은 플랫 디자인이 더 나빴음. 플로팅 자체는 올바른 UX였고, 원래 문제는 버튼과 바 사이에 시각적 분리선이 없어서 "실수로 겹쳐진 것"처럼 보였던 것.

**수정 내용**:

- `src/components/layout/TabBar.tsx`
  - 플로팅 구조 복원: `items-end pb-2.5` + `-translate-y-4`
  - 버튼 크기: `w-[54px] h-[54px]`
  - inline `boxShadow`: `0 0 0 5px #ffffff, 0 6px 24px rgba(95,200,168,0.45)`
    - 첫 번째: 흰 테두리 링 5px → 버튼-바 경계를 명확히 분리 → "의도적 플로팅"처럼 보임
    - 두 번째: 초록 방향성 그림자 → 깊이감 유지
  - 사이드 탭: `py-4` → `py-3.5`
  - 아이콘·레이블 크기 원복 (22px, text-xs)

---

### ~06:00 — 사료 폼 건식 디폴트 + 타임라인/홈 카드 정보 개선 + 심각도 시각화

**요청**:
1. "사료의 경우 건식이 디폴트라 건식을 맨앞으로 옮기고 디폴트 설정해줘"
2. "타임라인에서 펼쳐도 해당 항목이 표시가 안되니까 불편해. 더 직관적이면서 난잡하지 않은 UI 구성이 필요함"
3. "심각한 항목을 선택했을 경우 타임라인이나 홈 화면에서 보이는 카드에서도 그게 드러나야 함"

**수정 파일**:

- `src/components/records/FoodForm.tsx`
  - `FOOD_TYPES` 배열에서 건식을 첫 번째로 이동 (습식→건식 순서 변경)
  - 기본값: `iv?.foodType ?? 'wet'` → `iv?.foodType ?? 'dry'`
  - 직접 입력 기본 단위: `'can'` → `'bowl'` (건식 기본에 맞게)

- `src/lib/recordDisplay.ts` (신규 생성)
  - `RecordInfo` 인터페이스: `{ main, detail?, tags?, alert?, warning? }`
  - `recordInfo(record: HealthRecord): RecordInfo` — 모든 기록 유형의 한국어 표시 + 심각도 계산
  - **food**: main = "건식·1그릇", detail = "절반 먹음·식욕 없음·구토·설사" (식사 후 증상 인라인), tags = reactionTags
    - alert: eatenRatio===0 OR symptomTags 존재
    - warning: eatenRatio≤25 OR appetite poor/none
  - **water**: main = 음수량, detail = ml 수치, alert = very_low, warning = low
  - **mood**: main = 기분, detail = 활동량, alert = aggressive, warning = hiding/lethargic/anxious
  - **symptom**: main = 증상명(한국어), detail = "심각도·횟수·타이밍", alert = severe/moderate/피섞임, warning = mild
    - 기존 버그 수정: `sd.symptomType` 영문 raw값 표시 → SYMPTOM_TYPE_LABEL로 한국어 변환
    - 구토 횟수: `vomitExtra.count` 우선 사용
  - **toilet**: main = "소변·보통량", detail = 이상 태그 인라인 (혈뇨·탁함 등), alert = 심각 태그 or amount===none
  - **weight**: main = "4.35kg", detail = 측정 맥락
  - 분수 표시: 0.25→"1/4", 0.5→"1/2", 0.75→"3/4"

- `src/screens/Timeline/TimelineScreen.tsx`
  - `recordDetail()` 제거 → `recordInfo()` 사용 (import from `@/lib/recordDisplay`)
  - 중복 정의된 `WATER_LABEL`, `MOOD_LABEL`, `EATEN_LABEL` 상수 제거
  - `TimelineItem` 카드 레이아웃:
    - `main` 라인: 항상 표시 (font-medium, text-primary)
    - `detail` 라인: 항상 표시 (새로 추가, text-secondary)
    - `alert` 시: 카드 `border-red-200 bg-red-50/20` + "주의" 빨간 배지
    - `warning` 시: 카드 `border-amber-200` + "확인" 노란 배지
    - tags: 펼쳤을 때만 표시 (기존과 동일)

- `src/screens/Home/HomeScreen.tsx`
  - `recordSub()` 함수 제거 → `recordInfo()` 사용
  - `WATER_LEVEL_LABEL` 상수 제거 → `WATER_LABEL` import
  - `RecentRecordItem`: sub 텍스트 = "main · detail" 합산
  - `alert` 시: 카드 `border-red-200 bg-red-50/20` + "주의" 배지
  - `warning` 시: 카드 `border-amber-200` + "확인" 배지

---

### ~06:10 — "주의"/"확인" 배지 마진 2px 추가

**요청**: "주의 이렇게 표시되는 거 마진 상하좌우 2px로 늘려줘"

- `src/screens/Timeline/TimelineScreen.tsx` + `src/screens/Home/HomeScreen.tsx`
  - 주의(빨강) / 확인(노랑) 배지에 `my-0.5` (상하 2px) 추가

---

### ~06:30 — 홈 배너를 recordInfo 기반으로 변경 (타임라인 심각도와 연동)

**요청**: "타임라인 보면 주의 2건, 확인 1건인데 홈 화면 배너엔 증상 기록 1건만 나와. 타임라인이랑 연동이 아예 안되는 듯"

**원인**: 기존 홈 배너는 `r.type === 'symptom'`만 카운트 → 음수/사료/기분 등 다른 유형의 주의/확인 기록은 반영 안 됨.

**수정**: `src/screens/Home/HomeScreen.tsx`
- `todaySymptoms` 제거 → `todayAlerts` / `todayWarnings` 로 분리
- 오늘 기록 전체에 `recordInfo(r).alert` / `recordInfo(r).warning` 적용
- 배너 분리: 주의(빨강) + 확인 필요(노랑) 각각 별도 표시
- 타임라인에서 보이는 주의/확인 건수와 홈 배너가 일치하게 됨

---

### ~06:40 — 홈 주의 배너 → 헤더 아래 한 줄 텍스트로 변경

**요청**: "배너 차지 너무 많이 하고 유의미한지 잘 모르겠어. 다른 방식으로"

**수정**: `src/screens/Home/HomeScreen.tsx`
- 두 줄 박스 배너 제거 → `text-xs text-text-secondary` 한 줄 텍스트로 변경
- 형식: "⚠ 주의 2 · 확인 1" (각각 있는 것만 표시)
- 이후 재수정: 텍스트가 너무 안 보이고 간격도 좁다는 피드백 → 작은 rounded-full 칩 형태로 변경 (빨강/노랑 bg, 눈에 띄지만 박스보다 가볍게)

---

### ~06:20 — updateRecord undefined 필드 오류 수정

**요청**: "Function updateDoc() called with invalid data. Unsupported field value: undefined (found in field details.waterAmountMl)"

**원인**: `updateRecord`에서 `stripUndefined` 없이 그대로 `updateDoc` 호출 → `waterAmountMl` 등 선택 필드가 `undefined`일 때 Firestore 에러 발생. `addRecord`는 이미 `stripUndefined` 적용돼 있었으나 `updateRecord`만 누락.

**수정**: `src/lib/db.ts` `updateRecord` — `stripUndefined()` 감싸서 저장 전 undefined 필드 제거
