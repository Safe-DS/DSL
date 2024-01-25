# Imports ----------------------------------------------------------------------

import safeds_runner.server.pipeline_manager

# Segments ---------------------------------------------------------------------

def f1(l):
    h(l(1, 2))

def f2(l):
    h(l(1, 2)[1])
    h(l(1, 2)[0])

# Pipelines --------------------------------------------------------------------

def test():
    def __gen_block_lambda_0(a, b):
        __gen_block_lambda_result_d = safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.blockLambdaResult.g", g, [], [])
        return __gen_block_lambda_result_d
    f1(__gen_block_lambda_0)
    def __gen_block_lambda_1(a, b):
        __gen_block_lambda_result_d = safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.blockLambdaResult.g", g, [], [])
        __gen_block_lambda_result_e = safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.blockLambdaResult.g", g, [], [])
        return __gen_block_lambda_result_d, __gen_block_lambda_result_e
    f2(__gen_block_lambda_1)
