# Steps ------------------------------------------------------------------------

def testStep():
    g()
    a, _, c = g()
    x, _, _ = g()
    f1(a)
    f1(x)
    return c

# Pipelines --------------------------------------------------------------------

def testPipeline():
    g()
    a, _, _ = g()
    x, _, _ = g()
    f1(a)
    f1(x)
    def __block_lambda_0():
        g()
        a, _, __block_lambda_result_c = g()
        x, _, _ = g()
        f1(a)
        f1(x)
        return __block_lambda_result_c
    f2(__block_lambda_0)
