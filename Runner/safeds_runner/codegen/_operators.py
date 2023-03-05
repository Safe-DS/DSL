from __future__ import annotations

from typing import Any, Optional, TypeVar


def eager_or(left_operand: bool, right_operand: bool) -> bool:
    return left_operand or right_operand


def eager_and(left_operand: bool, right_operand: bool) -> bool:
    return left_operand and right_operand


Elvis_T = TypeVar("Elvis_T")


def eager_elvis(left_operand: Elvis_T, right_operand: Elvis_T) -> Elvis_T:
    return left_operand if left_operand is not None else right_operand


Safe_Access_T = TypeVar("Safe_Access_T")


def safe_access(receiver: Any, member_name: str) -> Optional[Safe_Access_T]:
    return getattr(receiver, member_name) if receiver is not None else None
