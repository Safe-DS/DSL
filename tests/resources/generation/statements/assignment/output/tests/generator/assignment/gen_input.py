# Steps ------------------------------------------------------------------------

def testStep():
    g()
    a, _, __gen_yield_c = g()
    x, _, _ = g()
    f1(a)
    f1(x)
    return __gen_yield_c

# Pipelines --------------------------------------------------------------------

def testPipeline():
    g()
    a, _, _ = g()
    x, _, _ = g()
    f1(a)
    f1(x)
    def __gen_block_lambda_0():
        g()
        a, _, __gen_block_lambda_result_c = g()
        x, _, _ = g()
        f1(a)
        f1(x)
        return __gen_block_lambda_result_c
    f2(__gen_block_lambda_0)
