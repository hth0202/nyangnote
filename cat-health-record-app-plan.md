# 냥노트 — 고양이 건강 상태 기록 앱 기획서

## 변경 히스토리

| 버전 | 날짜 및 시간 | 주요 변경 내용 |
|---|---|---|
| v0.1 | 2026-06-27 | 초안 작성 |
| v0.2 | 2026-06-28 00:05 | 앱명·컬러 시스템 확정, 음수량·사료 단위 방식 결정, 오프라인 동작 정의, 화장실 기록 방식 확정, 체중 기록 추가, 빠른 기록 UX 흐름 확정 |

---

## 1. 프로젝트 목적

고양이의 식사, 음수, 활동, 증상, 화장실, 체중 기록을 일상적으로 남기고, 이상 징후가 있을 때 동물병원에 그대로 보여줄 수 있을 정도로 구체적인 기록을 제공하는 PWA 앱을 만든다.

핵심 목표:

- 보호자가 빠르게 기록할 수 있는 모바일 중심 UX
- 병원 진료 시 날짜별, 항목별, 증상별로 쉽게 보여줄 수 있는 기록 화면
- 여러 기기에서 같은 계정으로 동기화
- 기록 누락을 줄이는 표준화된 입력 옵션
- 필요할 때 자유롭게 보충할 수 있는 메모 구조

---

## 2. 브랜딩

### 2.1 앱 이름

**냥노트**

### 2.2 컬러 시스템

#### Primary (메인 초록)

| 역할 | 토큰 | 컬러 |
|---|---|---|
| 배경 | Primary 50 | #F1FCF8 |
| Hover Background | Primary 100 | #D8F5EC |
| 카드 강조 | Primary 200 | #BDEDDC |
| 비활성 강조 | Primary 300 | #98DFC6 |
| Hover | Primary 400 | #78D3B4 |
| **메인** | **Primary 500** | **#5FC8A8** |
| Pressed | Primary 600 | #4DB391 |
| Dark | Primary 700 | #3E9377 |
| 강조 | Primary 800 | #2E725D |
| 매우 진한 영역 | Primary 900 | #1F5142 |

#### Secondary (서브 옐로)

메인 컬러: `#FFE6AA`

#### Semantic

| 역할 | 컬러 | 사용 예 |
|---|---|---|
| Success | #43B581 | 정상 기록, 완료 |
| Warning | #F4B740 | 예방접종 예정, 약 먹는 날 |
| Error | #E55D5D | 체중 감소, 이상 증상 |
| Info | #5AA7F6 | 병원 안내, 팁 |

#### Background

| 역할 | 컬러 |
|---|---|
| App Background | #F9FCFB |
| Card | #FFFFFF |
| Secondary Surface | #F4FAF7 |
| Divider | #E6ECE8 |

#### Text

| 역할 | 컬러 |
|---|---|
| Primary | #202428 |
| Secondary | #66707A |
| Placeholder | #9AA3AA |
| Disabled | #C7CDD1 |

#### Gray

| 역할 | 컬러 |
|---|---|
| White | #FFFFFF |
| Gray 50 | #FAFAFA |
| Gray 100 | #F4F4F5 |
| Gray 200 | #E8E8EA |
| Gray 300 | #D5D6DA |
| Gray 400 | #A9ADB5 |
| Gray 500 | #7B8088 |
| Gray 600 | #5B616A |
| Gray 700 | #424850 |
| Gray 800 | #2B3036 |
| Gray 900 | #171A1E |

---

## 3. 권장 기술 스택

### 3.1 프론트엔드

권장안: React + TypeScript + Vite + Tailwind CSS

선정 이유:

- React 생태계가 넓어 유지보수와 기능 확장이 쉽다.
- TypeScript를 사용하면 기록 데이터 구조를 안정적으로 관리할 수 있다.
- Vite는 개발 서버와 빌드 속도가 빠르고 PWA 구성도 간결하다.
- Tailwind CSS는 냥노트 컬러 시스템을 토큰으로 관리하기 좋다.

대안:

- React Native / Expo: 앱스토어 배포까지 고려하면 좋지만, 현재 요구사항은 GitHub Pages에서 설치 가능한 PWA가 우선이므로 초기 버전에는 과하다.
- Flutter: 크로스플랫폼 앱에는 강하지만, 웹/PWA와 GitHub Pages 중심 배포에는 React 기반이 더 단순하다.

