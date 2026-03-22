from datetime import datetime

from fastapi import Depends, FastAPI, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from auth import create_access_token, get_current_user, require_admin, verify_password
from crud import (
    create_issue,
    create_measurement,
    create_user,
    delete_measurement,
    get_all_issues,
    get_all_measurements,
    get_approved_logistics,
    get_issues_by_user,
    get_measurement,
    get_measurements_by_user,
    get_primary_logistics,
    get_user_by_id,
    get_user_by_username,
    get_users,
    update_measurement,
)
from database import Base, SessionLocal, engine, get_db
from models import User
from schemas import (
    ClothingIssueCreate,
    ClothingIssueOut,
    LoginRequest,
    MeasurementCreate,
    MeasurementOut,
    MeasurementUpdate,
    ProfileUpdate,
    Token,
    UserApprovalUpdate,
    UserCreate,
    UserOut,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="B-MAS API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


VALID_ROLES = {"soldier", "officer", "logistics"}


def to_user_out(user: User | None):
    if user is None:
        return None
    return UserOut(
        id=user.id,
        username=user.username,
        name=user.name,
        role=user.role,
        rank=user.rank,
        unit=user.unit,
        approval_status=user.approval_status,
        approval_note=user.approval_note,
        is_primary_logistics=bool(user.is_primary_logistics),
        assigned_logistics_id=user.assigned_logistics_id,
        approved_by_id=user.approved_by_id,
        assigned_logistics_name=user.assigned_logistics.name if user.assigned_logistics else None,
        approved_by_name=user.approved_by.name if user.approved_by else None,
        approved_at=user.approved_at,
        created_at=user.created_at,
    )


def seed_default_users() -> None:
    db = SessionLocal()
    try:
        admin = get_user_by_username(db, "admin1")
        if not admin:
            admin = create_user(
                db,
                username="admin1",
                password="1234",
                name="시스템 관리자",
                role="admin",
                rank="대위",
                unit="정보통신대대",
                approval_status="approved",
                approved_at=datetime.utcnow(),
            )
        chief = get_user_by_username(db, "chieflogi")
        if not chief:
            create_user(
                db,
                username="chieflogi",
                password="1234",
                name="대표 군수담당",
                role="logistics",
                rank="중사",
                unit="보급반",
                approval_status="approved",
                is_primary_logistics=True,
                approved_by_id=admin.id,
                approved_at=datetime.utcnow(),
                approval_note="초기 대표 군수담당 계정",
            )
    finally:
        db.close()


seed_default_users()


@app.get("/")
def root():
    return {"message": "B-MAS API running"}


@app.get("/logistics/options", response_model=list[UserOut])
def logistics_options(db: Session = Depends(get_db)):
    return [to_user_out(user) for user in get_approved_logistics(db)]


@app.post("/auth/register", response_model=UserOut)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if payload.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail="회원가입 가능한 역할이 아닙니다.")
    if get_user_by_username(db, payload.username):
        raise HTTPException(status_code=400, detail="이미 존재하는 아이디입니다.")

    assigned_logistics_id = payload.assigned_logistics_id
    approval_note = "승인 대기 중입니다."

    if payload.role in {"soldier", "officer"}:
        if assigned_logistics_id is not None:
            logistics_user = get_user_by_id(db, assigned_logistics_id)
            if not logistics_user or logistics_user.role != "logistics" or logistics_user.approval_status != "approved":
                raise HTTPException(status_code=400, detail="선택한 군수담당을 사용할 수 없습니다.")
        approval_note = "선택한 군수담당의 승인을 기다리고 있습니다."

    if payload.role == "logistics":
        assigned_logistics_id = None
        primary = get_primary_logistics(db)
        approval_note = (
            f"대표 군수담당({primary.name}) 승인 대기 중입니다." if primary else "대표 군수담당 승인 대기 중입니다."
        )

    user = create_user(
        db,
        username=payload.username,
        password=payload.password,
        name=payload.name,
        role=payload.role,
        rank=payload.rank,
        unit=payload.unit,
        approval_status="pending",
        assigned_logistics_id=assigned_logistics_id,
        approval_note=approval_note,
    )
    return to_user_out(user)


