# Imports ----------------------------------------------------------------------

import safeds_runner.server.pipeline_manager

# Pipelines --------------------------------------------------------------------

def testPipeline():
    pureValue = noPartialEvalInt(2)
    safeds_runner.server.pipeline_manager.runner_save_placeholder('pureValue', pureValue)
    result = (pureValue) - (1)
    safeds_runner.server.pipeline_manager.runner_save_placeholder('result', result)
