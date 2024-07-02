# Imports ----------------------------------------------------------------------

import safeds_runner
from tests.generator.assignmentWithRunnerIntegration import f1, f2, g

# Segments ---------------------------------------------------------------------

def testSegment():
    g()
    __gen_a, _, __gen_yield_c = g()
    __gen_x, _, _ = g()
    f1(__gen_a)
    f1(__gen_x)
    return __gen_yield_c

# Pipelines --------------------------------------------------------------------

def testPipeline():
    g()
    __gen_a, _, _ = g()
    safeds_runner.save_placeholder('a', __gen_a)
    __gen_x, _, _ = g()
    safeds_runner.save_placeholder('x', __gen_x)
    f1(__gen_a)
    f1(__gen_x)
    __gen_l, __gen_m, __gen_n = g()
    safeds_runner.save_placeholder('l', __gen_l)
    safeds_runner.save_placeholder('m', __gen_m)
    safeds_runner.save_placeholder('n', __gen_n)
    f1(__gen_l)
    f1(__gen_m)
    f1(__gen_n)
    def __gen_lambda_0():
        g()
        __gen_a, _, __gen_block_lambda_result_c = g()
        __gen_x, _, _ = g()
        f1(__gen_a)
        f1(__gen_x)
        return __gen_block_lambda_result_c
    f2(__gen_lambda_0)
