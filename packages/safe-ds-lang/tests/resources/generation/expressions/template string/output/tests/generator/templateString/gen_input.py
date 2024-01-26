# Imports ----------------------------------------------------------------------

import safeds_runner.server.pipeline_manager

# Pipelines --------------------------------------------------------------------

def test():
    f(f'start\n{ safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.templateString.g", g, [], []) }\ninner { safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.templateString.g", g, [], []) }\nend')
