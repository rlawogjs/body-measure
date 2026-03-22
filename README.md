# B-MAS 리팩터링 버전

이 압축본은 **A안 기준**으로 정리되어 있습니다.

- 프론트엔드: Vercel 배포용 React
- 백엔드: 별도 FastAPI 서버 배포용
- 계정 구조:
  - 관리자: 기본 시드 계정 1개
  - 대표 군수담당: 기본 시드 계정 1개
  - 군수담당 / 병사 / 간부: 회원가입으로 생성
- 승인 구조:
  - 병사 / 간부 → 선택한 군수담당 승인 필요
  - 군수담당 → 대표 군수담당 또는 관리자 승인 필요
- 병사 / 간부는 로그인 후에도 담당 군수담당을 변경 요청할 수 있음

## 기본 시드 계정

- 관리자: `admin1 / 1234`
- 대표 군수담당: `chieflogi / 1234`

## 프론트 로컬 실행

```bash
cp .env.example .env
npm install
npm start
```

## 백엔드 로컬 실행

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
rm -f bmas.db
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Vercel 배포용 환경변수

프론트 프로젝트에 아래 환경변수를 넣습니다.

```env
REACT_APP_API_BASE_URL=https://your-backend-domain.example.com
```

백엔드는 Render / Railway / EC2 / VPS 등 별도 서버에 배포하는 전제를 둡니다.
