from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: EmailStr

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class RoomCreate(BaseModel):
    name: str
    language: str = "python"


class RoomOut(BaseModel):
    id: str
    name: str
    language: str
    owner_id: str

    class Config:
        from_attributes = True


class ExecuteRequest(BaseModel):
    code: str
    language: str  # "python" | "javascript" | "node"


class ExecuteResponse(BaseModel):
    stdout: str
    stderr: str
    exit_code: int | None
    timed_out: bool
    execution_time_ms: int