결론: 초기 버전은 React PWA로 개발하고, 추후 네이티브 앱 배포가 필요해지면 Expo 또는 Flutter 전환을 검토한다.

### 3.2 백엔드 및 인프라

- Firebase Authentication: Google 로그인
- Cloud Firestore: 사용자별 기록 저장
- Firebase Storage: 기록별 사진 첨부 저장
- GitHub Pages: 배포 (Firebase Hosting은 추후 검토)

주의:

- GitHub Pages에서 PWA 설치는 가능하지만, Firebase Auth의 리디렉션 도메인 설정이 필요하다.
- iOS PWA는 푸시 알림, 백그라운드 동작, 설치 UX에 제한이 있을 수 있다.

---

## 4. 주요 사용자 시나리오

### 4.1 일상 기록

보호자는 홈 화면에서 빠른 기록 버튼을 탭해 핵심 항목만 빠르게 입력한다. 추가 정보는 타임라인에서 해당 기록을 열어 수정·보완한다.

입력 중심 항목:

- 사료 급여
- 음수량
- 활동/기분
- 기타 증상
- 화장실
- 체중

### 4.2 병원 진료 시 확인

보호자는 특정 기간을 선택해 다음 정보를 보여준다.

- 최근 24시간 기록
- 최근 3일 기록
- 최근 7일 기록
- 증상만 모아보기
- 식사량 변화
- 음수량 변화
- 구토/기침/울음 등 특정 증상 빈도
- 화장실 기록 변화
- 체중 변화

### 4.3 다중 사용자 사용

Google 로그인 기반으로 같은 고양이를 여러 보호자가 기록할 수 있게 한다.

초기 MVP부터 공동 보호자 기능을 포함한다. 한 명의 보호자가 다른 사용자를 초대할 수 있으며, 한 고양이당 보호자는 최대 6명까지 허용한다.

여러 고양이 등록은 당장 핵심 기능은 아니지만, 추후 확장 가능하도록 데이터 구조와 화면 구조에 반영한다. MVP에서는 기본적으로 한 마리 등록 흐름을 간단하게 제공하고, 설정 또는 고양이 전환 화면에서 추가 등록이 가능하도록 설계한다.

---

## 5. 정보 구조

### 5.1 주요 화면

1. 로그인 화면
2. 고양이 선택/등록 화면
3. 홈 대시보드
4. 빠른 기록 화면
5. 기록 상세 수정 화면
6. 타임라인 화면
7. 통계/요약 화면
8. 병원용 요약 화면
9. 설정 화면
10. 보호자 관리/초대 화면

### 5.2 빠른 기록 UX 흐름

홈 화면 → 빠른 기록 버튼 탭 → 핵심 항목만 입력 → 저장

필요 시 타임라인에서 해당 기록 탭 → 상세 수정 화면에서 보완

빠른 기록에서 입력하는 항목:

| 유형 | 빠른 기록 핵심 항목 |
|---|---|
| 사료 | 사료 유형, 급여량, 먹은 양 |
| 음수 | 음수 관찰 수준 |
| 화장실 | 소변/대변 선택, 양, 주요 상태 |
| 증상 | 증상 유형, 횟수 |
| 활동/기분 | 기분, 활동량 |
| 체중 | 체중(kg) |

### 5.3 홈 대시보드 표시 정보

- 선택된 고양이 이름
- 오늘 기록 요약
- 마지막 식사 시간
- 마지막 음수 기록
- 마지막 화장실 기록
- 최근 증상 알림
- 빠른 기록 버튼 (사료 / 음수 / 화장실 / 증상 / 활동/기분 / 체중)

---

## 6. 오프라인 동작

오프라인 상태에서도 기록 입력이 가능하다. 앱은 내부에 기록을 임시 저장하고, 온라인 상태로 전환되면 자동으로 Firebase와 동기화한다.

오프라인 상태 표시:

- 화면 상단 또는 하단에 고정 토스트 배너를 표시한다.
- 배너는 자동으로 사라지지 않는다.
- 표시 예시: `오프라인 상태 · 마지막 연동 2026.06.28 00:05`
- 온라인 복귀 후 동기화 완료 시 배너가 사라진다.

---

## 7. 기록 항목 공통 설계

모든 기록은 공통 필드를 가진다.

