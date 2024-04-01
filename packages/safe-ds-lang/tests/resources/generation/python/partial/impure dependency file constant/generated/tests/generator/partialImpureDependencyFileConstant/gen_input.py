# Pipelines --------------------------------------------------------------------

def testPipeline():
    impureFileWrite = iFileWriteA()
    impureFileWrite2 = iFileWriteA()
    impureFileReadAgain = iFileReadA()
    impureFileWriteB = iFileWriteB()
    impureFileWrite2B = iFileWriteB()
    impureFileReadAgainB = iFileReadB()
    result = (impureFileReadAgain) + (impureFileReadAgainB)
