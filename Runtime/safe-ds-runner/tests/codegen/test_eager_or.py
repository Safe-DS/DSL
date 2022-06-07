import pytest

from safe_ds_runner.codegen import eager_or


@pytest.mark.parametrize(
    "left_operand,right_operand,expected_result",
    [
        (False, False, False),
        (False, True, True),
        (True, False, True),
        (True, True, True),
    ]
)
def test_should_compute_disjunction(left_operand: bool, right_operand: bool, expected_result: bool):
    assert eager_or(left_operand, right_operand) == expected_result


def test_should_evaluate_left_operand_before_right_operand():
    call_order: list[str] = []

    def left() -> bool:
        call_order.append("left")
        return False

    def right() -> bool:
        call_order.append("right")
        return False

    eager_or(left(), right())

    assert call_order == ["left", "right"]


def test_should_always_evaluate_both_operands():
    call_order: list[str] = []

    def left() -> bool:
        call_order.append("left")
        return True

    def right() -> bool:
        call_order.append("right")
        return True

    eager_or(left(), right())

    assert call_order == ["left", "right"]
