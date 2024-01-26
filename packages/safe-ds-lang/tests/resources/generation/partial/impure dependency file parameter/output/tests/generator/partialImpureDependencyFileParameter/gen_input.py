# Imports ----------------------------------------------------------------------

import safeds_runner.server.pipeline_manager

# Pipelines --------------------------------------------------------------------

def testPipeline():
    impureFileWrite = iFileWrite('b.txt')
    safeds_runner.server.pipeline_manager.runner_save_placeholder('impureFileWrite', impureFileWrite)
    impureFileWrite2 = iFileWrite('c.txt')
    safeds_runner.server.pipeline_manager.runner_save_placeholder('impureFileWrite2', impureFileWrite2)
    impureFileReadAgain = safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.partialImpureDependencyFileParameter.iFileRead", iFileRead, ['d.txt'], [safeds_runner.server.pipeline_manager.runner_filemtime('d.txt')])
    safeds_runner.server.pipeline_manager.runner_save_placeholder('impureFileReadAgain', impureFileReadAgain)
    result = (impureFileReadAgain) + (2)
    safeds_runner.server.pipeline_manager.runner_save_placeholder('result', result)