| 필드 | 설명 |
|---|---|
| id | 기록 고유 ID |
| catId | 고양이 ID |
| userId | 작성자 ID |
| type | 기록 유형 |
| recordedAt | 실제 발생 날짜 및 시간 |
| createdAt | 앱에 기록한 시간 |
| updatedAt | 수정 시간 |
| note | 자유 메모 |
| tags | 표준 태그 목록 |
| photoUrls | 첨부 사진 URL 목록 |

날짜와 시간은 반드시 Datepicker, Timepicker로 입력한다.

사진 첨부는 모든 기록 유형에서 선택적으로 지원한다. 특히 구토, 대변, 소변 상태, 식사 잔량처럼 말로 설명하기 어려운 상태를 병원에서 확인할 수 있도록 한다.

---

## 8. 사료 기록

### 8.1 입력 필드

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| recordedAt | datetime | 필수 | 급여 날짜 및 시간 |
| foodType | enum | 필수 | 습식, 건식, 간식, 처방식, 기타 |
| foodName | string | 선택 | 제품명 또는 사료명 |
| servedAmount | amount | 필수 | 그릇에 준 양 |
| eatenAmount | enum | 필수 | 실제로 먹은 비율 |
| appetite | enum | 선택 | 식욕 상태 |
| symptoms | array | 선택 | 구토 등 식사 관련 증상 |
| photos | array | 선택 | 사료 상태, 먹은 뒤 잔량 사진 |
| note | string | 선택 | 추가 메모 |

### 8.2 급여량 단위 및 입력 방식

사료 유형별 기본 단위를 다르게 제공한다.

**습식 / 처방 습식 (캔·파우치 기반)**

chip 예시:

- 1/4캔
- 1/2캔
- 1캔
- 1파우치
- 1/2파우치
- 직접 입력

단위: 캔, 파우치, g

**건식 (그릇 기준)**

chip 예시:

- 1/4그릇
- 1/2그릇
- 3/4그릇
- 1그릇
- 직접 입력

단위: 그릇, 컵, 스푼, g

직접 입력 시 단위 선택: g / ml / 컵 / 캔 / 파우치 / 스푼 / 그릇

### 8.3 먹은 양 입력 방식

비율 중심 chip을 기본으로 한다.

| 표시값 | 저장 비율 |
|---|---:|
| 전부 | 100 |
| 거의 다 | 75 |
| 절반 | 50 |
| 조금 | 25 |
| 거의 안 먹음 | 10 |
| 안 먹음 | 0 |

### 8.4 비고 구조

- 식욕 상태: 좋음 / 보통 / 적음 / 없음 / 평소와 다름
- 식사 반응 태그: 잘 먹음 / 천천히 먹음 / 남김 / 냄새만 맡음 / 거부함
- 식사 후 증상 태그: 구토 / 헛구역질 / 설사 / 기침 / 침 흘림
- 자유 메모

---

## 9. 음수량 기록

### 9.1 입력 필드

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| recordedAt | datetime | 필수 | 음수 날짜 및 시간 |
| waterLevel | enum | 필수 | 관찰 기반 음수 수준 |
| measurementType | enum | 선택 | 직접 측정, 추정, 급수기 기준 |
| waterAmountMl | number | 선택 | 정량 입력 (ml) |
| photos | array | 선택 | 급수기 수위, 물그릇 상태 사진 |
| note | string | 선택 | 추가 메모 |

### 9.2 입력 방식

음수량은 정확히 재기 어려우므로 관찰 기반 chip을 기본으로 한다. "조금/보통/많이"는 기준이 불명확하므로 평소 대비 상대적 표현을 사용한다.

기본 chip:

- 거의 안 마심
- 평소보다 적게
- 평소만큼
- 평소보다 많이
- 매우 많이 마심

정량 입력 (선택 옵션, measurementType이 직접 측정인 경우):

- 10ml / 30ml / 50ml / 100ml / 직접 입력

내부 저장값:

| 표시값 | waterLevel 저장값 |
|---|---|
| 거의 안 마심 | very_low |
| 평소보다 적게 | low |
| 평소만큼 | normal |
| 평소보다 많이 | high |
| 매우 많이 마심 | very_high |

---

## 10. 활동/기분 기록

