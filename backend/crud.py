from datetime import datetime
from sqlalchemy.orm import Session

from auth import hash_password
from models import ClothingIssue, MeasurementRecord, User


def create_user(
    db: Session,
    username: str,
    password: str,
    name: str,
    role: str,
    rank: str,
    unit: str,
    approval_status: str = "pending",
    assigned_logistics_id: int | None = None,
    is_primary_logistics: bool = False,
    approved_by_id: int | None = None,
    approved_at: datetime | None = None,
    approval_note: str = "",
):
    user = User(
        username=username,
        password_hash=hash_password(password),
        name=name,
        role=role,
        rank=rank,
        unit=unit,
        approval_status=approval_status,
        assigned_logistics_id=assigned_logistics_id,
        is_primary_logistics=is_primary_logistics,
        approved_by_id=approved_by_id,
        approved_at=approved_at,
        approval_note=approval_note,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()


def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def get_users(db: Session):
    return db.query(User).order_by(User.created_at.desc(), User.id.desc()).all()


def get_approved_logistics(db: Session):
    return (
        db.query(User)
        .filter(User.role == "logistics", User.approval_status == "approved")
        .order_by(User.is_primary_logistics.desc(), User.name.asc())
        .all()
    )


def get_primary_logistics(db: Session):
    return (
        db.query(User)
        .filter(User.role == "logistics", User.is_primary_logistics.is_(True), User.approval_status == "approved")
        .first()
    )


def create_measurement(db: Session, user_id: int, data):
    record = MeasurementRecord(user_id=user_id, **data.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_measurements_by_user(db: Session, user_id: int):
    return (
        db.query(MeasurementRecord)
        .filter(MeasurementRecord.user_id == user_id)
        .order_by(MeasurementRecord.created_at.desc())
        .all()
    )


def get_all_measurements(db: Session):
    return db.query(MeasurementRecord).order_by(MeasurementRecord.created_at.desc()).all()


def get_measurement(db: Session, record_id: int):
    return db.query(MeasurementRecord).filter(MeasurementRecord.id == record_id).first()


def update_measurement(db: Session, record: MeasurementRecord, data):
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(record, key, value)
    db.commit()
    db.refresh(record)
    return record


def delete_measurement(db: Session, record: MeasurementRecord):
    db.delete(record)
    db.commit()


def create_issue(db: Session, data):
    issue = ClothingIssue(**data.model_dump())
    db.add(issue)
    db.commit()
    db.refresh(issue)
    return issue


def get_issues_by_user(db: Session, user_id: int):
    return (
        db.query(ClothingIssue)
        .filter(ClothingIssue.user_id == user_id)
        .order_by(ClothingIssue.issued_at.desc())
        .all()
    )


def get_all_issues(db: Session):
    return db.query(ClothingIssue).order_by(ClothingIssue.issued_at.desc()).all()