@app.post("/auth/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = get_user_by_username(db, payload.username)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 올바르지 않습니다.")
    if user.approval_status != "approved":
        raise HTTPException(status_code=403, detail=f"계정이 아직 승인되지 않았습니다. 현재 상태: {user.approval_status}")
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": to_user_out(user)}


@app.post("/auth/login-form", response_model=Token)
def login_form(username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    return login(LoginRequest(username=username, password=password), db)


@app.get("/auth/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return to_user_out(user)


@app.patch("/auth/profile", response_model=UserOut)
def update_profile(payload: ProfileUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.role not in {"soldier", "officer"}:
        raise HTTPException(status_code=400, detail="병사와 간부만 군수담당을 변경할 수 있습니다.")
    if payload.assigned_logistics_id is None:
        raise HTTPException(status_code=400, detail="군수담당을 선택해야 합니다.")

    logistics_user = get_user_by_id(db, payload.assigned_logistics_id)
    if not logistics_user or logistics_user.role != "logistics" or logistics_user.approval_status != "approved":
        raise HTTPException(status_code=400, detail="선택한 군수담당을 사용할 수 없습니다.")

    user.assigned_logistics_id = logistics_user.id
    if user.approval_status == "approved":
        user.approval_status = "pending"
    user.approval_note = f"군수담당 변경 요청: {logistics_user.name} 승인 대기"
    user.approved_by_id = None
    user.approved_at = None
    db.commit()
    db.refresh(user)
    return to_user_out(user)


@app.get("/users", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return [to_user_out(user) for user in get_users(db)]


@app.get("/approvals/queue", response_model=list[UserOut])
def approval_queue(db: Session = Depends(get_db), user: User = Depends(require_admin)):
    pending_users = [candidate for candidate in get_users(db) if candidate.approval_status == "pending" and candidate.id != user.id]
    if user.role == "admin":
        return [to_user_out(candidate) for candidate in pending_users]

    if user.is_primary_logistics:
        allowed = []
        for candidate in pending_users:
            if candidate.role == "logistics":
                allowed.append(candidate)
            elif candidate.role in {"soldier", "officer"} and candidate.assigned_logistics_id == user.id:
                allowed.append(candidate)
        return [to_user_out(candidate) for candidate in allowed]

    allowed = [
        candidate
        for candidate in pending_users
        if candidate.role in {"soldier", "officer"} and candidate.assigned_logistics_id == user.id
    ]
    return [to_user_out(candidate) for candidate in allowed]


@app.post("/approvals/users/{target_user_id}", response_model=UserOut)
def update_user_approval(
    target_user_id: int,
    payload: UserApprovalUpdate,
    db: Session = Depends(get_db),
    actor: User = Depends(require_admin),
):
    target = get_user_by_id(db, target_user_id)
    if not target:
        raise HTTPException(status_code=404, detail="대상 사용자를 찾을 수 없습니다.")
    if target.id == actor.id:
        raise HTTPException(status_code=400, detail="자기 자신의 승인은 변경할 수 없습니다.")

    if payload.action not in {"approve", "reject"}:
        raise HTTPException(status_code=400, detail="지원하지 않는 승인 작업입니다.")

    if actor.role == "logistics" and not actor.is_primary_logistics and target.role == "logistics":
        raise HTTPException(status_code=403, detail="일반 군수담당은 군수담당 계정을 승인할 수 없습니다.")
    if actor.role == "logistics" and target.role in {"soldier", "officer"} and target.assigned_logistics_id != actor.id:
        raise HTTPException(status_code=403, detail="배정된 병사/간부만 승인할 수 있습니다.")
    if actor.role == "logistics" and actor.is_primary_logistics and target.role == "logistics" and target.id == actor.id:
        raise HTTPException(status_code=403, detail="자기 자신은 승인할 수 없습니다.")

    target.approval_status = "approved" if payload.action == "approve" else "rejected"
    target.approved_by_id = actor.id
    target.approved_at = datetime.utcnow() if payload.action == "approve" else None
    target.approval_note = payload.note or ("승인 완료" if payload.action == "approve" else "반려되었습니다.")

    if target.role == "logistics" and target.approval_status == "approved" and not target.is_primary_logistics:
        target.assigned_logistics_id = None

    db.commit()
    db.refresh(target)
    return to_user_out(target)


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
