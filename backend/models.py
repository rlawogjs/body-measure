from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)

    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # admin / chief_logistics / logistics / soldier / officer
    rank = Column(String, nullable=True)
    unit = Column(String, nullable=True)

    approved = Column(Boolean, default=False, nullable=False)

    # 병사/간부가 선택한 담당 군수담당
    manager_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # 누가 승인했는지
    approved_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    manager = relationship(
        "User",
        foreign_keys=[manager_user_id],
        remote_side=[id],
        post_update=True,
    )

    approved_by = relationship(
        "User",
        foreign_keys=[approved_by_user_id],
        remote_side=[id],
        post_update=True,
    )


class MeasurementRecord(Base):
    __tablename__ = "measurement_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    height_mm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    chest_cm = Column(Float, nullable=True)
    waist_cm = Column(Float, nullable=True)
    bmi = Column(Float, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User")


class ClothingIssue(Base):
    __tablename__ = "clothing_issues"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    item_name = Column(String, nullable=False)
    size = Column(String, nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    status = Column(String, default="issued", nullable=False)  # issued / recommended / pending
    note = Column(Text, nullable=True)

    issued_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User")