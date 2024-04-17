# Imports ----------------------------------------------------------------------

from tests.generator.partialImpureDependency import fp, i1, iFileWrite, noPartialEvalInt

# Pipelines --------------------------------------------------------------------

def testPipeline():
    i1(1)
    impureFileWrite = iFileWrite()
    impureFileWrite2 = iFileWrite()
    pureValueForImpure2 = noPartialEvalInt(2)
    pureValueForImpure3 = 3
    def __gen_block_lambda_0():
        i1(1)
        __gen_block_lambda_result_r = 1
        return __gen_block_lambda_result_r
    fp(__gen_block_lambda_0)
    i1(1)
    impureA1 = i1(pureValueForImpure2)
    impureA2 = i1(noPartialEvalInt(3))
    i1(4)
    result = i1(impureA2)