### 10.1 입력 필드

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| recordedAt | datetime | 필수 | 관찰 날짜 및 시간 |
| mood | enum | 필수 | 기분 상태 |
| activityLevel | enum | 필수 | 활동량 |
| tags | array | 선택 | 행동 태그 |
| photos | array | 선택 | 자세, 숨어있는 위치 등 참고 사진 |
| note | string | 선택 | 추가 메모 |

### 10.2 추천 선택지

기분:

- 평온함
- 활발함
- 예민함
- 숨어있음
- 무기력함
- 공격적임
- 불안해 보임

활동량:

- 평소보다 많음
- 평소와 비슷
- 평소보다 적음
- 거의 움직이지 않음

행동 태그:

- 놀이함
- 잠을 많이 잠
- 그루밍 감소
- 과도한 그루밍
- 만지는 것을 싫어함
- 안기 싫어함
- 계속 따라다님

---

## 11. 기타 증상 기록

### 11.1 입력 필드

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| recordedAt | datetime | 필수 | 증상 발생 날짜 및 시간 |
| symptomType | enum | 필수 | 증상 유형 |
| severity | enum | 선택 | 심각도 |
| count | number | 선택 | 횟수 |
| duration | number | 선택 | 지속 시간 |
| photos | array | 선택 | 구토, 피부, 눈곱 등 증상 사진 |
| note | string | 선택 | 추가 메모 |

### 11.2 증상 유형

기본 증상 chip:

- 구토
- 기침
- 재채기
- 울음
- 절뚝거림
- 식욕 저하
- 숨 가쁨
- 침 흘림
- 긁음
- 떨림
- 기타

구토 추가 필드:

- 내용물: 사료 / 물 / 거품 / 털 / 노란 액체 / 피 섞임 / 기타
- 횟수: 1회 / 2회 / 3회 이상
- 식후 발생 여부: 식전 / 식후 30분 이내 / 식후 1시간 이후 / 모름

---

## 12. 화장실 기록

### 12.1 기록 방식

소변과 대변은 항상 별도 기록으로 입력한다. 동시에 본 경우에도 두 개의 기록을 각각 생성한다.

빠른 기록 진입 시 첫 선택: **소변** / **대변**

### 12.2 입력 필드 (공통)

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| recordedAt | datetime | 필수 | 배변/배뇨 날짜 및 시간 |
| toiletType | enum | 필수 | urine / feces |
| amount | enum | 필수 | 양 |
| condition | array | 선택 | 상태 태그 |
| photos | array | 선택 | 배변/배뇨 상태 사진 |
| note | string | 선택 | 추가 메모 |

### 12.3 소변 기록

양:

- 거의 없음
- 작음
- 보통
- 큼
- 매우 큼

상태 chip:

- 평소와 같음
- 색이 진함
- 혈뇨 의심
- 냄새 강함
- 배뇨 시 힘들어함
- 자주 감
- 못 눔

### 12.4 대변 기록

횟수:

- 1회
- 2회
- 3회 이상

크기:

- 작음
- 보통
- 큼

굳기:

- 딱딱함
- 정상
- 무름
- 설사
- 물설사

색/상태 chip:

- 평소와 같음
- 검은색
- 붉은색
- 노란색
- 점액
- 혈변 의심
- 털 많음
- 기생충 의심

---

## 13. 체중 기록

### 13.1 입력 필드

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| recordedAt | datetime | 필수 | 측정 날짜 및 시간 |
| weightKg | number | 필수 | 체중 (kg, 소수점 둘째 자리) |
| measurementContext | enum | 선택 | 자가 측정 / 병원 측정 |
| photos | array | 선택 | 체중계 화면 사진 |
| note | string | 선택 | 추가 메모 |

### 13.2 입력 방식

숫자 직접 입력 (키패드). 소수점 둘째 자리까지 허용 (예: 4.35kg).

### 13.3 활용

