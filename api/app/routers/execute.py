from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.core.executor import run_code
from app.models.models import User
from app.schemas.schemas import ExecuteRequest, ExecuteResponse

router = APIRouter(prefix="/execute", tags=["execute"])


@router.post("/", response_model=ExecuteResponse)
def execute_code(payload: ExecuteRequest, user: User = Depends(get_current_user)):
    result = run_code(payload.code, payload.language)
    return ExecuteResponse(**result)
