from typing import TypeVar, Callable
from fastapi import HTTPException, status
from app.core.errors import Result

T = TypeVar('T')

def handle_result(service_call: Callable[[], Result[T]]) -> T:
    def raise_error(error: str) -> T:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
        
    return service_call().fold(
        on_fail=raise_error,
        on_success=lambda data: data
    ) 