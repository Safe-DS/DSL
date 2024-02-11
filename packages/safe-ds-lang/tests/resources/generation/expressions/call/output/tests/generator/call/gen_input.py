# Imports ----------------------------------------------------------------------

import safeds_runner.server.pipeline_manager
from typing import Any, Callable, TypeVar

# Type variables ---------------------------------------------------------------

__gen_T = TypeVar("__gen_T")

# Utils ------------------------------------------------------------------------

def __gen_null_safe_call(receiver: Any, callable: Callable[[], __gen_T]) -> __gen_T | None:
    return callable() if receiver is not None else None

# Pipelines --------------------------------------------------------------------

def test():
    f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.call.g", lambda *_ : g(1, param2=2), [1, 2], []))
    f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.call.g", lambda *_ : g(2, param2=1), [2, 1], []))
    f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.call.h", lambda *_ : h(1, param_2=2), [1, 2], []))
    f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.call.h", lambda *_ : h(2, param_2=1), [2, 1], []))
    f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.call.h", h, [2, 0], []))
    'abc'.i()
    'abc'.j(123)
    k(456, 1.23)
    __gen_null_safe_call(f, lambda: f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.call.g", lambda *_ : g(1, param2=2), [1, 2], [])))
    __gen_null_safe_call(f, lambda: f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.call.g", lambda *_ : g(2, param2=1), [2, 1], [])))
    __gen_null_safe_call(f, lambda: f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.call.h", lambda *_ : h(1, param_2=2), [1, 2], [])))
    __gen_null_safe_call(f, lambda: f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.call.h", lambda *_ : h(2, param_2=1), [2, 1], [])))
    __gen_null_safe_call(f, lambda: f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.call.h", h, [2, 0], [])))
    __gen_null_safe_call(i, lambda: 'abc'.i())
    __gen_null_safe_call(j, lambda: 'abc'.j(123))
    __gen_null_safe_call(k, lambda: k(456, 1.23))
