from typing import TypeVar, Generic, Union, Callable
from dataclasses import dataclass

T = TypeVar('T')

@dataclass
class Failure:
    error: str

class Result(Generic[T]):
    def __init__(self, value: Union[T, Failure]):
        self._value = value
        self._is_error = isinstance(value, Failure)

    @staticmethod
    def ok(value: T) -> 'Result[T]':
        return Result(value)

    @staticmethod
    def fail(error: str) -> 'Result[T]':
        return Result(Failure(error))

    def fold(self, on_fail: Callable[[str], T], on_success: Callable[[T], T]) -> T:
        if self._is_error:
            return on_fail(self._value.error)
        return on_success(self._value) 