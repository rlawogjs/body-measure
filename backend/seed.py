from database import Base, SessionLocal, engine
from crud import create_user, get_user_by_username

Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    if not get_user_by_username(db, "admin1"):
        create_user(
            db,
            username="admin1",
            password="1234",
            name="시스템 관리자",
            role="admin",
            rank="대위",
            unit="정보통신대대",
            approved=True,
        )

    if not get_user_by_username(db, "chieflogi"):
        create_user(
            db,
            username="chieflogi",
            password="1234",
            name="대표 군수담당",
            role="chief_logistics",
            rank="중사",
            unit="보급반",
            approved=True,
        )
finally:
    db.close()

print("seed complete")
