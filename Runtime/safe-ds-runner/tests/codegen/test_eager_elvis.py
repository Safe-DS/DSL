from typing import Any

import pytest

from safe_ds_runner.codegen import eager_elvis


@pytest.mark.parametrize(
    "left_operand,right_operand,expected_result",
    [
        (None, None, None),
        (None, False, False),
        (None, True, True),
        (False, None, False),
        (False, False, False),
        (False, True, False),
        (True, None, True),
        (True, False, True),
        (True, True, True),
    ]
)
def test_should_compute_elvis_operation(left_operand: Any, right_operand: Any, expected_result: Any):
    assert eager_elvis(left_operand, right_operand) == expected_result


def test_should_evaluate_left_operand_before_right_operand():
    call_order: list[str] = []

    def left() -> Any:
        call_order.append("left")
        return None

    def right() -> Any:
        call_order.append("right")
        return None

    eager_elvis(left(), right())

    assert call_order == ["left", "right"]


def test_should_always_evaluate_both_operands():
    call_order: list[str] = []

    def left() -> Any:
        call_order.append("left")
        return True

    def right() -> Any:
        call_order.append("right")
        return True

    eager_elvis(left(), right())

    assert call_order == ["left", "right"]
