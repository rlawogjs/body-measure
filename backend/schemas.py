from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class UserCreate(BaseModel):
    username: str
    password: str
    name: str
    role: str
    rank: Optional[str] = None
    unit: Optional[str] = None
    manager_user_id: Optional[int] = None


class UserOut(BaseModel):
    id: int
    username: str
    name: str
    role: str
    rank: Optional[str] = None
    unit: Optional[str] = None
    approved: bool
    manager_user_id: Optional[int] = None
    approved_by_user_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


class MeasurementCreate(BaseModel):
    height_mm: Optional[float] = None
    weight_kg: Optional[float] = None
    chest_cm: Optional[float] = None
    waist_cm: Optional[float] = None
    bmi: Optional[float] = None


class MeasurementUpdate(BaseModel):
    height_mm: Optional[float] = None
    weight_kg: Optional[float] = None
    chest_cm: Optional[float] = None
    waist_cm: Optional[float] = None
    bmi: Optional[float] = None


class MeasurementOut(BaseModel):
    id: int
    user_id: int
    height_mm: Optional[float] = None
    weight_kg: Optional[float] = None
    chest_cm: Optional[float] = None
    waist_cm: Optional[float] = None
    bmi: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ClothingIssueCreate(BaseModel):
    user_id: int
    item_name: str
    size: str
    quantity: int = 1
    status: str = "issued"
    note: Optional[str] = None


class ClothingIssueOut(BaseModel):
    id: int
    user_id: int
    item_name: str
    size: str
    quantity: int
    status: str
    note: Optional[str] = None
    issued_at: datetime

    class Config:
        from_attributes = True


class ApproveUserRequest(BaseModel):
    approved: bool = True


class AssignManagerRequest(BaseModel):
    manager_user_id: int