# Imports ----------------------------------------------------------------------

from tests.generator.partialImpureDependencyFileConstant import iFileReadA, iFileReadB, iFileWriteA, iFileWriteB

# Pipelines --------------------------------------------------------------------

def testPipeline():
    impureFileWrite = iFileWriteA()
    impureFileWrite2 = iFileWriteA()
    impureFileReadAgain = iFileReadA()
    impureFileWriteB = iFileWriteB()
    impureFileWrite2B = iFileWriteB()
    impureFileReadAgainB = iFileReadB()
    result = (impureFileReadAgain) + (impureFileReadAgainB)
