# Imports ----------------------------------------------------------------------

import safeds_runner.server.pipeline_manager

# Pipelines --------------------------------------------------------------------

def test():
    def __gen_block_lambda_0(a, b=2):
        __gen_block_lambda_result_d = g()
        return __gen_block_lambda_result_d
    f1(__gen_block_lambda_0)
    def __gen_block_lambda_1(a, b):
        __gen_block_lambda_result_d = g()
        return __gen_block_lambda_result_d
    f1(__gen_block_lambda_1)
    def __gen_block_lambda_2():
        pass
    f2(__gen_block_lambda_2)
    def __gen_block_lambda_3(a, b=2):
        __gen_block_lambda_result_d = g()
        return __gen_block_lambda_result_d
    g2(f3(__gen_block_lambda_3))
    def __gen_block_lambda_4(a, b=2):
        __gen_block_lambda_result_d = g()
        return __gen_block_lambda_result_d
    c = f3(__gen_block_lambda_4)
    safeds_runner.server.pipeline_manager.runner_save_placeholder('c', c)
    g2(c)
