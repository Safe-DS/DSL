# Imports ----------------------------------------------------------------------

import safeds_runner.server.pipeline_manager

# Pipelines --------------------------------------------------------------------

def testPipeline():
    pureValue = safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.partialRedundantImpurity.noPartialEvalInt", noPartialEvalInt, [2], [])
    safeds_runner.server.pipeline_manager.runner_save_placeholder('pureValue', pureValue)
    result = (pureValue) - (1)
    safeds_runner.server.pipeline_manager.runner_save_placeholder('result', result)
