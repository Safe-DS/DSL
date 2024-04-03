# Imports ----------------------------------------------------------------------

import safeds_runner
from tests.generator.memberAccessWithRunnerIntegration import C, f, factory, g, h
from typing import Any, TypeVar

# Type variables ---------------------------------------------------------------

__gen_T = TypeVar("__gen_T")

# Utils ------------------------------------------------------------------------

def __gen_null_safe_member_access(receiver: Any, member_name: str) -> __gen_T | None:
    return getattr(receiver, member_name) if receiver is not None else None

# Pipelines --------------------------------------------------------------------

def test():
    f(safeds_runner.memoized_call("tests.generator.memberAccessWithRunnerIntegration.g", g, [], []))
    f(safeds_runner.memoized_call("tests.generator.memberAccessWithRunnerIntegration.h", h, [], [])[0])
    f(safeds_runner.memoized_call("tests.generator.memberAccessWithRunnerIntegration.h", h, [], [])[1])
    f(safeds_runner.memoized_call("tests.generator.memberAccessWithRunnerIntegration.C", C, [], []).a)
    f(safeds_runner.memoized_call("tests.generator.memberAccessWithRunnerIntegration.C", C, [], []).c)
    f(__gen_null_safe_member_access(safeds_runner.memoized_call("tests.generator.memberAccessWithRunnerIntegration.factory", factory, [], []), 'a'))
    f(__gen_null_safe_member_access(safeds_runner.memoized_call("tests.generator.memberAccessWithRunnerIntegration.factory", factory, [], []), 'c'))
    f(safeds_runner.memoized_call("tests.generator.memberAccessWithRunnerIntegration.C.i", lambda *_ : 1.i(safeds_runner.memoized_call("tests.generator.memberAccessWithRunnerIntegration.C", C, [], [])), [1], []))
    f(safeds_runner.memoized_call("tests.generator.memberAccessWithRunnerIntegration.C.j", C.j, [safeds_runner.memoized_call("tests.generator.memberAccessWithRunnerIntegration.C", C, [], []), 123], []))
    f(safeds_runner.memoized_call("tests.generator.memberAccessWithRunnerIntegration.C.k2", C.k2, [safeds_runner.memoized_call("tests.generator.memberAccessWithRunnerIntegration.C", C, [], []), 'abc'], []))
    f(safeds_runner.memoized_call("tests.generator.memberAccessWithRunnerIntegration.C.from_csv_file", C.from_csv_file, ['abc.csv'], [safeds_runner.file_mtime('abc.csv')]))
