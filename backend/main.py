from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException, Form
from sqlalchemy.orm import Session

from database import Base, engine, get_db, SessionLocal
from models import User
from schemas import (
    LoginRequest,
    Token,
    UserCreate,
    UserOut,
    MeasurementCreate,
    MeasurementUpdate,
    MeasurementOut,
    ClothingIssueCreate,
    ClothingIssueOut,
)
from crud import (
    create_user,
    get_user_by_username,
    get_users,
    create_measurement,
    get_measurements_by_user,
    get_all_measurements,
    get_measurement,
    update_measurement,
    delete_measurement,
    create_issue,
    get_issues_by_user,
    get_all_issues,
)
from auth import verify_password, create_access_token, get_current_user, require_admin

Base.metadata.create_all(bind=engine)

app = FastAPI(title="B-MAS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def seed_default_users() -> None:
    db = SessionLocal()
    try:
        seed_users = [
            {"username": "admin1", "password": "1234", "name": "관리자", "role": "admin", "rank": "대위", "unit": "정보통신대대"},
            {"username": "logi1", "password": "1234", "name": "군수담당", "role": "logistics", "rank": "중사", "unit": "보급반"},
            {"username": "soldier1", "password": "1234", "name": "병사1", "role": "soldier", "rank": "상병", "unit": "1중대"},
        ]
        for item in seed_users:
            if not get_user_by_username(db, item["username"]):
                create_user(
                    db,
                    username=item["username"],
                    password=item["password"],
                    name=item["name"],
                    role=item["role"],
                    rank=item["rank"],
                    unit=item["unit"],
                )
    finally:
        db.close()


seed_default_users()


@app.get("/")
def root():
    return {"message": "B-MAS API running"}


@app.post("/auth/register", response_model=UserOut)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    exists = get_user_by_username(db, payload.username)
    if exists:
        raise HTTPException(status_code=400, detail="이미 존재하는 아이디입니다.")
    return create_user(
        db,
        username=payload.username,
        password=payload.password,
        name=payload.name,
        role=payload.role,
        rank=payload.rank,
        unit=payload.unit,
    )


@app.post("/auth/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = get_user_by_username(db, payload.username)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 올바르지 않습니다.")
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}


@app.post("/auth/login-form", response_model=Token)
def login_form(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db),
):
    user = get_user_by_username(db, username)
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 올바르지 않습니다.")
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}


@app.get("/auth/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@app.get("/users", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return get_users(db)


@app.post("/measurements", response_model=MeasurementOut)
def save_measurement(payload: MeasurementCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return create_measurement(db, user_id=user.id, data=payload)


@app.get("/measurements/me", response_model=list[MeasurementOut])
def my_measurements(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return get_measurements_by_user(db, user.id)


@app.get("/measurements", response_model=list[MeasurementOut])
def all_measurements(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return get_all_measurements(db)


@app.put("/measurements/{record_id}", response_model=MeasurementOut)
def edit_measurement(record_id: int, payload: MeasurementUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    record = get_measurement(db, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="기록을 찾을 수 없습니다.")
    if user.role not in ["admin", "logistics"] and record.user_id != user.id:
        raise HTTPException(status_code=403, detail="수정 권한이 없습니다.")
    return update_measurement(db, record, payload)


@app.delete("/measurements/{record_id}")
def remove_measurement(record_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    record = get_measurement(db, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="기록을 찾을 수 없습니다.")
    if user.role not in ["admin", "logistics"] and record.user_id != user.id:
        raise HTTPException(status_code=403, detail="삭제 권한이 없습니다.")
    delete_measurement(db, record)
    return {"ok": True}


@app.post("/issues", response_model=ClothingIssueOut)
def save_issue(payload: ClothingIssueCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return create_issue(db, payload)


@app.get("/issues/me", response_model=list[ClothingIssueOut])
def my_issues(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return get_issues_by_user(db, user.id)


@app.get("/issues", response_model=list[ClothingIssueOut])
def all_issues(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return get_all_issues(db)
