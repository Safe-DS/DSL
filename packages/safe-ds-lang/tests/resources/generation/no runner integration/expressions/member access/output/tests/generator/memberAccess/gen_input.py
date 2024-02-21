# Imports ----------------------------------------------------------------------

import safeds_runner.server.pipeline_manager
from typing import Any, TypeVar

# Type variables ---------------------------------------------------------------

__gen_T = TypeVar("__gen_T")

# Utils ------------------------------------------------------------------------

def __gen_null_safe_member_access(receiver: Any, member_name: str) -> __gen_T | None:
    return getattr(receiver, member_name) if receiver is not None else None

# Pipelines --------------------------------------------------------------------

def test():
    f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.memberAccess.g", g, [], []))
    f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.memberAccess.h", h, [], [])[0])
    f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.memberAccess.h", h, [], [])[1])
    f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.memberAccess.C", C, [], []).a)
    f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.memberAccess.C", C, [], []).c)
    f(__gen_null_safe_member_access(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.memberAccess.factory", factory, [], []), 'a'))
    f(__gen_null_safe_member_access(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.memberAccess.factory", factory, [], []), 'c'))
    f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.memberAccess.C.i", lambda *_ : 1.i(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.memberAccess.C", C, [], [])), [1], []))
    f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.memberAccess.C.j", C.j, [safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.memberAccess.C", C, [], []), 123], []))
    f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.memberAccess.C.k2", C.k2, [safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.memberAccess.C", C, [], []), 'abc'], []))
    f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.memberAccess.C.from_csv_file", C.from_csv_file, ['abc.csv'], [safeds_runner.server.pipeline_manager.runner_filemtime('abc.csv')]))
