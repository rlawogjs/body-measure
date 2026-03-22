from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class UserOut(BaseModel):
    id: int
    username: str
    name: str
    role: str
    rank: str
    unit: str
    approval_status: str
    approval_note: str
    is_primary_logistics: bool
    assigned_logistics_id: Optional[int] = None
    approved_by_id: Optional[int] = None
    assigned_logistics_name: Optional[str] = None
    approved_by_name: Optional[str] = None
    approved_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


class LoginRequest(BaseModel):
    username: str
    password: str


class UserCreate(BaseModel):
    username: str
    password: str
    name: str
    role: str = "soldier"
    rank: str = ""
    unit: str = ""
    assigned_logistics_id: Optional[int] = None


class UserApprovalUpdate(BaseModel):
    action: str
    note: str = ""


class ProfileUpdate(BaseModel):
    assigned_logistics_id: Optional[int] = None


class MeasurementCreate(BaseModel):
    image_id: str = ""
    height_mm: float
    weight_kg: float
    bmi: float
    shoulder_width_mm: float = 0
    upper_body_length_mm: float = 0
    lower_body_length_mm: float = 0
    waist_height_ratio: float = 0
    shoulder_waist_ratio: float = 0
    upper_lower_ratio: float = 0
    note: str = ""


class MeasurementUpdate(BaseModel):
    image_id: Optional[str] = None
    height_mm: Optional[float] = None
    weight_kg: Optional[float] = None
    bmi: Optional[float] = None
    shoulder_width_mm: Optional[float] = None
    upper_body_length_mm: Optional[float] = None
    lower_body_length_mm: Optional[float] = None
    waist_height_ratio: Optional[float] = None
    shoulder_waist_ratio: Optional[float] = None
    upper_lower_ratio: Optional[float] = None
    note: Optional[str] = None


class MeasurementOut(BaseModel):
    id: int
    user_id: int
    image_id: str
    height_mm: float
    weight_kg: float
    bmi: float
    shoulder_width_mm: float
    upper_body_length_mm: float
    lower_body_length_mm: float
    waist_height_ratio: float
    shoulder_waist_ratio: float
    upper_lower_ratio: float
    created_at: datetime
    note: str

    class Config:
        from_attributes = True


class ClothingIssueCreate(BaseModel):
    user_id: int
    item_name: str
    size: str
    quantity: int = Field(default=1, ge=1)
    status: str = "issued"
    note: str = ""


class ClothingIssueOut(BaseModel):
    id: int
    user_id: int
    item_name: str
    size: str
    quantity: int
    status: str
    issued_at: datetime
    note: str

    class Config:
        from_attributes = True


UserOut.model_rebuild()
Token.model_rebuild()
