from pydantic import BaseModel
from typing import Optional

class CoachProfileResponse(BaseModel):
    id: str
    firstName: str
    lastName: str
    avatar: Optional[str] = None
    bio: Optional[str] = None
    specialization: Optional[str] = None
    experience: Optional[int] = None
    whatsappNumber: Optional[str] = None
    telegramId: Optional[str] = None

    class Config:
        orm_mode = True 