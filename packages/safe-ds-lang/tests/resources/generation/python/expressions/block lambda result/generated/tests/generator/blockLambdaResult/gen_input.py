# Imports ----------------------------------------------------------------------

from tests.generator.blockLambdaResult import g, h

# Segments ---------------------------------------------------------------------

def f1(l):
    h(l(1, 2))

def f2(l):
    h(l(1, 2)[1])
    h(l(1, 2)[0])

# Pipelines --------------------------------------------------------------------

def test():
    def __gen_lambda_0(a, b):
        __gen_block_lambda_result_d = g()
        return __gen_block_lambda_result_d
    f1(__gen_lambda_0)
    def __gen_lambda_1(a, b):
        __gen_block_lambda_result_d = g()
        __gen_block_lambda_result_e = g()
        return __gen_block_lambda_result_d, __gen_block_lambda_result_e
    f2(__gen_lambda_1)
