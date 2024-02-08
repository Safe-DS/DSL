# Imports ----------------------------------------------------------------------

from typing import Any, TypeVar

# Utils ------------------------------------------------------------------------

def __gen_eager_or(left_operand: bool, right_operand: bool) -> bool:
    return left_operand or right_operand

def __gen_eager_and(left_operand: bool, right_operand: bool) -> bool:
    return left_operand and right_operand

__gen_S = TypeVar("__gen_S")

def __gen_safe_access(receiver: Any, member_name: str) -> __gen_S | None:
    return getattr(receiver, member_name) if receiver is not None else None

__gen_T = TypeVar("__gen_T")

def __gen_eager_elvis(left_operand: __gen_T, right_operand: __gen_T) -> __gen_T:
    return left_operand if left_operand is not None else right_operand

# Pipelines --------------------------------------------------------------------

def test():
    f(__gen_eager_or(g(), g()))
    f(__gen_eager_and(g(), g()))
    f(__gen_safe_access(factory(), 'a'))
    f(__gen_safe_access(factory(), 'c'))
    f(__gen_eager_elvis(i(), i()))
