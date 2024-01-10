# Imports ----------------------------------------------------------------------

import safeds_runner.server.pipeline_manager

# Pipelines --------------------------------------------------------------------

def testPipeline():
    impureFileWrite = iFileWriteA()
    safeds_runner.server.pipeline_manager.runner_save_placeholder('impureFileWrite', impureFileWrite)
    impureFileWrite2 = iFileWriteA()
    safeds_runner.server.pipeline_manager.runner_save_placeholder('impureFileWrite2', impureFileWrite2)
    impureFileReadAgain = iFileReadA()
    safeds_runner.server.pipeline_manager.runner_save_placeholder('impureFileReadAgain', impureFileReadAgain)
    impureFileWriteB = iFileWriteB()
    safeds_runner.server.pipeline_manager.runner_save_placeholder('impureFileWriteB', impureFileWriteB)
    impureFileWrite2B = iFileWriteB()
    safeds_runner.server.pipeline_manager.runner_save_placeholder('impureFileWrite2B', impureFileWrite2B)
    impureFileReadAgainB = iFileReadB()
    safeds_runner.server.pipeline_manager.runner_save_placeholder('impureFileReadAgainB', impureFileReadAgainB)
    result = (impureFileReadAgain) + (impureFileReadAgainB)
    safeds_runner.server.pipeline_manager.runner_save_placeholder('result', result)
