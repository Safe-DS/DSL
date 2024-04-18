# Imports ----------------------------------------------------------------------

import safeds_runner
from tests.generator.runnerIntegration.expressions.calls.main import f, g, h, i, j, k, l, m, readFile
from typing import Any, Callable, TypeVar

# Type variables ---------------------------------------------------------------

__gen_T = TypeVar("__gen_T")

# Utils ------------------------------------------------------------------------

def __gen_null_safe_call(receiver: Any, callable: Callable[[], __gen_T]) -> __gen_T | None:
    return callable() if receiver is not None else None

# Segments ---------------------------------------------------------------------

def segment_a(a):
    __gen_yield_result = (a) * (2)
    return __gen_yield_result

# Pipelines --------------------------------------------------------------------

def test():
    f(safeds_runner.memoized_static_call("tests.generator.runnerIntegration.expressions.calls.main.g", lambda *_ : g(1, param2=2), [1, 2], []))
    f(safeds_runner.memoized_static_call("tests.generator.runnerIntegration.expressions.calls.main.g", lambda *_ : g(2, param2=1), [2, 1], []))
    f(safeds_runner.memoized_static_call("tests.generator.runnerIntegration.expressions.calls.main.h", lambda *_ : h(1, param_2=2), [1, 2], []))
    f(safeds_runner.memoized_static_call("tests.generator.runnerIntegration.expressions.calls.main.h", lambda *_ : h(2, param_2=1), [2, 1], []))
    f(safeds_runner.memoized_static_call("tests.generator.runnerIntegration.expressions.calls.main.h", h, [2, 0], []))
    'abc'.i()
    'abc'.j(123)
    k(456, 1.23)
    __gen_null_safe_call(f, lambda: f(safeds_runner.memoized_static_call("tests.generator.runnerIntegration.expressions.calls.main.g", lambda *_ : g(1, param2=2), [1, 2], [])))
    __gen_null_safe_call(f, lambda: f(safeds_runner.memoized_static_call("tests.generator.runnerIntegration.expressions.calls.main.g", lambda *_ : g(2, param2=1), [2, 1], [])))
    __gen_null_safe_call(f, lambda: f(safeds_runner.memoized_static_call("tests.generator.runnerIntegration.expressions.calls.main.h", lambda *_ : h(1, param_2=2), [1, 2], [])))
    __gen_null_safe_call(f, lambda: f(safeds_runner.memoized_static_call("tests.generator.runnerIntegration.expressions.calls.main.h", lambda *_ : h(2, param_2=1), [2, 1], [])))
    __gen_null_safe_call(f, lambda: f(safeds_runner.memoized_static_call("tests.generator.runnerIntegration.expressions.calls.main.h", h, [2, 0], [])))
    __gen_null_safe_call(i, lambda: 'abc'.i())
    __gen_null_safe_call(j, lambda: 'abc'.j(123))
    __gen_null_safe_call(k, lambda: k(456, 1.23))
    f(safeds_runner.memoized_static_call("tests.generator.runnerIntegration.expressions.calls.main.readFile", readFile, [], [safeds_runner.file_mtime('a.txt')]))
    f(l(lambda a: segment_a(a)))
    f(l(lambda a: (3) * (segment_a(a))))
    f(l(lambda a: safeds_runner.memoized_static_call("tests.generator.runnerIntegration.expressions.calls.main.m", m, [(3) * (segment_a(a))], [])))
    f(l(lambda a: (3) * (safeds_runner.memoized_static_call("tests.generator.runnerIntegration.expressions.calls.main.m", m, [safeds_runner.memoized_static_call("tests.generator.runnerIntegration.expressions.calls.main.m", m, [(3) * (segment_a(a))], [])], []))))
    def __gen_lambda_0(a):
        __gen_block_lambda_result_result = segment_a(a)
        return __gen_block_lambda_result_result
    f(l(__gen_lambda_0))
    def __gen_lambda_1(a):
        __gen_block_lambda_result_result = safeds_runner.memoized_static_call("tests.generator.runnerIntegration.expressions.calls.main.m", m, [segment_a(a)], [])
        return __gen_block_lambda_result_result
    f(l(__gen_lambda_1))
    f(safeds_runner.memoized_static_call("tests.generator.runnerIntegration.expressions.calls.main.l", l, [lambda a: (3) * (a)], []))
    def __gen_lambda_2(a):
        __gen_block_lambda_result_result = (3) * (safeds_runner.memoized_static_call("tests.generator.runnerIntegration.expressions.calls.main.m", m, [a], []))
        return __gen_block_lambda_result_result
    f(safeds_runner.memoized_static_call("tests.generator.runnerIntegration.expressions.calls.main.l", l, [__gen_lambda_2], []))
