from datetime import datetime

from crud import create_user, get_user_by_username
from database import Base, SessionLocal, engine

Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    if not get_user_by_username(db, "admin1"):
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
    else:
        admin = get_user_by_username(db, "admin1")

    if not get_user_by_username(db, "chieflogi"):
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

print("seed complete")
