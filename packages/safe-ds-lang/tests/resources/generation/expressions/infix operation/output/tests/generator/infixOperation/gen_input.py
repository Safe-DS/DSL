# Imports ----------------------------------------------------------------------

import safeds_runner.server.pipeline_manager
from typing import TypeVar

# Type variables ---------------------------------------------------------------

__gen_T = TypeVar("__gen_T")

# Utils ------------------------------------------------------------------------

def __gen_eager_or(left_operand: bool, right_operand: bool) -> bool:
    return left_operand or right_operand

def __gen_eager_and(left_operand: bool, right_operand: bool) -> bool:
    return left_operand and right_operand

def __gen_eager_elvis(left_operand: __gen_T, right_operand: __gen_T) -> __gen_T:
    return left_operand if left_operand is not None else right_operand

# Pipelines --------------------------------------------------------------------

def test():
    f(__gen_eager_or(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.g", g, [], []), safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.g", g, [], [])))
    f(__gen_eager_and(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.g", g, [], []), safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.g", g, [], [])))
    f((safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])) == (safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])))
    f((safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])) != (safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])))
    f((safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])) is (safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])))
    f((safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])) is not (safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])))
    f((safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])) < (safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])))
    f((safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])) <= (safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])))
    f((safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])) >= (safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])))
    f((safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])) > (safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])))
    f((safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])) + (safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])))
    f((safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])) - (safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])))
    f((safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])) * (safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])))
    f((safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])) / (safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])))
    f(__gen_eager_elvis(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.i", i, [], []), safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.i", i, [], [])))
