# Imports ----------------------------------------------------------------------

import safeds_runner.server.pipeline_manager

# Pipelines --------------------------------------------------------------------

def test():
    f([])
    f([1, 2, 3])
    f([1, safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.lists.h", h, [], []), (safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.lists.h", h, [], [])) + (5)])
