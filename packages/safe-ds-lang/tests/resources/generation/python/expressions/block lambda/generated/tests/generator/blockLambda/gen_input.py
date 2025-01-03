# Imports ----------------------------------------------------------------------

from tests.generator.blockLambda import f1, f2, f3, g, g2

# Pipelines --------------------------------------------------------------------

def test():
    def __gen_lambda_0(a, b=2):
        __gen_block_lambda_result_d = g()
        return __gen_block_lambda_result_d
    f1(__gen_lambda_0)
    def __gen_lambda_1(a, b):
        __gen_block_lambda_result_d = g()
        return __gen_block_lambda_result_d
    f1(__gen_lambda_1)
    def __gen_lambda_2():
        pass
    f2(__gen_lambda_2)
    def __gen_lambda_3(a, b=2):
        __gen_block_lambda_result_d = g()
        return __gen_block_lambda_result_d
    g2(f3(__gen_lambda_3))
    def __gen_lambda_4(a, b=2):
        __gen_block_lambda_result_d = g()
        return __gen_block_lambda_result_d
    __gen_placeholder_c = f3(__gen_lambda_4)
    g2(__gen_placeholder_c)
