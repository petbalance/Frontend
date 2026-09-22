# petbalance Frontend

React + TypeScript + Vite 프런트엔드입니다. 기존 PetBalance/backend 저장소의
`frontend/`를 기준으로 분리했습니다.

## 개발과 빌드

```sh
npm ci
npm run dev
npm run build
```

개발 API는 `http://127.0.0.1:8756`으로 프록시됩니다.
로그인 화면의 서버 주소 설정과 기존 API 경로는 그대로 유지합니다.

## 운영 배포

현재 운영 프로젝트는 Vercel `petbalance-ai`이며 FastAPI와 프런트엔드를
함께 배포합니다. 정적 프런트엔드만으로 기존 운영 프로젝트를 덮어쓰면
API가 사라지므로, 배포 시 PetBalance/backend의 기존 서버·데이터·Vercel
설정을 유지하고 이 저장소의 소스를 배포 디렉터리의 `frontend/`에 넣으세요.
Vercel 프로젝트의 기존 환경변수를 그대로 사용합니다.

이 저장소에 push하는 것만으로 Vercel 자동 배포 연결이 설정되지는 않습니다.
현재 배포는 위 통합 배포 디렉터리에서 Vercel CLI로 수행합니다.

## 디자인 변경

2026-09-19: 로그인 카드·입력창·선택 탭의 간격과 형태, 하단 메뉴 및 카드의
표현을 정리했습니다. 기능 코드는 변경하지 않았습니다.
