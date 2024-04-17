# Imports ----------------------------------------------------------------------

from tests.generator.assignment.main import f1, f2, g

# Segments ---------------------------------------------------------------------

def testSegment():
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
    l, m, n = g()
    f1(l)
    f1(m)
    f1(n)
    def __gen_block_lambda_0():
        g()
        a, _, __gen_block_lambda_result_c = g()
        x, _, _ = g()
        f1(a)
        f1(x)
        return __gen_block_lambda_result_c
    f2(__gen_block_lambda_0)
