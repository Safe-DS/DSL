# Imports ----------------------------------------------------------------------

import safeds_runner.server.pipeline_manager

# Pipelines --------------------------------------------------------------------

def test():
    f(not (safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.prefixOperation.g", g, [], [])))
    f(-(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.prefixOperation.h", h, [], [])))
