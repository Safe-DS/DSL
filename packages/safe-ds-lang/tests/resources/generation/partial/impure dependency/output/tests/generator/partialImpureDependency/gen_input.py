# Imports ----------------------------------------------------------------------

import safeds_runner.server.pipeline_manager

# Pipelines --------------------------------------------------------------------

def testPipeline():
    i1(1)
    impureFileWrite = iFileWrite()
    safeds_runner.server.pipeline_manager.runner_save_placeholder('impureFileWrite', impureFileWrite)
    impureFileWrite2 = iFileWrite()
    safeds_runner.server.pipeline_manager.runner_save_placeholder('impureFileWrite2', impureFileWrite2)
    pureValueForImpure2 = noPartialEvalInt(2)
    safeds_runner.server.pipeline_manager.runner_save_placeholder('pureValueForImpure2', pureValueForImpure2)
    pureValueForImpure3 = 3
    safeds_runner.server.pipeline_manager.runner_save_placeholder('pureValueForImpure3', pureValueForImpure3)
    def __gen_block_lambda_0():
        i1(1)
        __gen_block_lambda_result_r = 1
        return __gen_block_lambda_result_r
    fp(__gen_block_lambda_0)
    i1(1)
    impureA1 = i1(pureValueForImpure2)
    safeds_runner.server.pipeline_manager.runner_save_placeholder('impureA1', impureA1)
    impureA2 = i1(noPartialEvalInt(3))
    safeds_runner.server.pipeline_manager.runner_save_placeholder('impureA2', impureA2)
    i1(4)
    result = i1(impureA2)
    safeds_runner.server.pipeline_manager.runner_save_placeholder('result', result)
