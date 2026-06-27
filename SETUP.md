# 냥노트 — 로컬 실행 가이드

## 1. Firebase 프로젝트 만들기

1. https://console.firebase.google.com 접속
2. 새 프로젝트 생성 → 이름: `nyangnote`
3. Google Analytics는 선택 사항 (없어도 됨)

## 2. Firebase 서비스 활성화

### Authentication
- Build > Authentication > Get started
- Sign-in method > Google > 사용 설정
- 승인된 도메인에 `localhost` 확인 (기본 포함)

### Firestore Database
- Build > Firestore Database > Create database
- 보안 규칙: "production mode" 선택
- 지역: `asia-northeast3` (서울)
- 생성 후 Rules 탭 > 내용을 `firestore.rules` 파일 내용으로 교체 > 게시

### Storage
- Build > Storage > Get started
- Rules 탭 > 내용을 `storage.rules` 파일 내용으로 교체 > 게시

## 3. 앱 등록 및 환경 변수 설정

1. Firebase 콘솔 > 프로젝트 설정 (톱니바퀴)
2. 앱 추가 > 웹 앱 (`</>`)
3. 앱 이름: `냥노트-web` > 등록
4. Firebase SDK 설정값 복사

`.env.local` 파일 생성:

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=nyangnote-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=nyangnote-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=nyangnote-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## 4. 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:5173 접속

## 5. GitHub Pages 배포

```bash
npm run build
# dist/ 폴더를 GitHub Pages에 배포
```

Firebase Auth > 승인된 도메인에 GitHub Pages URL 추가:
- 예: `taffy.github.io`
