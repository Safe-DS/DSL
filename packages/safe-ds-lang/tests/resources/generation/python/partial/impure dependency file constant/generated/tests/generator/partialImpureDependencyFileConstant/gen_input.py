# Imports ----------------------------------------------------------------------

from tests.generator.partialImpureDependencyFileConstant import iFileReadA, iFileReadB, iFileWriteA, iFileWriteB

# Pipelines --------------------------------------------------------------------

def testPipeline():
    __gen_placeholder_impureFileWrite = iFileWriteA()
    __gen_placeholder_impureFileWrite2 = iFileWriteA()
    __gen_placeholder_impureFileReadAgain = iFileReadA()
    __gen_placeholder_impureFileWriteB = iFileWriteB()
    __gen_placeholder_impureFileWrite2B = iFileWriteB()
    __gen_placeholder_impureFileReadAgainB = iFileReadB()
    __gen_placeholder_result = (__gen_placeholder_impureFileReadAgain) + (__gen_placeholder_impureFileReadAgainB)
