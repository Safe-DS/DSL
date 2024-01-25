# Imports ----------------------------------------------------------------------

import safeds_runner.server.pipeline_manager

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
