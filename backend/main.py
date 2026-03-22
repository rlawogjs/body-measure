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
    ApproveUserRequest,
    AssignManagerRequest,
)
from crud import (
    create_user,
    get_user_by_username,
    get_user_by_id,
    get_users,
    get_public_managers,
    get_pending_users_for_approver,
    approve_user,
    update_user_manager,
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
from auth import verify_password, create_access_token, get_current_user

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Findfit API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def require_privileged(user: User = Depends(get_current_user)) -> User:
    if user.role not in ["admin", "chief_logistics", "logistics"]:
        raise HTTPException(status_code=403, detail="권한이 없습니다.")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="관리자 권한이 필요합니다.")
    return user


def seed_default_users() -> None:
    db = SessionLocal()
    try:
        if not get_user_by_username(db, "admin1"):
            create_user(
                db,
                username="admin1",
                password="1234",
                name="관리자",
                role="admin",
                rank="관리자",
                unit="본부",
                approved=True,
            )

        if not get_user_by_username(db, "chieflogi"):
            create_user(
                db,
                username="chieflogi",
                password="1234",
                name="대표 군수담당",
                role="chief_logistics",
                rank="주임원사",
                unit="군수지원과",
                approved=True,
            )
    finally:
        db.close()


seed_default_users()


@app.get("/")
def root():
    return {"message": "Findfit API running"}


@app.get("/public/managers", response_model=list[UserOut])
def public_managers(db: Session = Depends(get_db)):
    return get_public_managers(db)


@app.post("/auth/register", response_model=UserOut)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    exists = get_user_by_username(db, payload.username)
    if exists:
        raise HTTPException(status_code=400, detail="이미 존재하는 아이디입니다.")

    approved = False

    if payload.role == "admin":
        raise HTTPException(status_code=403, detail="관리자 계정은 직접 생성할 수 없습니다.")

    if payload.role in ["soldier", "officer"]:
        if not payload.manager_user_id:
            raise HTTPException(status_code=400, detail="담당 군수담당 선택이 필요합니다.")

        manager = get_user_by_id(db, payload.manager_user_id)
        if not manager or manager.role not in ["logistics", "chief_logistics"]:
            raise HTTPException(status_code=400, detail="유효한 군수담당을 선택해주세요.")

    if payload.role == "logistics":
        # 일반 군수담당은 대표 군수담당/관리자 승인 필요
        payload.manager_user_id = None

    return create_user(
        db,
        username=payload.username,
        password=payload.password,
        name=payload.name,
        role=payload.role,
        rank=payload.rank,
        unit=payload.unit,
        manager_user_id=payload.manager_user_id,
        approved=approved,
    )


@app.post("/auth/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = get_user_by_username(db, payload.username)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 올바르지 않습니다.")

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }


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
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }


@app.get("/auth/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@app.get("/users", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_privileged),
):
    return get_users(db)


@app.get("/users/pending", response_model=list[UserOut])
def pending_users(
    db: Session = Depends(get_db),
    approver: User = Depends(require_privileged),
):
    return get_pending_users_for_approver(db, approver)


@app.post("/users/{user_id}/approve", response_model=UserOut)
def approve_target_user(
    user_id: int,
    _: ApproveUserRequest,
    db: Session = Depends(get_db),
    approver: User = Depends(require_privileged),
):
    target_user = get_user_by_id(db, user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    if approver.role == "logistics":
        if target_user.role not in ["soldier", "officer"] or target_user.manager_user_id != approver.id:
            raise HTTPException(status_code=403, detail="이 사용자를 승인할 권한이 없습니다.")

    if approver.role in ["chief_logistics", "admin"]:
        pass

    return approve_user(db, target_user, approver.id)


@app.put("/users/me/manager", response_model=UserOut)
def change_my_manager(
    payload: AssignManagerRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role not in ["soldier", "officer"]:
        raise HTTPException(status_code=403, detail="병사 또는 간부만 담당 군수담당을 변경할 수 있습니다.")

    manager = get_user_by_id(db, payload.manager_user_id)
    if not manager or manager.role not in ["logistics", "chief_logistics"]:
        raise HTTPException(status_code=400, detail="유효한 군수담당을 선택해주세요.")

    return update_user_manager(db, user, payload.manager_user_id)


@app.post("/measurements", response_model=MeasurementOut)
def save_measurement(
    payload: MeasurementCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return create_measurement(db, user_id=user.id, data=payload)


@app.get("/measurements/me", response_model=list[MeasurementOut])
def my_measurements(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return get_measurements_by_user(db, user.id)


@app.get("/measurements", response_model=list[MeasurementOut])
def all_measurements(
    db: Session = Depends(get_db),
    _: User = Depends(require_privileged),
):
    return get_all_measurements(db)


@app.put("/measurements/{record_id}", response_model=MeasurementOut)
def edit_measurement(
    record_id: int,
    payload: MeasurementUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    record = get_measurement(db, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="기록을 찾을 수 없습니다.")

    if user.role not in ["admin", "chief_logistics", "logistics"] and record.user_id != user.id:
        raise HTTPException(status_code=403, detail="수정 권한이 없습니다.")

    return update_measurement(db, record, payload)


@app.delete("/measurements/{record_id}")
def remove_measurement(
    record_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    record = get_measurement(db, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="기록을 찾을 수 없습니다.")

    if user.role not in ["admin", "chief_logistics", "logistics"] and record.user_id != user.id:
        raise HTTPException(status_code=403, detail="삭제 권한이 없습니다.")

    delete_measurement(db, record)
    return {"ok": True}


@app.post("/issues", response_model=ClothingIssueOut)
def save_issue(
    payload: ClothingIssueCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_privileged),
):
    return create_issue(db, payload)


@app.get("/issues/me", response_model=list[ClothingIssueOut])
def my_issues(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return get_issues_by_user(db, user.id)


@app.get("/issues", response_model=list[ClothingIssueOut])
def all_issues(
    db: Session = Depends(get_db),
    _: User = Depends(require_privileged),
):
    return get_all_issues(db)