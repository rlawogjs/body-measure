from sqlalchemy.orm import Session

from auth import hash_password
from models import User, MeasurementRecord, ClothingIssue


def create_user(
    db: Session,
    username: str,
    password: str,
    name: str,
    role: str,
    rank: str | None = None,
    unit: str | None = None,
    manager_user_id: int | None = None,
    approved: bool = False,
    approved_by_user_id: int | None = None,
):
    user = User(
        username=username,
        password_hash=hash_password(password),
        name=name,
        role=role,
        rank=rank,
        unit=unit,
        manager_user_id=manager_user_id,
        approved=approved,
        approved_by_user_id=approved_by_user_id,
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
    return db.query(User).order_by(User.id.asc()).all()


def get_public_managers(db: Session):
    return (
        db.query(User)
        .filter(User.role.in_(["logistics", "chief_logistics"]), User.approved == True)
        .order_by(User.id.asc())
        .all()
    )


def get_pending_users_for_approver(db: Session, approver: User):
    query = db.query(User).filter(User.approved == False, User.role != "admin")

    if approver.role == "admin" or approver.role == "chief_logistics":
        return query.order_by(User.id.asc()).all()

    if approver.role == "logistics":
        return (
            query.filter(
                User.role.in_(["soldier", "officer"]),
                User.manager_user_id == approver.id,
            )
            .order_by(User.id.asc())
            .all()
        )

    return []


def approve_user(db: Session, target_user: User, approved_by_user_id: int):
    target_user.approved = True
    target_user.approved_by_user_id = approved_by_user_id
    db.commit()
    db.refresh(target_user)
    return target_user


def update_user_manager(db: Session, target_user: User, manager_user_id: int):
    target_user.manager_user_id = manager_user_id
    target_user.approved = False
    target_user.approved_by_user_id = None
    db.commit()
    db.refresh(target_user)
    return target_user


def create_measurement(db: Session, user_id: int, data):
    record = MeasurementRecord(
        user_id=user_id,
        height_mm=data.height_mm,
        weight_kg=data.weight_kg,
        chest_cm=data.chest_cm,
        waist_cm=data.waist_cm,
        bmi=data.bmi,
    )
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


def update_measurement(db: Session, record: MeasurementRecord, payload):
    for field in ["height_mm", "weight_kg", "chest_cm", "waist_cm", "bmi"]:
        value = getattr(payload, field)
        if value is not None:
            setattr(record, field, value)

    db.commit()
    db.refresh(record)
    return record


def delete_measurement(db: Session, record: MeasurementRecord):
    db.delete(record)
    db.commit()


def create_issue(db: Session, payload):
    issue = ClothingIssue(
        user_id=payload.user_id,
        item_name=payload.item_name,
        size=payload.size,
        quantity=payload.quantity,
        status=payload.status,
        note=payload.note,
    )
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