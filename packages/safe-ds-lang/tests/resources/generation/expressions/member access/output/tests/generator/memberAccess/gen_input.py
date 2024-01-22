# Imports ----------------------------------------------------------------------

import safeds_runner.codegen
import safeds_runner.server.pipeline_manager

# Pipelines --------------------------------------------------------------------

def test():
    f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.memberAccess.g", g, [], []))
    f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.memberAccess.h", h, [], [])[0])
    f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.memberAccess.h", h, [], [])[1])
    f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.memberAccess.C", C, [], []).a)
    f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.memberAccess.C", C, [], []).c)
    f(safeds_runner.codegen.safe_access(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.memberAccess.factory", factory, [], []), 'a'))
    f(safeds_runner.codegen.safe_access(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.memberAccess.factory", factory, [], []), 'c'))
    f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.memberAccess.C.i", lambda *_ : 1.i(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.memberAccess.C", C, [], [])), [1], []))
    f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.memberAccess.C.j", C.j, [safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.memberAccess.C", C, [], []), 123], []))
    f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.memberAccess.C.k2", C.k2, [safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.memberAccess.C", C, [], []), 'abc'], []))