- 타임라인에 체중 기록 표시
- 통계 화면에서 날짜별 체중 변화 그래프 제공
- 병원용 요약 화면에 체중 추이 포함
- Error 컬러(#E55D5D)로 이상 감소 알림 표시 (추후 기능)

---

## 14. 데이터 모델

### 14.1 Firestore 컬렉션 구조

```text
users/{userId}
cats/{catId}
cats/{catId}/members/{userId}
cats/{catId}/invites/{inviteId}
cats/{catId}/records/{recordId}
```

공동 보호자 기능이 MVP 필수이므로 `cats`를 최상위 컬렉션으로 두고, `members`로 접근 권한을 관리한다.

### 14.2 사용자/고양이/멤버 모델

```ts
interface AppUser {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: string;
  lastLoginAt: string;
}

interface Cat {
  id: string;
  name: string;
  ownerId: string;
  birthDate?: string;
  sex?: 'male' | 'female' | 'unknown';
  profilePhotoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

type MemberRole = 'owner' | 'caregiver';

interface CatMember {
  userId: string;
  role: MemberRole;
  displayName: string;
  email: string;
  joinedAt: string;
}
```

체중은 Cat 모델에 단일 필드로 두지 않고, Record 유형으로 날짜별 추적한다.

보호자 제한:

- 한 고양이당 `members`는 최대 6명까지 허용한다.
- `owner`는 보호자 초대, 보호자 제거, 고양이 정보 수정, 기록 수정/삭제 권한을 가진다.
- `caregiver`는 기록 생성과 본인이 작성한 기록 수정 권한을 가진다.
- 기록 삭제 권한은 MVP에서 `owner`만 허용한다.

### 14.3 초대 방식

- 앱 안에서 초대 링크 생성 → 카카오톡/메신저로 공유
- 이메일 발송은 MVP에서 제외
- 초대 상태: 대기 / 수락 / 만료 / 취소
- 초대 만료 기본값: 7일
- 6명이 등록된 경우 초대 생성 불가

### 14.4 Record 타입

```ts
type RecordType = 'food' | 'water' | 'mood' | 'symptom' | 'toilet' | 'weight';

interface BaseRecord {
  id: string;
  catId: string;
  userId: string;
  type: RecordType;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  photoUrls?: string[];
  photoMetadata?: PhotoMetadata[];
  note?: string;
}

interface HealthRecord extends BaseRecord {
  details: FoodDetails | WaterDetails | MoodDetails | SymptomDetails | ToiletDetails | WeightDetails;
}
```

WaterDetails 예시:

```ts
interface WaterDetails {
  waterLevel: 'very_low' | 'low' | 'normal' | 'high' | 'very_high';
  measurementType?: 'direct' | 'estimated' | 'dispenser';
  waterAmountMl?: number;
}
```

WeightDetails 예시:

```ts
interface WeightDetails {
  weightKg: number;
  measurementContext?: 'self' | 'clinic';
}
```

ToiletDetails 예시:

```ts
interface ToiletDetails {
  toiletType: 'urine' | 'feces';
  amount: 'none' | 'small' | 'normal' | 'large' | 'very_large';
  condition?: string[];
  // 대변 전용
  count?: 1 | 2 | 3;
  consistency?: 'hard' | 'normal' | 'soft' | 'loose' | 'liquid';
}
```

### 14.5 사진 저장 구조

Firebase Storage 경로:

```text
cats/{catId}/records/{recordId}/{photoId}.jpg
```

사진 요구사항:

- 기록 1개당 최대 5장
- JPG 또는 PNG 허용
- 업로드 전 클라이언트에서 리사이즈 및 압축
- 기본 권장 크기: 긴 변 1600px 이하
- 원본 파일명은 저장하지 않고 UUID 사용

```ts
interface PhotoMetadata {
  id: string;
  url: string;
  storagePath: string;
  width?: number;
  height?: number;
  createdAt: string;
}
```

---

## 15. PWA 요구사항

필수 구성:

- `manifest.webmanifest`
- service worker
- 앱 아이콘
- 오프라인 fallback 및 기록 임시 저장 후 자동 동기화
- 홈 화면 설치 가능 설정
- 모바일 viewport 최적화

iOS 대응:

- `apple-touch-icon`
- `theme-color`: #5FC8A8
- Safari 공유 버튼을 통한 홈 화면 추가 안내
- iOS standalone 모드 스타일 대응

Android 대응:

- Chrome 설치 프롬프트 대응
- 앱 이름: 냥노트
- 배경색: #F9FCFB

---

## 16. UI 방향

스타일 키워드:

- 토스처럼 깔끔함
- 모바일 우선
- 넓은 터치 영역
- 앱 배경 #F9FCFB, 카드 #FFFFFF 중심
- 강한 장식보다 정보 가독성 우선
- 입력 과정은 짧고 명확하게

컴포넌트:

- 하단 탭 내비게이션
- 큰 빠른 기록 버튼
- chip 선택 UI
- segmented control
- Datepicker
- Timepicker
- bottom sheet 입력 폼
- 타임라인 리스트
- 기간 필터
- 증상 필터
- 오프라인 고정 배너 (안 사라지는 토스트)

---

## 17. 자동화 및 고도화 아이디어

### 17.1 자동 요약 (병원 방문용)

- 최근 24시간 먹은 양
- 최근 24시간 음수 수준
- 최근 배변/배뇨 시간
- 최근 구토 횟수
- 최근 식욕 저하 기록
- 평소 대비 활동량 변화
- 체중 변화 추이

### 17.2 이상 징후 알림

규칙 기반 알림 예시:

- 24시간 이상 식사 기록 없음
- 24시간 이상 소변 기록 없음
- 하루 구토 3회 이상
- 식욕 없음이 연속 2회 이상
- 음수 수준이 very_high 기록이 반복됨
- 배뇨 시 힘들어함 태그가 기록됨
- 직전 체중 대비 감소

초기 버전에서는 "진료 권고"가 아니라 "확인 필요" 수준의 문구를 사용한다.

### 17.3 리포트 내보내기

MVP에서는 PDF 생성이 필요하지 않다. 병원 방문 시 앱 화면에서 기간별 기록과 요약을 보여주는 방식을 우선한다.

추후 기능:

- CSV 내보내기
- 기간별 요약 공유
- 병원용 읽기 전용 링크

---

## 18. MVP 개발 범위

### 18.1 MVP에 포함

- Google 로그인
- 고양이 등록/선택
- 공동 보호자 초대/수락
- 보호자 최대 6명 제한
- 사료 기록 (캔/파우치/그릇 단위 포함)
- 음수 기록 (관찰형 chip 기반)
- 활동/기분 기록
- 증상 기록
- 화장실 기록 (소변/대변 항상 분리)
- 체중 기록 (날짜별 추적)
- 기록별 사진 첨부
- 타임라인 조회
- 날짜 필터
- 오프라인 입력 + 자동 동기화
- 오프라인 상태 고정 배너
- Firebase 동기화
- Firebase Storage 연동
- PWA 설치 가능 구성

### 18.2 2차 버전으로 분리

- 알림 자동화
- 통계 그래프 (체중 추이 포함)
- CSV 내보내기
- 다국어
- 동물병원 공유 링크
- PDF 리포트

---

## 19. 개발 단계

1. 프로젝트 세팅
   - Vite + React + TypeScript
   - Tailwind CSS (냥노트 컬러 토큰 설정)
   - Firebase SDK
   - PWA 플러그인

2. 인증 구현
   - Firebase 프로젝트 생성
   - Google 로그인 설정
   - 로그인/로그아웃
   - 사용자 프로필 저장

3. 기본 데이터 구조 구현
   - 고양이 CRUD
   - 보호자 멤버십 구조
   - 초대 링크 생성/수락
   - 기록 CRUD (food / water / mood / symptom / toilet / weight)
   - Firestore 보안 규칙
   - Storage 보안 규칙
   - 오프라인 캐시 및 동기화 처리

4. 기록 입력 UI 구현
   - 공통 Datepicker/Timepicker
   - chip 컴포넌트
   - 사료/음수/활동/증상/화장실/체중 빠른 기록 폼
   - 상세 수정 폼
   - 사진 첨부/미리보기/삭제
   - 오프라인 고정 배너

5. 조회 화면 구현
   - 오늘 요약
   - 타임라인
   - 필터
   - 상세 보기/수정/삭제

6. 보호자 관리 화면
   - 현재 보호자 목록
   - 초대 링크 생성
   - 초대 수락
   - 최대 6명 제한 안내
   - 보호자 제거

7. 병원용 요약 화면
   - 기간 선택
   - 증상 중심 보기
   - 식사/음수/화장실/체중 요약

8. PWA 및 배포
   - manifest 설정 (냥노트, #5FC8A8)
   - service worker
   - GitHub Pages 배포
   - Firebase Auth 도메인 설정

9. QA
   - 모바일 화면 테스트
   - iOS Safari 설치 테스트
   - Android Chrome 설치 테스트
   - 오프라인 입력 → 온라인 복귀 동기화 테스트
   - Firestore 권한 테스트
   - Storage 사진 업로드/조회 권한 테스트
   - 공동 보호자 초대/수락 테스트
