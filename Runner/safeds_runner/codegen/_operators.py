from __future__ import annotations

from typing import Any, TypeVar

T = TypeVar("T")


def eager_or(left_operand: bool, right_operand: bool) -> bool:
    return left_operand or right_operand


def eager_and(left_operand: bool, right_operand: bool) -> bool:
    return left_operand and right_operand


def eager_elvis(left_operand: T, right_operand: T) -> T:
    return left_operand if left_operand is not None else right_operand


def safe_access(receiver: Any, member_name: str) -> T | None:
    return getattr(receiver, member_name) if receiver is not None else None
