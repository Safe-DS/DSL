# Imports ----------------------------------------------------------------------

import safeds_runner.server.pipeline_manager

# Pipelines --------------------------------------------------------------------

def test():
    g1({})
    g1({'a': 1.2, 'b': 1.0})
    g1({safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.maps.h2", h2, [], []): -0.5, 'b': safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.maps.h1", h1, [], [])})
    g2({1.2: 'a', 1.0: 'b'})
    g2({5.6: 'c', safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.maps.h1", h1, [], []): safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.maps.h2", h2, [], [])})
