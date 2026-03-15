from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    role = Column(String(30), default="soldier", nullable=False)
    rank = Column(String(30), default="", nullable=False)
    unit = Column(String(100), default="", nullable=False)

    measurements = relationship("MeasurementRecord", back_populates="user", cascade="all, delete-orphan")
    clothing_issues = relationship("ClothingIssue", back_populates="user", cascade="all, delete-orphan")


class MeasurementRecord(Base):
    __tablename__ = "measurement_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    image_id = Column(String(100), default="")
    height_mm = Column(Float, nullable=False)
    weight_kg = Column(Float, nullable=False)
    bmi = Column(Float, nullable=False)

    shoulder_width_mm = Column(Float, default=0)
    upper_body_length_mm = Column(Float, default=0)
    lower_body_length_mm = Column(Float, default=0)

    waist_height_ratio = Column(Float, default=0)
    shoulder_waist_ratio = Column(Float, default=0)
    upper_lower_ratio = Column(Float, default=0)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    note = Column(Text, default="")

    user = relationship("User", back_populates="measurements")


class ClothingIssue(Base):
    __tablename__ = "clothing_issues"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    item_name = Column(String(100), nullable=False)
    size = Column(String(30), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    status = Column(String(30), default="issued", nullable=False)
    issued_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    note = Column(Text, default="")

    user = relationship("User", back_populates="clothing_issues")