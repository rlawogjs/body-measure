from database import SessionLocal, Base, engine
from crud import create_user, get_user_by_username

Base.metadata.create_all(bind=engine)

db = SessionLocal()

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

db.close()
print("seed complete")