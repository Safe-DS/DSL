from typing import Any

import pytest

from safe_ds_runner.codegen import safe_access


# Test data --------------------------------------------------------------------

class __C:
    def __init__(self):
        self.a: int = 1


# Actual tests -----------------------------------------------------------------

@pytest.mark.parametrize(
    "receiver,member_name,expected_result",
    [
        (None, "a", None),
        (__C(), "a", 1),
    ]
)
def test_should_guard_against_member_access_on_none(
        receiver: Any,
        member_name: str,
        expected_result: Any
):
    assert safe_access(receiver, member_name) == expected_result


def test_should_evaluate_receiver_exactly_once():
    call_order: list[str] = []

    def receiver() -> Any:
        call_order.append("call")
        return __C()

    safe_access(receiver(), "a")

    assert len(call_order) == 1


def test_should_raise_exception_if_member_does_not_exist():
    with pytest.raises(AttributeError, match=r"'__C' object has no attribute 'b'"):
        safe_access(__C(), "b")
