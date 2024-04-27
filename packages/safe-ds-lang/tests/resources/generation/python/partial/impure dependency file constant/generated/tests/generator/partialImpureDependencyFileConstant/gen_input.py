# Imports ----------------------------------------------------------------------

from tests.generator.partialImpureDependencyFileConstant import iFileReadA, iFileReadB, iFileWriteA, iFileWriteB

# Pipelines --------------------------------------------------------------------

def testPipeline():
    __gen_impureFileWrite = iFileWriteA()
    __gen_impureFileWrite2 = iFileWriteA()
    __gen_impureFileReadAgain = iFileReadA()
    __gen_impureFileWriteB = iFileWriteB()
    __gen_impureFileWrite2B = iFileWriteB()
    __gen_impureFileReadAgainB = iFileReadB()
    __gen_result = (__gen_impureFileReadAgain) + (__gen_impureFileReadAgainB)
