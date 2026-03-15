from sqlalchemy.orm import Session
from models import User, MeasurementRecord, ClothingIssue
from auth import hash_password


def create_user(db: Session, username: str, password: str, name: str, role: str, rank: str, unit: str):
    user = User(
        username=username,
        password_hash=hash_password(password),
        name=name,
        role=role,
        rank=rank,
        unit=unit,
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
    return db.query(User).order_by(User.id.desc()).all()


def create_measurement(db: Session, user_id: int, data):
    record = MeasurementRecord(user_id=user_id, **data.dict())
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
    for key, value in data.dict(exclude_unset=True).items():
        setattr(record, key, value)
    db.commit()
    db.refresh(record)
    return record


def delete_measurement(db: Session, record: MeasurementRecord):
    db.delete(record)
    db.commit()


def create_issue(db: Session, data):
    issue = ClothingIssue(**data.dict())
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