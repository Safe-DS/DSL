# Imports ----------------------------------------------------------------------

from tests.generator.partialImpureDependency import fp, i1, iFileWrite, noPartialEvalInt

# Pipelines --------------------------------------------------------------------

def testPipeline():
    i1(1)
    __gen_placeholder_impureFileWrite = iFileWrite()
    __gen_placeholder_impureFileWrite2 = iFileWrite()
    __gen_placeholder_pureValueForImpure2 = noPartialEvalInt(2)
    __gen_placeholder_pureValueForImpure3 = 3
    def __gen_lambda_0():
        i1(1)
        __gen_block_lambda_result_r = 1
        return __gen_block_lambda_result_r
    fp(__gen_lambda_0)
    i1(1)
    __gen_placeholder_impureA1 = i1(__gen_placeholder_pureValueForImpure2)
    __gen_placeholder_impureA2 = i1(noPartialEvalInt(3))
    i1(4)
    __gen_placeholder_result = i1(__gen_placeholder_impureA2)
